<?php

namespace App\Controllers;

use App\Models\CitaModel;
use App\Models\PacienteModel;
use App\Models\SesionModel;
use App\Config\AppConfig;
use CodeIgniter\HTTP\ResponseInterface;

class Citas extends BaseController
{
    private CitaModel $model;

    public function __construct()
    {
        $this->model = new CitaModel();
    }

    // Agenda visual — calendario mensual + detalle del día seleccionado
    public function index(): string
    {
        $today = date('Y-m-d');
        $fecha = $this->request->getGet('fecha') ?? $today;
        $mes   = $this->request->getGet('mes')   ?? substr($fecha, 0, 7);

        // Si la fecha no pertenece al mes visible, resetear al 1º del mes
        if (substr($fecha, 0, 7) !== $mes) {
            $fecha = $mes . '-01';
        }

        [$anio, $numMes] = explode('-', $mes);
        $primerDia = "$mes-01";
        $mesPrev   = date('Y-m', strtotime('-1 month', strtotime($primerDia)));
        $mesNext   = date('Y-m', strtotime('+1 month', strtotime($primerDia)));
        $diasEnMes = (int)date('t', strtotime($primerDia));

        // Cuadrícula mensual (lunes–domingo, semanas completas)
        $diaSemana  = (int)date('N', strtotime($primerDia)); // 1=Lun … 7=Dom
        $startTs    = strtotime("$primerDia -" . ($diaSemana - 1) . ' days');
        $totalCells = (int)ceil(($diasEnMes + $diaSemana - 1) / 7) * 7;
        $calDias    = [];
        for ($i = 0; $i < $totalCells; $i++) {
            $calDias[] = date('Y-m-d', strtotime("+$i days", $startTs));
        }
        $semanas = array_chunk($calDias, 7);

        // Citas del mes (ligeras, para puntos de colores)
        $citasPorDia = $this->model->listarMes($mes);

        // Citas del día seleccionado con detalle completo → slots de timeline
        $citasDia = $this->model->listar($fecha);
        $slots    = [];
        $inicio   = strtotime(CitaModel::HORA_INICIO);
        $fin      = strtotime(CitaModel::HORA_FIN);
        for ($t = $inicio; $t < $fin; $t += CitaModel::INTERVALO * 60) {
            $hora     = date('H:i', $t);
            $citaSlot = null;
            foreach ($citasDia as $c) {
                if ($c['hora_inicio'] === $hora) { $citaSlot = $c; break; }
            }
            $slots[$hora] = $citaSlot;
        }

        // Sesiones sin cita vinculada (creadas directamente) → agregar al timeline
        $sesionModel = new SesionModel();
        foreach ($sesionModel->listarDia($fecha) as $s) {
            $hora = $s['hora_inicio'];
            if (!isset($slots[$hora])) {
                $slots[$hora] = array_merge($s, ['_tipo' => 'sesion', 'estado' => 'realizada']);
            }
        }
        ksort($slots);

        // Añadir sesiones del mes a los puntos del calendario
        foreach ($sesionModel->listarMes($mes) as $dia => $items) {
            foreach ($items as $item) {
                $citasPorDia[$dia][] = $item;
            }
        }

        $mesesNombres = [
            '01' => 'enero',    '02' => 'febrero',   '03' => 'marzo',
            '04' => 'abril',    '05' => 'mayo',       '06' => 'junio',
            '07' => 'julio',    '08' => 'agosto',     '09' => 'septiembre',
            '10' => 'octubre',  '11' => 'noviembre',  '12' => 'diciembre',
        ];

        return view('citas/index', [
            'titulo'      => 'Agenda',
            'today'       => $today,
            'fecha'       => $fecha,
            'mes'         => $mes,
            'anio'        => $anio,
            'numMes'      => $numMes,
            'mesNombre'   => $mesesNombres[$numMes] ?? $numMes,
            'mesPrev'     => $mesPrev,
            'mesNext'     => $mesNext,
            'semanas'     => $semanas,
            'citasPorDia' => $citasPorDia,
            'slots'       => $slots,
            'horaInicio'  => CitaModel::HORA_INICIO,
            'horaFin'     => CitaModel::HORA_FIN,
            'estados'     => AppConfig::$estados,
        ]);
    }

    // Formulario nueva cita
    public function nueva(): string
    {
        $pacienteModel = new PacienteModel();
        $prefFecha = $this->request->getGet('fecha') ?? date('Y-m-d');
        $prefHora  = $this->request->getGet('hora') ?? '';

        return view('citas/form', [
            'titulo'      => 'Nueva Sesión',
            'cita'        => null,
            'pacientes'   => $pacienteModel->listar(true),
            'duraciones'  => AppConfig::$duraciones,
            'accion'      => 'nueva',
            'prefFecha'   => $prefFecha,
            'prefHora'    => $prefHora,
        ]);
    }

    // Guardar nueva cita
    public function guardar()
    {
        $data = $this->procesarFormulario();

        if (!$this->validate($this->reglasValidacion())) {
            $pacienteModel = new PacienteModel();
            return view('citas/form', [
                'titulo'     => 'Nueva Sesión',
                'cita'       => $data,
                'pacientes'  => $pacienteModel->listar(true),
                'duraciones' => AppConfig::$duraciones,
                'accion'     => 'nueva',
                'errores'    => $this->validator->getErrors(),
                'prefFecha'   => $data['fecha'] ?? ($this->request->getGet('fecha') ?? date('Y-m-d')),
                'prefHora'    => $data['hora_inicio'] ?? ($this->request->getGet('hora') ?? ''),
            ]);
        }

        $id = $this->model->crear($data);
        return redirect()->to('/citas/' . $id)->with('exito', 'Sesión programada correctamente.');
    }

    // Ver detalle de cita
    public function ver(int $id): string
    {
        $cita = $this->model->obtener($id);
        if (!$cita) return redirect()->to('/agenda')->with('error', 'Sesión no encontrada.');

        $pacienteModel = new PacienteModel();
        $paciente      = $pacienteModel->obtener($cita['paciente_id']);

        return view('citas/detalle', [
            'titulo'        => 'Detalle de Sesión',
            'cita'          => $cita,
            'paciente'      => $paciente,
            'estados'       => AppConfig::$estados,
            'motivosAusencia' => AppConfig::$motivosAusencia,
        ]);
    }

    // Formulario editar
    public function editar(int $id): string
    {
        $cita = $this->model->obtener($id);
        if (!$cita) return redirect()->to('/agenda')->with('error', 'Sesión no encontrada.');

        $pacienteModel = new PacienteModel();

        return view('citas/form', [
            'titulo'     => 'Editar Sesión',
            'cita'       => $cita,
            'pacientes'  => $pacienteModel->listar(true),
            'duraciones' => AppConfig::$duraciones,
            'accion'     => 'editar',
            'prefFecha'  => $cita['fecha'],
            'prefHora'   => $cita['hora_inicio'],
        ]);
    }

    // Actualizar cita
    public function actualizar(int $id)
    {
        $cita = $this->model->obtener($id);
        if (!$cita) return redirect()->to('/agenda')->with('error', 'Sesión no encontrada.');

        $data = $this->procesarFormulario();

        if (!$this->validate($this->reglasValidacion())) {
            $pacienteModel = new PacienteModel();
            return view('citas/form', [
                'titulo'     => 'Editar Sesión',
                'cita'       => array_merge($cita, $data),
                'pacientes'  => $pacienteModel->listar(true),
                'duraciones' => AppConfig::$duraciones,
                'accion'     => 'editar',
                'errores'    => $this->validator->getErrors(),
                'prefFecha'  => $data['fecha'] ?? $cita['fecha'],
                'prefHora'   => $data['hora_inicio'] ?? $cita['hora_inicio'],
            ]);
        }

        $this->model->actualizar($id, $data);
        return redirect()->to('/citas/' . $id)->with('exito', 'Sesión actualizada.');
    }

    // Marcar asistencia (POST)
    public function asistencia(int $id)
    {
        $asistio    = $this->request->getPost('asistio') === '1';
        $motivo     = $this->request->getPost('motivo_ausencia') ?: null;
        $reprogramar = $this->request->getPost('reprogramar') === '1';

        $this->model->marcarAsistencia($id, $asistio, $motivo, $reprogramar);

        // Si asistió → crear sesión automáticamente
        if ($asistio) {
            $cita = $this->model->obtener($id);
            $sesionModel = new SesionModel();
            $sesionId = $sesionModel->crear([
                'paciente_id' => $cita['paciente_id'],
                'cita_id'     => $id,
                'fecha'       => $cita['fecha'],
                'duracion'    => $cita['duracion'],
                'precio'      => $cita['precio'],
                'objetivos'   => array_map(fn($o) => ['objetivo' => $o, 'cumplido' => 0], $cita['objetivos']),
                'materiales'  => $cita['materiales'],
                'actividades' => [],
            ]);
            return redirect()->to('/sesiones/' . $sesionId)->with('exito', 'Asistencia marcada. Completa el registro de la sesión.');
        }

        return redirect()->to('/citas/' . $id)->with('exito', 'Ausencia registrada.');
    }

    // Cancelar cita
    public function cancelar(int $id)
    {
        $this->model->update($id, ['estado' => 'cancelada']);
        return redirect()->to('/citas/' . $id)->with('exito', 'Sesión cancelada.');
    }

    // Eliminar cita
    public function eliminar(int $id)
    {
        $this->model->eliminar($id);
        return redirect()->to('/agenda')->with('exito', 'Sesión eliminada.');
    }

    // Huecos libres (AJAX)
    public function huecos(string $fecha): ResponseInterface
    {
        $data = $this->model->getHuecosLibres($fecha);
        return $this->response->setJSON($data);
    }

    // -------------------------------------------------------
    private function procesarFormulario(): array
    {
        $filter = fn($v) => trim($v) !== '';

        $objetivos   = array_values(array_filter($this->request->getPost('objetivos')   ?? [], $filter));
        $actividades = array_values(array_filter($this->request->getPost('actividades') ?? [], $filter));
        $materiales  = array_values(array_filter($this->request->getPost('materiales')  ?? [], $filter));

        return [
            'paciente_id' => (int)$this->request->getPost('paciente_id'),
            'fecha'       => $this->request->getPost('fecha'),
            'hora_inicio' => $this->request->getPost('hora_inicio'),
            'duracion'    => (int)$this->request->getPost('duracion'),
            'precio'      => (float)$this->request->getPost('precio'),
            'notas'       => $this->request->getPost('notas') ?: null,
            'objetivos'   => $objetivos,
            'actividades' => $actividades,
            'materiales'  => $materiales,
        ];
    }

    private function reglasValidacion(): array
    {
        return [
            'paciente_id' => 'required|is_natural_no_zero',
            'fecha'       => 'required|valid_date[Y-m-d]',
            'hora_inicio' => 'required',
            'duracion'    => 'required|in_list[30,45,60]',
        ];
    }
}
