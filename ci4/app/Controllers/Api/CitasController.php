<?php

namespace App\Controllers\Api;

use App\Models\CitaModel;
use App\Models\PacienteModel;
use App\Models\SesionModel;
use App\Config\AppConfig;

/**
 * GET    /api/v1/citas                      → lista (?fecha=Y-m-d, ?mes=Y-m)
 * POST   /api/v1/citas                      → crear
 * GET    /api/v1/citas/{id}                 → detalle
 * PUT    /api/v1/citas/{id}                 → actualizar
 * DELETE /api/v1/citas/{id}                 → eliminar (soft)
 * POST   /api/v1/citas/{id}/asistencia      → marcar asistencia/ausencia
 * POST   /api/v1/citas/{id}/cancelar        → cancelar
 * GET    /api/v1/citas/huecos/{fecha}       → huecos libres del día
 * GET    /api/v1/agenda?mes=Y-m&fecha=Y-m-d → vista agenda (calendario + timeline)
 */
class CitasController extends BaseApiController
{
    private CitaModel $model;

    public function __construct()
    {
        $this->model = new CitaModel();
    }

    public function index()
    {
        $fecha = $this->request->getGet('fecha');
        $mes   = $this->request->getGet('mes');

        if ($mes) {
            // Devuelve estructura para el calendario mensual
            $citasPorDia   = $this->model->listarMes($mes);
            $sesionModel   = new SesionModel();
            foreach ($sesionModel->listarMes($mes) as $dia => $items) {
                foreach ($items as $item) {
                    $citasPorDia[$dia][] = $item;
                }
            }
            return $this->ok(['por_dia' => $citasPorDia, 'mes' => $mes]);
        }

        return $this->ok($this->model->listar($fecha));
    }

    public function agenda()
    {
        $today = date('Y-m-d');
        $fecha = $this->request->getGet('fecha') ?? $today;
        $mes   = $this->request->getGet('mes')   ?? substr($fecha, 0, 7);

        // Cuadrícula mensual
        $primerDia  = "$mes-01";
        $diaSemana  = (int)date('N', strtotime($primerDia));
        $diasEnMes  = (int)date('t', strtotime($primerDia));
        $startTs    = strtotime("$primerDia -" . ($diaSemana - 1) . ' days');
        $totalCells = (int)ceil(($diasEnMes + $diaSemana - 1) / 7) * 7;
        $calDias    = [];
        for ($i = 0; $i < $totalCells; $i++) {
            $calDias[] = date('Y-m-d', strtotime("+$i days", $startTs));
        }

        // Citas del mes (puntos de color)
        $citasPorDia = $this->model->listarMes($mes);
        $sesionModel = new SesionModel();
        foreach ($sesionModel->listarMes($mes) as $dia => $items) {
            foreach ($items as $item) {
                $citasPorDia[$dia][] = $item;
            }
        }

        // Timeline del día — aritmética en minutos, sin strtotime
        $citasDia = $this->model->listar($fecha);
        $sessDia  = $sesionModel->listarDia($fecha);
        $slots    = [];

        $toMin = function(string $hhmm): int {
            $parts = explode(':', $hhmm);
            return (int)$parts[0] * 60 + (int)$parts[1];
        };
        $toHora = function(int $min): string {
            return sprintf('%02d:%02d', intdiv($min, 60), $min % 60);
        };

        $inicioMin = $toMin(CitaModel::horaInicio($fecha));
        $finMin    = $toMin(CitaModel::horaFin($fecha));

        // Detectar sesiones de recuperación: sesiones cuyo ID aparece como
        // sesion_reprogramada_id en otra sesión con estado='reprogramada'
        $recuperacionMap = [];
        if (!empty($sessDia)) {
            $idsDia = array_column($sessDia, 'id');
            $rows   = $this->db->table('sesiones')
                ->select('sesion_reprogramada_id, fecha')
                ->whereIn('sesion_reprogramada_id', $idsDia)
                ->where('estado', 'reprogramada')
                ->where('deleted_at IS NULL')
                ->get()->getResultArray();
            foreach ($rows as $r) {
                $recuperacionMap[$r['sesion_reprogramada_id']] = $r['fecha'];
            }
        }

        // Índice por hora → array de items (puede haber varias sesiones a la misma hora)
        $itemsPorHora = [];
        foreach ($citasDia as $c) {
            $h = substr($c['hora_inicio'], 0, 5);
            $itemsPorHora[$h][] = $c;
        }
        foreach ($sessDia as $s) {
            $item = array_merge($s, ['_tipo' => 'sesion']);
            if (isset($recuperacionMap[$s['id']])) {
                $item['_recuperacion']       = true;
                $item['_recuperacion_fecha'] = $recuperacionMap[$s['id']];
            }
            $h = substr($s['hora_inicio'], 0, 5);
            $itemsPorHora[$h][] = $item;
        }

        // Horas bloqueadas por sesiones activas (solo programada/completada)
        $estadosQueOcupan = ['programada', 'completada'];
        $horasBloqueadas  = [];
        foreach ($itemsPorHora as $h => $items) {
            foreach ($items as $item) {
                if (!in_array($item['estado'] ?? '', $estadosQueOcupan)) continue;
                $start = $toMin($h);
                $dur   = (int)($item['duracion'] ?? 0);
                for ($m = $start + CitaModel::INTERVALO; $m < $start + $dur; $m += CitaModel::INTERVALO) {
                    $horasBloqueadas[$toHora($m)] = true;
                }
            }
        }

        // Construir slots: cada hora → array de sesiones (aplanado para el frontend)
        foreach ($itemsPorHora as $h => $items) {
            if (isset($horasBloqueadas[$h])) continue;
            foreach ($items as $item) {
                $slots[] = array_merge($item, ['_hora' => $h]);
            }
        }
        // Ordenar por hora
        usort($slots, fn($a, $b) => strcmp($a['_hora'], $b['_hora']));

        return $this->ok([
            'today'        => $today,
            'fecha'        => $fecha,
            'mes'          => $mes,
            'mes_prev'     => date('Y-m', strtotime('-1 month', strtotime($primerDia))),
            'mes_next'     => date('Y-m', strtotime('+1 month', strtotime($primerDia))),
            'cal_dias'     => $calDias,
            'citas_por_dia'=> $citasPorDia,
            'slots'        => $slots,
            'hora_inicio'  => CitaModel::horaInicio($fecha),
            'hora_fin'     => CitaModel::horaFin($fecha),
            'estados'      => AppConfig::$estados,
        ]);
    }

    public function show(int $id)
    {
        $cita = $this->model->obtener($id);
        if (!$cita) return $this->notFound('Cita no encontrada');

        $pacienteModel = new PacienteModel();
        $cita['paciente'] = $pacienteModel->obtener($cita['paciente_id']);

        return $this->ok($cita);
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
        if (!$this->model->obtener($id)) return $this->notFound('Cita no encontrada');

        $data = $this->parseBody();

        if (!$this->validate($this->reglasValidacion())) {
            return $this->validationError($this->validator->getErrors());
        }

        $this->model->actualizar($id, $data);
        return $this->ok($this->model->obtener($id), 'Cita actualizada');
    }

    public function delete(int $id)
    {
        if (!$this->model->obtener($id)) return $this->notFound('Cita no encontrada');
        $this->model->eliminar($id);
        return $this->noContent();
    }

    public function asistencia(int $id)
    {
        $cita = $this->model->obtener($id);
        if (!$cita) return $this->notFound('Cita no encontrada');

        $json        = $this->request->getJSON(true) ?? [];
        $asistio     = (bool)($json['asistio'] ?? false);
        $motivo      = $json['motivo_ausencia'] ?? null;
        $reprogramar = (bool)($json['reprogramar'] ?? false);

        $this->model->marcarAsistencia($id, $asistio, $motivo, $reprogramar);

        $sesionId = null;
        if ($asistio) {
            $citaActualizada = $this->model->obtener($id);
            $sesionModel = new SesionModel();
            $sesionId = $sesionModel->crear([
                'paciente_id' => $citaActualizada['paciente_id'],
                'cita_id'     => $id,
                'fecha'       => $citaActualizada['fecha'],
                'duracion'    => $citaActualizada['duracion'],
                'precio'      => $citaActualizada['precio'],
                'objetivos'   => array_map(fn($o) => ['objetivo' => $o, 'cumplido' => 0], $citaActualizada['objetivos']),
                'materiales'  => $citaActualizada['materiales'],
                'actividades' => $citaActualizada['actividades'],
            ]);
        }

        return $this->ok([
            'cita'      => $this->model->obtener($id),
            'sesion_id' => $sesionId,
        ], $asistio ? 'Asistencia marcada' : 'Ausencia registrada');
    }

    public function cancelar(int $id)
    {
        if (!$this->model->obtener($id)) return $this->notFound('Cita no encontrada');
        $this->model->update($id, ['estado' => 'cancelada']);
        return $this->ok($this->model->obtener($id), 'Cita cancelada');
    }

    public function huecos(string $fecha)
    {
        $data = $this->model->getHuecosLibres($fecha);
        return $this->ok($data);
    }

    // -------------------------------------------------------
    private function parseBody(): array
    {
        $json    = $this->request->getJSON(true) ?? [];
        $filter  = fn($v) => trim($v) !== '';

        return [
            'paciente_id' => isset($json['paciente_id']) ? (int)$json['paciente_id'] : null,
            'fecha'       => $json['fecha'] ?? null,
            'hora_inicio' => $json['hora_inicio'] ?? null,
            'duracion'    => isset($json['duracion']) ? (int)$json['duracion'] : 30,
            'precio'      => isset($json['precio']) ? (float)$json['precio'] : 12.00,
            'notas'       => $json['notas'] ?? null,
            'objetivos'   => array_values(array_filter($json['objetivos']   ?? [], $filter)),
            'actividades' => array_values(array_filter($json['actividades'] ?? [], $filter)),
            'materiales'  => array_values(array_filter($json['materiales']  ?? [], $filter)),
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
