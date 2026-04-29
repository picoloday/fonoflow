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
        $pacienteId = $this->request->getGet('paciente_id') ? (int)$this->request->getGet('paciente_id') : null;
        $mes        = $this->request->getGet('mes');

        // ── Modo detalle de un mes ──────────────────────────────
        if ($mes) {
            $sesiones = $this->model->listarMesLigero($mes, $pacienteId);
            $porDia   = [];
            $ingresos = 0.0;
            foreach ($sesiones as $s) {
                $porDia[$s['fecha']][] = $s;
                if ($s['estado'] === 'completada') $ingresos += (float)$s['precio'];
            }
            return $this->ok(['mes' => $mes, 'por_dia' => $porDia, 'ingresos' => $ingresos]);
        }

        // ── Modo resumen: solo totales por mes ──────────────────
        $meses         = $this->model->resumenMeses($pacienteId);
        $totalSesiones = array_sum(array_column($meses, 'total'));
        $totalIngresos = array_sum(array_column($meses, 'ingresos'));

        return $this->ok([
            'meses'          => $meses,
            'total_sesiones' => (int)$totalSesiones,
            'total_ingresos' => (float)$totalIngresos,
        ]);
    }

    public function show(int $id)
    {
        $sesion = $this->model->obtener($id);
        if (!$sesion) return $this->notFound('Sesión no encontrada');

        $pacienteModel = new PacienteModel();
        $sesion['paciente'] = $pacienteModel->obtener($sesion['paciente_id']);

        $sesion['paciente_pendientes_reprogramar'] = (int) $this->db->table('sesiones')
            ->where('paciente_id', (int) $sesion['paciente_id'])
            ->where('estado', 'cancelada')
            ->where('reprogramar', 1)
            ->where('deleted_at IS NULL')
            ->countAllResults();

        return $this->ok($sesion);
    }

    public function create()
    {
        $data = $this->parseBody();

        if (!$this->validate($this->reglasValidacion())) {
            return $this->validationError($this->validator->getErrors());
        }

        // Verificar conflicto horario: misma fecha y hora, solo si la existente está activa
        if (!empty($data['hora_inicio'])) {
            $hora = substr($data['hora_inicio'], 0, 5); // normalizar a HH:MM
            $conflicto = $this->db->table('sesiones')
                ->where('fecha', $data['fecha'])
                ->where('LEFT(hora_inicio, 5)', $hora)
                ->whereIn('estado', ['programada', 'completada'])
                ->where('deleted_at IS NULL')
                ->countAllResults();
            if ($conflicto > 0) {
                return $this->fail('Esa hora ya está ocupada. Solo se puede crear una sesión si la existente está cancelada.', 409);
            }
        }

        $id = $this->model->crear($data);

        // Si el paciente tenía sesiones canceladas pendientes de reprogramar,
        // marcar como 'reprogramada' SOLO la más antigua (FIFO). Cada nueva
        // sesión recupera una pendiente, no todas.
        if (!empty($data['paciente_id'])) {
            $masAntigua = $this->db->table('sesiones')
                ->select('id')
                ->where('paciente_id', (int) $data['paciente_id'])
                ->where('estado', 'cancelada')
                ->where('reprogramar', 1)
                ->where('id !=', $id)
                ->where('deleted_at IS NULL')
                ->orderBy('fecha', 'ASC')
                ->orderBy('hora_inicio', 'ASC')
                ->orderBy('id', 'ASC')
                ->limit(1)
                ->get()->getRowArray();

            if ($masAntigua) {
                $this->db->table('sesiones')
                    ->where('id', (int) $masAntigua['id'])
                    ->update([
                        'estado'                 => 'reprogramada',
                        'reprogramar'            => 0,
                        'sesion_reprogramada_id' => $id,
                        'precio'                 => 0,
                    ]);
            }
        }

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
        $sesion = $this->model->obtener($id);
        if (!$sesion) return $this->notFound('Sesión no encontrada');
        if ($sesion['estado'] !== 'programada') {
            return $this->error('Solo se pueden eliminar sesiones programadas');
        }
        $this->model->eliminar($id);
        return $this->noContent();
    }

    public function completar(int $id)
    {
        $sesion = $this->model->obtener($id);
        if (!$sesion) return $this->notFound('Sesión no encontrada');

        if ($sesion['estado'] !== 'programada') {
            return $this->fail('La sesión ya fue completada o cancelada', 409);
        }

        $json    = $this->request->getJSON(true) ?? [];
        $asistio = $json['asistio'] ?? null;

        if ($asistio === null) {
            return $this->validationError(['asistio' => 'El campo asistio es obligatorio']);
        }

        if ($asistio) {
            $data = [
                'estado'        => 'completada',
                'asistio'       => 1,
                'evolutivo'     => $json['evolutivo']     ?? null,
                'observaciones' => $json['observaciones'] ?? null,
                'recuperacion'  => empty($json['recuperacion']) ? 0 : 1,
            ];
        } else {
            $reprogramar = empty($json['reprogramar']) ? 0 : 1;
            $data = [
                'estado'          => 'cancelada',
                'asistio'         => 0,
                'motivo_ausencia' => $json['motivo_ausencia'] ?? null,
                'reprogramar'     => $reprogramar,
                'precio'          => $reprogramar ? $sesion['precio'] : 0,
            ];
        }

        $this->model->actualizar($id, $data);
        return $this->ok($this->model->obtener($id), 'Sesión actualizada');
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
        $catalogo = array_column(
            $this->db->table('cat_materiales')->where('activo', 1)->orderBy('nombre')->get()->getResultArray(),
            'nombre'
        );
        $enUso    = $this->model->getMaterialesUnicos();
        $lista    = array_unique(array_merge($catalogo, $enUso));
        sort($lista);
        return $this->ok($lista);
    }

    public function actividades()
    {
        $catalogo = array_column(
            $this->db->table('cat_actividades')->where('activo', 1)->orderBy('nombre')->get()->getResultArray(),
            'nombre'
        );
        $enUso    = array_column(
            $this->db->table('sesion_actividades')->select('actividad')->groupBy('actividad')->orderBy('actividad')->get()->getResultArray(),
            'actividad'
        );
        $lista    = array_unique(array_merge($catalogo, $enUso));
        sort($lista);
        return $this->ok($lista);
    }

    public function motivos()
    {
        $catalogo = array_column(
            $this->db->table('cat_motivos_ausencia')->where('activo', 1)->orderBy('nombre')->get()->getResultArray(),
            'nombre'
        );
        $enUso = array_column(
            $this->db->table('sesiones')
                ->select('motivo_ausencia')
                ->where('motivo_ausencia IS NOT NULL')
                ->where('motivo_ausencia !=', '')
                ->where('deleted_at IS NULL')
                ->groupBy('motivo_ausencia')
                ->orderBy('motivo_ausencia')
                ->get()->getResultArray(),
            'motivo_ausencia'
        );
        $lista = array_unique(array_merge($catalogo, $enUso));
        sort($lista);
        return $this->ok($lista);
    }

    public function pendientesReprogramar()
    {
        $lista = $this->model->pendientesReprogramar();
        return $this->ok([
            'pacientes'       => $lista,
            'total_pacientes' => count($lista),
            'total_sesiones'  => array_sum(array_column($lista, 'total_pendientes')),
            'total_precio'    => array_sum(array_column($lista, 'precio_pendiente')),
        ]);
    }

    public function resetear(int $id)
    {
        $sesion = $this->model->obtener($id);
        if (!$sesion) return $this->notFound('Sesión no encontrada');

        if (!in_array($sesion['estado'], ['completada', 'cancelada'])) {
            return $this->fail('Solo se pueden resetear sesiones completadas o canceladas', 409);
        }

        // Restaurar precio si fue puesto a 0 al cancelar sin reprogramar
        $precio = (float)$sesion['precio'];
        if ($precio === 0.0) {
            $precioRef = $this->db->table('sesiones')
                ->select('precio')
                ->where('paciente_id', (int)$sesion['paciente_id'])
                ->where('id !=', $id)
                ->where('precio >', 0)
                ->where('deleted_at IS NULL')
                ->orderBy('id', 'DESC')
                ->limit(1)
                ->get()->getRowArray();
            if ($precioRef) $precio = (float)$precioRef['precio'];
        }

        // Resetear objetivos cumplidos
        $this->db->table('sesion_objetivos')->where('sesion_id', $id)->update(['cumplido' => 0]);

        $this->db->table('sesiones')->where('id', $id)->update([
            'estado'                 => 'programada',
            'asistio'                => null,
            'motivo_ausencia'        => null,
            'reprogramar'            => 0,
            'sesion_reprogramada_id' => null,
            'evolutivo'              => null,
            'observaciones'          => null,
            'recuperacion'           => 0,
            'precio'                 => $precio,
        ]);

        return $this->ok($this->model->obtener($id), 'Sesión reseteada a estado inicial');
    }

    public function toggleReprogramar(int $id)
    {
        $sesion = $this->model->obtener($id);
        if (!$sesion) return $this->notFound('Sesión no encontrada');

        if ($sesion['estado'] === 'cancelada') {
            // Alternar el flag reprogramar
            $nuevoValor = $sesion['reprogramar'] ? 0 : 1;
            $this->model->actualizar($id, ['reprogramar' => $nuevoValor]);

        } elseif ($sesion['estado'] === 'reprogramada') {
            // Deshacer: borrar la sesión nueva y revertir esta a cancelada
            $idNueva = $sesion['sesion_reprogramada_id'] ?? null;
            if ($idNueva) {
                $this->model->eliminar((int)$idNueva);
            }
            // Usar query directa porque CI4 omite NULL en update()
            $this->db->table('sesiones')->where('id', $id)->update([
                'estado'                 => 'cancelada',
                'reprogramar'            => 0,
                'sesion_reprogramada_id' => null,
            ]);

        } else {
            return $this->error('Solo se puede modificar el estado de reprogramación en sesiones canceladas o reprogramadas');
        }

        return $this->ok($this->model->obtener($id));
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
