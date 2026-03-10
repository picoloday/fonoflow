<?php

namespace App\Controllers\Api;

use App\Models\SesionModel;
use App\Models\PacienteModel;

/**
 * GET    /api/v1/sesiones                          → lista (?paciente_id=X)
 * POST   /api/v1/sesiones                          → crear
 * GET    /api/v1/sesiones/{id}                     → detalle
 * PUT    /api/v1/sesiones/{id}                     → actualizar
 * DELETE /api/v1/sesiones/{id}                     → eliminar (soft)
 * POST   /api/v1/sesiones/{id}/objetivo/{objId}    → toggle objetivo
 * GET    /api/v1/sesiones/paciente/{id}            → info paciente + última sesión
 * GET    /api/v1/sesiones/materiales               → materiales únicos (autocomplete)
 */
class SesionesController extends BaseApiController
{
    private SesionModel $model;

    public function __construct()
    {
        $this->model = new SesionModel();
    }

    public function index()
    {
        $pacienteId = $this->request->getGet('paciente_id');
        $sesiones   = $this->model->listar($pacienteId ? (int)$pacienteId : null);

        // Agrupar por mes (útil para la vista de listado)
        $porMes        = [];
        $totalIngresos = 0;
        foreach ($sesiones as $s) {
            $mes = substr($s['fecha'], 0, 7);
            if (!isset($porMes[$mes])) {
                $porMes[$mes] = ['sesiones' => [], 'ingresos' => 0.0];
            }
            $porMes[$mes]['sesiones'][] = $s;
            $porMes[$mes]['ingresos']  += (float)$s['precio'];
            $totalIngresos             += (float)$s['precio'];
        }
        krsort($porMes);

        return $this->ok([
            'por_mes'        => $porMes,
            'total_sesiones' => count($sesiones),
            'total_ingresos' => $totalIngresos,
        ]);
    }

    public function show(int $id)
    {
        $sesion = $this->model->obtener($id);
        if (!$sesion) return $this->notFound('Sesión no encontrada');

        $pacienteModel = new PacienteModel();
        $sesion['paciente'] = $pacienteModel->obtener($sesion['paciente_id']);

        return $this->ok($sesion);
    }

    public function create()
    {
        $data = $this->parseBody();

        if (!$this->validate($this->reglasValidacion())) {
            return $this->validationError($this->validator->getErrors());
        }

        $id = $this->model->crear($data);
        return $this->created($this->model->obtener($id));
    }

    public function update(int $id)
    {
        if (!$this->model->obtener($id)) return $this->notFound('Sesión no encontrada');

        $data = $this->parseBody();

        if (!$this->validate($this->reglasValidacion())) {
            return $this->validationError($this->validator->getErrors());
        }

        $this->model->actualizar($id, $data);
        return $this->ok($this->model->obtener($id), 'Sesión actualizada');
    }

    public function delete(int $id)
    {
        if (!$this->model->obtener($id)) return $this->notFound('Sesión no encontrada');
        $this->model->eliminar($id);
        return $this->noContent();
    }

    public function toggleObjetivo(int $sesionId, int $objetivoId)
    {
        if (!$this->model->obtener($sesionId)) return $this->notFound('Sesión no encontrada');

        $this->model->toggleObjetivo($sesionId, $objetivoId);
        $objetivos = $this->model->getObjetivos($sesionId);

        $cumplidos = count(array_filter($objetivos, fn($o) => $o['cumplido']));
        $total     = count($objetivos);

        return $this->ok([
            'objetivos' => $objetivos,
            'cumplidos' => $cumplidos,
            'total'     => $total,
            'progreso'  => $total > 0 ? round($cumplidos / $total * 100) : 0,
        ]);
    }

    public function infoPaciente(int $id)
    {
        $pacienteModel = new PacienteModel();
        $paciente      = $pacienteModel->obtener($id);

        if (!$paciente) return $this->notFound('Paciente no encontrado');

        $ultima = $this->model->getUltima($id);

        return $this->ok([
            'patologias'          => $paciente['patologias'],
            'objetivos_generales' => $paciente['objetivos_generales'],
            'ultima_sesion'       => $ultima ? [
                'fecha'       => $ultima['fecha'],
                'hora'        => $ultima['hora_inicio'] ? substr($ultima['hora_inicio'], 0, 5) : null,
                'objetivos'   => $ultima['objetivos'],
                'actividades' => $ultima['actividades'],
            ] : null,
        ]);
    }

    public function materiales()
    {
        return $this->ok($this->model->getMaterialesUnicos());
    }

    // -------------------------------------------------------
    private function parseBody(): array
    {
        $json = $this->request->getJSON(true) ?? [];

        // Acepta fecha_hora combinado (datetime-local) o fecha/hora por separado
        $fechaHora   = $json['fecha_hora'] ?? null;
        $fechaParsed = $fechaHora ? substr($fechaHora, 0, 10) : ($json['fecha'] ?? null);
        $horaParsed  = $fechaHora && strlen($fechaHora) >= 16
            ? substr($fechaHora, 11, 5)
            : ($json['hora_inicio'] ?? null);

        $filter = fn($v) => trim($v) !== '';

        return [
            'paciente_id'   => isset($json['paciente_id']) ? (int)$json['paciente_id'] : null,
            'cita_id'       => $json['cita_id'] ?? null,
            'fecha'         => $fechaParsed,
            'hora_inicio'   => $horaParsed,
            'duracion'      => isset($json['duracion']) ? (int)$json['duracion'] : 30,
            'precio'        => isset($json['precio']) ? (float)$json['precio'] : 12.00,
            'evolutivo'     => $json['evolutivo'] ?? null,
            'observaciones' => $json['observaciones'] ?? null,
            'objetivos'     => array_values(array_filter($json['objetivos']   ?? [], $filter)),
            'actividades'   => array_values(array_filter($json['actividades'] ?? [], $filter)),
            'materiales'    => array_values(array_filter($json['materiales']  ?? [], $filter)),
        ];
    }

    private function reglasValidacion(): array
    {
        return [
            'paciente_id' => 'required|is_natural_no_zero',
            'fecha'       => 'required|valid_date[Y-m-d]',
            'duracion'    => 'required|in_list[30,45,60]',
        ];
    }
}
