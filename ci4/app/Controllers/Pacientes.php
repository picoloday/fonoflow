<?php

namespace App\Controllers;

use App\Models\PacienteModel;
use App\Models\SesionModel;
use App\Config\AppConfig;

class Pacientes extends BaseController
{
    private PacienteModel $model;

    public function __construct()
    {
        $this->model = new PacienteModel();
    }

    // Lista de pacientes
    public function index(): string
    {
        $soloActivos = $this->request->getGet('activo') !== '0';
        $busqueda    = $this->request->getGet('q') ?? '';

        $pacientes = $this->model->listar($soloActivos);

        // Filtro por búsqueda
        if ($busqueda !== '') {
            $q = mb_strtolower($busqueda);
            $pacientes = array_filter($pacientes, function ($p) use ($q) {
                if (strpos(mb_strtolower($p['nombre']), $q) !== false) return true;
                foreach ($p['patologias'] as $pat) {
                    if (strpos(mb_strtolower($pat), $q) !== false) return true;
                }
                return false;
            });
        }

        return view('pacientes/index', [
            'titulo'     => 'Pacientes',
            'pacientes'  => array_values($pacientes),
            'soloActivos' => $soloActivos,
            'busqueda'   => $busqueda,
        ]);
    }

    // Formulario nuevo paciente
    public function nuevo(): string
    {
        return view('pacientes/form', [
            'titulo'     => 'Nuevo Paciente',
            'paciente'   => null,
            'patologias' => $this->obtenerPatologiasDisponibles(),
            'accion'     => 'nuevo',
        ]);
    }

    // Guardar nuevo paciente
    public function guardar()
    {
        $data = $this->procesarFormulario();

        if (!$this->validate($this->reglasValidacion())) {
            return view('pacientes/form', [
                'titulo'     => 'Nuevo Paciente',
                'paciente'   => $data,
                'patologias' => $this->obtenerPatologiasDisponibles(),
                'accion'     => 'nuevo',
                'errores'    => $this->validator->getErrors(),
            ]);
        }

        $id = $this->model->crear($data);
        return redirect()->to('/pacientes/' . $id)->with('exito', 'Paciente creado correctamente.');
    }

    // Ver paciente
    public function ver(int $id): string
    {
        $paciente = $this->model->obtener($id);
        if (!$paciente) return redirect()->to('/pacientes')->with('error', 'Paciente no encontrado.');

        $sesionModel = new SesionModel();
        $historial   = $sesionModel->historialPaciente($id);

        return view('pacientes/detalle', [
            'titulo'   => $paciente['nombre'],
            'paciente' => $paciente,
            'historial' => $historial,
        ]);
    }

    // Formulario editar
    public function editar(int $id): string
    {
        $paciente = $this->model->obtener($id);
        if (!$paciente) return redirect()->to('/pacientes')->with('error', 'Paciente no encontrado.');

        return view('pacientes/form', [
            'titulo'     => 'Editar: ' . $paciente['nombre'],
            'paciente'   => $paciente,
            'patologias' => $this->obtenerPatologiasDisponibles(),
            'accion'     => 'editar',
        ]);
    }

    // Actualizar paciente
    public function actualizar(int $id)
    {
        $paciente = $this->model->obtener($id);
        if (!$paciente) return redirect()->to('/pacientes')->with('error', 'Paciente no encontrado.');

        $data = $this->procesarFormulario();

        if (!$this->validate($this->reglasValidacion())) {
            return view('pacientes/form', [
                'titulo'     => 'Editar: ' . $paciente['nombre'],
                'paciente'   => array_merge($paciente, $data),
                'patologias' => $this->obtenerPatologiasDisponibles(),
                'accion'     => 'editar',
                'errores'    => $this->validator->getErrors(),
            ]);
        }

        $this->model->actualizar($id, $data);
        return redirect()->to('/pacientes/' . $id)->with('exito', 'Paciente actualizado.');
    }

    // Eliminar paciente
    public function eliminar(int $id)
    {
        $this->model->eliminar($id);
        return redirect()->to('/pacientes')->with('exito', 'Paciente eliminado.');
    }

    // -------------------------------------------------------
    private function procesarFormulario(): array
    {
        $rawPat = $this->request->getPost('patologias') ?? [];
        $patologias = array_values(array_unique(array_filter(array_map('trim', $rawPat), fn($p) => $p !== '')));
        $objetivos  = array_values(array_filter(
            $this->request->getPost('objetivos') ?? [],
            fn($o) => trim($o) !== ''
        ));

        return [
            'nombre'           => $this->request->getPost('nombre'),
            'tutor'            => $this->request->getPost('tutor') ?: null,
            'telefono'         => $this->request->getPost('telefono') ?: null,
            'email'            => $this->request->getPost('email') ?: null,
            'fecha_nacimiento' => $this->request->getPost('fecha_nacimiento') ?: null,
            'notas'            => $this->request->getPost('notas') ?: null,
            'activo'           => $this->request->getPost('activo') ? 1 : 0,
            'patologias'       => $patologias,
            'objetivos_generales' => $objetivos,
        ];
    }

    private function reglasValidacion(): array
    {
        return [
            'nombre' => 'required|min_length[2]|max_length[255]',
        ];
    }

    // -------------------------------------------------------
    // Helpers
    // -------------------------------------------------------
    /**
     * devuelve la lista de patologías que se mostrará en el formulario,
     * incluyendo las configuradas por defecto y las que ya existen en la DB.
     */
    private function obtenerPatologiasDisponibles(): array
    {
        $defecto = AppConfig::$patologias;
        $db = $this->model->getPatologiasUnicas();
        $lista = array_unique(array_merge($defecto, $db));
        sort($lista);
        return $lista;
    }
}
