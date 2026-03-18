<?php

namespace App\Models;

use CodeIgniter\Model;

class SesionModel extends Model
{
    protected $table         = 'sesiones';
    protected $primaryKey    = 'id';
    protected $useTimestamps = true;
    protected $allowedFields = [
        'paciente_id', 'cita_id', 'fecha', 'hora_inicio', 'duracion',
        'precio', 'evolutivo', 'observaciones',
        'estado', 'asistio', 'motivo_ausencia', 'reprogramar', 'sesion_reprogramada_id', 'recuperacion',
    ];

    // -------------------------------------------------------
    // Listar sesiones con nombre de paciente
    // -------------------------------------------------------
    public function listar(?int $pacienteId = null, ?string $fecha = null): array
    {
        $q = $this->select('sesiones.*, pacientes.nombre AS paciente_nombre')
                  ->join('pacientes', 'pacientes.id = sesiones.paciente_id')
                  ->where('sesiones.deleted_at IS NULL')
                  ->orderBy('sesiones.fecha', 'DESC');

        if ($pacienteId) $q->where('sesiones.paciente_id', $pacienteId);
        if ($fecha)      $q->where('sesiones.fecha', $fecha);

        $sesiones = $q->findAll();

        foreach ($sesiones as &$s) {
            $s['reprogramar']  = (int) $s['reprogramar'];
            $s['asistio']      = isset($s['asistio']) ? (int) $s['asistio'] : null;
            $s['recuperacion'] = (int) ($s['recuperacion'] ?? 0);
            $s['objetivos']    = $this->getObjetivos($s['id']);
            $s['actividades']  = $this->getActividades($s['id']);
            $s['materiales']   = $this->getMateriales($s['id']);
        }

        return $sesiones;
    }

    // -------------------------------------------------------
    // Sesiones del día sin cita vinculada (para la agenda)
    // -------------------------------------------------------
    public function listarDia(string $fecha): array
    {
        $rows = $this->select('sesiones.*, pacientes.nombre AS paciente_nombre, GROUP_CONCAT(pp.patologia SEPARATOR \', \') AS patologias', false)
                     ->join('pacientes', 'pacientes.id = sesiones.paciente_id')
                     ->join('paciente_patologias pp', 'pp.paciente_id = pacientes.id', 'left')
                     ->where('sesiones.fecha', $fecha)
                     ->where('sesiones.cita_id IS NULL')
                     ->where('sesiones.hora_inicio IS NOT NULL')
                     ->where('sesiones.deleted_at IS NULL')
                     ->groupBy('sesiones.id')
                     ->orderBy('sesiones.hora_inicio', 'ASC')
                     ->findAll();

        foreach ($rows as &$r) {
            $r['recuperacion'] = (int) ($r['recuperacion'] ?? 0);
        }
        return $rows;
    }

    // -------------------------------------------------------
    // Sesiones del mes sin cita (para puntos del calendario)
    // -------------------------------------------------------
    public function listarMes(string $mes): array
    {
        $inicio = $mes . '-01';
        $fin    = date('Y-m-t', strtotime($inicio));

        $rows = $this->select('sesiones.id, sesiones.fecha, sesiones.hora_inicio, pacientes.nombre AS paciente_nombre')
                     ->join('pacientes', 'pacientes.id = sesiones.paciente_id')
                     ->where('sesiones.fecha >=', $inicio)
                     ->where('sesiones.fecha <=', $fin)
                     ->where('sesiones.cita_id IS NULL')
                     ->where('sesiones.hora_inicio IS NOT NULL')
                     ->where('sesiones.deleted_at IS NULL')
                     ->findAll();

        $porDia = [];
        foreach ($rows as $r) {
            $porDia[$r['fecha']][] = array_merge($r, ['_tipo' => 'sesion']);
        }
        return $porDia;
    }

    // -------------------------------------------------------
    // Obtener sesión con datos de paciente
    // -------------------------------------------------------
    public function obtener(int $id): ?array
    {
        $sesion = $this->select('sesiones.*, pacientes.nombre AS paciente_nombre, pacientes.id AS paciente_real_id')
                       ->join('pacientes', 'pacientes.id = sesiones.paciente_id')
                       ->where('sesiones.id', $id)
                       ->where('sesiones.deleted_at IS NULL')
                       ->first();

        if (!$sesion) return null;

        // MySQL devuelve TINYINT como string; castear para que JS no confunda "0" con true
        $sesion['asistio']      = isset($sesion['asistio'])      ? (int) $sesion['asistio']      : null;
        $sesion['reprogramar']  = isset($sesion['reprogramar'])  ? (int) $sesion['reprogramar']  : 0;
        $sesion['recuperacion'] = isset($sesion['recuperacion']) ? (int) $sesion['recuperacion'] : 0;

        $sesion['objetivos']   = $this->getObjetivos($id);
        $sesion['actividades'] = $this->getActividades($id);
        $sesion['materiales']  = $this->getMateriales($id);

        // Si está reprogramada, obtener info de la nueva sesión
        if (!empty($sesion['sesion_reprogramada_id'])) {
            $nueva = $this->db->table('sesiones')
                              ->select('id, fecha, hora_inicio, estado')
                              ->where('id', (int) $sesion['sesion_reprogramada_id'])
                              ->get()->getRowArray();
            $sesion['sesion_reprogramada'] = $nueva ?: null;
        } else {
            $sesion['sesion_reprogramada'] = null;
        }

        return $sesion;
    }

    // -------------------------------------------------------
    // Última sesión de un paciente (con objetivos y actividades)
    // -------------------------------------------------------
    public function getUltima(int $pacienteId): ?array
    {
        $sesion = $this->where('paciente_id', $pacienteId)
                       ->where('deleted_at IS NULL')
                       ->orderBy('fecha', 'DESC')
                       ->orderBy('hora_inicio', 'DESC')
                       ->first();

        if (!$sesion) return null;

        $sesion['objetivos']   = $this->getObjetivos($sesion['id']);
        $sesion['actividades'] = $this->getActividades($sesion['id']);

        return $sesion;
    }

    // -------------------------------------------------------
    // Historial de un paciente
    // -------------------------------------------------------
    public function historialPaciente(int $pacienteId): array
    {
        $sesiones = $this->where('paciente_id', $pacienteId)
                         ->where('deleted_at IS NULL')
                         ->orderBy('fecha', 'DESC')
                         ->findAll();

        foreach ($sesiones as &$s) {
            $s['objetivos']   = $this->getObjetivos($s['id']);
            $s['actividades'] = $this->getActividades($s['id']);
            $s['materiales']  = $this->getMateriales($s['id']);
        }

        return $sesiones;
    }

    // -------------------------------------------------------
    // Crear sesión
    // -------------------------------------------------------
    public function crear(array $data): int
    {
        $objetivos   = $data['objetivos'] ?? [];
        $actividades = $data['actividades'] ?? [];
        $materiales  = $data['materiales'] ?? [];

        unset($data['objetivos'], $data['actividades'], $data['materiales']);

        $this->insert($data);
        $id = $this->getInsertID();

        $this->guardarObjetivos($id, $objetivos);
        $this->guardarActividades($id, $actividades);
        $this->guardarMateriales($id, $materiales);

        return $id;
    }

    // -------------------------------------------------------
    // Actualizar sesión
    // -------------------------------------------------------
    public function actualizar(int $id, array $data): void
    {
        $objetivos   = $data['objetivos'] ?? null;
        $actividades = $data['actividades'] ?? null;
        $materiales  = $data['materiales'] ?? null;

        unset($data['objetivos'], $data['actividades'], $data['materiales']);

        if (!empty($data)) $this->update($id, $data);

        if ($objetivos !== null)   $this->guardarObjetivos($id, $objetivos);
        if ($actividades !== null) $this->guardarActividades($id, $actividades);
        if ($materiales !== null)  $this->guardarMateriales($id, $materiales);
    }

    // -------------------------------------------------------
    // Toggle objetivo cumplido
    // -------------------------------------------------------
    public function toggleObjetivo(int $sesionId, int $objetivoId): void
    {
        $obj = $this->db->table('sesion_objetivos')
                        ->where('id', $objetivoId)
                        ->where('sesion_id', $sesionId)
                        ->get()->getRowArray();

        if ($obj) {
            $this->db->table('sesion_objetivos')
                     ->where('id', $objetivoId)
                     ->update(['cumplido' => $obj['cumplido'] ? 0 : 1]);
        }
    }

    // -------------------------------------------------------
    // Eliminar sesión (soft delete)
    // -------------------------------------------------------
    public function eliminar(int $id): void
    {
        $this->db->table('sesiones')->where('id', $id)->update(['deleted_at' => date('Y-m-d H:i:s')]);
    }

    // -------------------------------------------------------
    // Todos los materiales únicos usados
    // -------------------------------------------------------
    public function getMaterialesUnicos(): array
    {
        // group by to sidestep quoting of DISTINCT
        $rows = $this->db->table('sesion_materiales')
                         ->select('material')
                         ->groupBy('material')
                         ->orderBy('material', 'ASC')
                         ->get()->getResultArray();
        return array_column($rows, 'material');
    }

    // -------------------------------------------------------
    // Estadísticas para el dashboard
    // -------------------------------------------------------
    public function ingresosMes(string $mes): float
    {
        $row = $this->db->table('sesiones')
                        ->selectSum('precio')
                        ->where('deleted_at IS NULL')
                        ->like('fecha', $mes, 'after')
                        ->get()->getRowArray();
        return (float)($row['precio'] ?? 0);
    }

    public function totalMes(string $mes): int
    {
        return $this->db->table('sesiones')
                        ->where('deleted_at IS NULL')
                        ->like('fecha', $mes, 'after')
                        ->countAllResults();
    }

    // -------------------------------------------------------
    // Auxiliares
    // -------------------------------------------------------
    public function getObjetivos(int $sesionId): array
    {
        $rows = $this->db->table('sesion_objetivos')
                         ->where('sesion_id', $sesionId)
                         ->orderBy('orden', 'ASC')
                         ->get()->getResultArray();
        // MySQL devuelve TINYINT como string; castear a int para que JS no los
        // confunda ("0" es truthy en JavaScript)
        return array_map(function ($r) {
            $r['cumplido'] = (int) $r['cumplido'];
            $r['orden']    = (int) $r['orden'];
            return $r;
        }, $rows);
    }

    public function getActividades(int $sesionId): array
    {
        $rows = $this->db->table('sesion_actividades')
                         ->where('sesion_id', $sesionId)
                         ->get()->getResultArray();
        return array_column($rows, 'actividad');
    }

    public function getMateriales(int $sesionId): array
    {
        $rows = $this->db->table('sesion_materiales')
                         ->where('sesion_id', $sesionId)
                         ->get()->getResultArray();
        return array_column($rows, 'material');
    }

    private function guardarObjetivos(int $id, array $objetivos): void
    {
        $this->db->table('sesion_objetivos')->where('sesion_id', $id)->delete();
        foreach ($objetivos as $orden => $obj) {
            $texto = is_array($obj) ? $obj['objetivo'] : $obj;
            $cumplido = is_array($obj) ? ($obj['cumplido'] ?? 0) : 0;
            if (trim($texto) !== '') {
                $this->db->table('sesion_objetivos')->insert([
                    'sesion_id' => $id,
                    'objetivo'  => trim($texto),
                    'cumplido'  => $cumplido,
                    'orden'     => $orden,
                ]);
            }
        }
    }

    private function guardarActividades(int $id, array $actividades): void
    {
        $this->db->table('sesion_actividades')->where('sesion_id', $id)->delete();
        foreach ($actividades as $a) {
            if (trim($a) !== '') {
                $this->db->table('sesion_actividades')->insert([
                    'sesion_id' => $id,
                    'actividad' => trim($a),
                ]);
            }
        }
    }

    private function guardarMateriales(int $id, array $materiales): void
    {
        $this->db->table('sesion_materiales')->where('sesion_id', $id)->delete();
        foreach ($materiales as $m) {
            if (trim($m) !== '') {
                $this->db->table('sesion_materiales')->insert([
                    'sesion_id' => $id,
                    'material'  => trim($m),
                ]);
            }
        }
    }
}
