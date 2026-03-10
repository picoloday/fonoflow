<?php

namespace App\Controllers;

use App\Models\SesionModel;
use App\Models\PacienteModel;
use App\Config\AppConfig;
use CodeIgniter\HTTP\ResponseInterface;

class Sesiones extends BaseController
{
    private SesionModel $model;

    public function __construct()
    {
        $this->model = new SesionModel();
    }

    // Lista agrupada por mes con ingresos
    public function index(): string
    {
        $sesiones = $this->model->listar();

        // Agrupar por mes
        $porMes = [];
        $totalIngresos = 0;
        foreach ($sesiones as $s) {
            $mes = substr($s['fecha'], 0, 7); // YYYY-MM
            if (!isset($porMes[$mes])) {
                $porMes[$mes] = ['sesiones' => [], 'ingresos' => 0];
            }
            $porMes[$mes]['sesiones'][] = $s;
            $porMes[$mes]['ingresos']  += (float)$s['precio'];
            $totalIngresos             += (float)$s['precio'];
        }

        krsort($porMes);

        return view('sesiones/index', [
            'titulo'        => 'Sesiones',
            'porMes'        => $porMes,
            'totalSesiones' => count($sesiones),
            'totalIngresos' => $totalIngresos,
            'mesMeses'      => array_keys($porMes),
        ]);
    }

    // Formulario nueva sesión
    public function nueva(): string
    {
        $pacienteModel = new PacienteModel();
        $pacienteId    = $this->request->getGet('paciente_id');
        $paciente      = $pacienteId ? $pacienteModel->obtener((int)$pacienteId) : null;
        $fechaPrefill  = $this->request->getGet('fecha') ?? date('Y-m-d');

        return view('sesiones/form', [
            'titulo'     => 'Nueva Sesión',
            'sesion'     => null,
            'pacientes'  => $pacienteModel->listar(true),
            'duraciones' => AppConfig::$duraciones,
            'materiales' => $this->model->getMaterialesUnicos(),
            'paciente'   => $paciente,
            'fecha'      => $fechaPrefill,
            'accion'     => 'nueva',
        ]);
    }

    // Guardar nueva sesión
    public function guardar()
    {
        $data = $this->procesarFormulario();

        if (!$this->validate($this->reglasValidacion())) {
            $pacienteModel = new PacienteModel();
            return view('sesiones/form', [
                'titulo'     => 'Nueva Sesión',
                'sesion'     => $data,
                'pacientes'  => $pacienteModel->listar(true),
                'duraciones' => AppConfig::$duraciones,
                'materiales' => $this->model->getMaterialesUnicos(),
                'accion'     => 'nueva',
                'errores'    => $this->validator->getErrors(),
            ]);
        }

        $id = $this->model->crear($data);
        return redirect()->to('/sesiones/' . $id)->with('exito', 'Sesión registrada correctamente.');
    }

    // Ver detalle sesión
    public function ver(int $id): string
    {
        $sesion = $this->model->obtener($id);
        if (!$sesion) return redirect()->to('/sesiones')->with('error', 'Sesión no encontrada.');

        $pacienteModel = new PacienteModel();
        $paciente      = $pacienteModel->obtener($sesion['paciente_id']);

        return view('sesiones/detalle', [
            'titulo'     => 'Detalle de Sesión',
            'sesion'     => $sesion,
            'paciente'   => $paciente,
            'materiales' => $this->model->getMaterialesUnicos(),
        ]);
    }

    // Formulario editar
    public function editar(int $id): string
    {
        $sesion = $this->model->obtener($id);
        if (!$sesion) return redirect()->to('/sesiones')->with('error', 'Sesión no encontrada.');

        $pacienteModel = new PacienteModel();

        return view('sesiones/form', [
            'titulo'     => 'Editar Sesión',
            'sesion'     => $sesion,
            'pacientes'  => $pacienteModel->listar(true),
            'duraciones' => AppConfig::$duraciones,
            'materiales' => $this->model->getMaterialesUnicos(),
            'accion'     => 'editar',
        ]);
    }

    // Actualizar sesión
    public function actualizar(int $id)
    {
        $sesion = $this->model->obtener($id);
        if (!$sesion) return redirect()->to('/sesiones')->with('error', 'Sesión no encontrada.');

        $data = $this->procesarFormulario();

        if (!$this->validate($this->reglasValidacion())) {
            $pacienteModel = new PacienteModel();
            return view('sesiones/form', [
                'titulo'     => 'Editar Sesión',
                'sesion'     => array_merge($sesion, $data),
                'pacientes'  => $pacienteModel->listar(true),
                'duraciones' => AppConfig::$duraciones,
                'materiales' => $this->model->getMaterialesUnicos(),
                'accion'     => 'editar',
                'errores'    => $this->validator->getErrors(),
            ]);
        }

        $this->model->actualizar($id, $data);
        return redirect()->to('/sesiones/' . $id)->with('exito', 'Sesión actualizada.');
    }

    // Eliminar sesión
    public function eliminar(int $id)
    {
        $this->model->eliminar($id);
        return redirect()->to('/sesiones')->with('exito', 'Sesión eliminada.');
    }

    // Info de paciente + última sesión (AJAX para el formulario)
    public function infoPaciente(int $id): ResponseInterface
    {
        $pacienteModel = new PacienteModel();
        $paciente      = $pacienteModel->obtener($id);

        if (!$paciente) {
            return $this->response->setJSON(['error' => true]);
        }

        $ultima = $this->model->getUltima($id);

        return $this->response->setJSON([
            'patologias'          => $paciente['patologias'],
            'objetivos_generales' => $paciente['objetivos_generales'],
            'ultima_sesion'       => $ultima ? [
                'fecha'      => $ultima['fecha'],
                'hora'       => $ultima['hora_inicio'] ? substr($ultima['hora_inicio'], 0, 5) : null,
                'objetivos'  => $ultima['objetivos'],
                'actividades'=> $ultima['actividades'],
            ] : null,
        ]);
    }

    // Toggle objetivo (AJAX)
    public function toggleObjetivo(int $sesionId, int $objetivoId): ResponseInterface
    {
        $this->model->toggleObjetivo($sesionId, $objetivoId);
        $objetivos = $this->model->getObjetivos($sesionId);
        return $this->response->setJSON(['ok' => true, 'objetivos' => $objetivos]);
    }

    // -------------------------------------------------------
    private function procesarFormulario(): array
    {
        $objetivos  = array_values(array_filter(
            $this->request->getPost('objetivos') ?? [],
            fn($o) => trim($o) !== ''
        ));
        $actividades = array_values(array_filter(
            $this->request->getPost('actividades') ?? [],
            fn($a) => trim($a) !== ''
        ));
        $materiales  = array_values(array_filter(
            $this->request->getPost('materiales') ?? [],
            fn($m) => trim($m) !== ''
        ));

        $fechaHora   = $this->request->getPost('fecha_hora') ?? '';
        $fechaParsed = $fechaHora ? substr($fechaHora, 0, 10) : null;
        $horaParsed  = strlen($fechaHora) >= 16 ? substr($fechaHora, 11, 5) : null;

        return [
            'paciente_id'  => (int)$this->request->getPost('paciente_id'),
            'cita_id'      => $this->request->getPost('cita_id') ?: null,
            'fecha'        => $fechaParsed,
            'hora_inicio'  => $horaParsed,
            'duracion'     => (int)$this->request->getPost('duracion'),
            'precio'       => (float)$this->request->getPost('precio'),
            'evolutivo'    => $this->request->getPost('evolutivo') ?: null,
            'observaciones'=> $this->request->getPost('observaciones') ?: null,
            'objetivos'    => $objetivos,
            'actividades'  => $actividades,
            'materiales'   => $materiales,
        ];
    }

    private function reglasValidacion(): array
    {
        return [
            'paciente_id' => 'required|is_natural_no_zero',
            'fecha_hora'  => 'required',
            'duracion'    => 'required|in_list[30,45,60]',
        ];
    }
}
