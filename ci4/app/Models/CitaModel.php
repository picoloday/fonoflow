<?php

namespace App\Models;

use CodeIgniter\Model;

class CitaModel extends Model
{
    protected $table         = 'citas';
    protected $primaryKey    = 'id';
    protected $useTimestamps = true;
    protected $allowedFields = [
        'paciente_id', 'fecha', 'hora_inicio', 'duracion',
        'precio', 'estado', 'motivo_ausencia', 'reprogramar', 'notas',
    ];

    const HORA_INICIO      = '15:00';
    const HORA_FIN         = '21:00';
    const HORA_INICIO_SAB  = '09:00';
    const HORA_FIN_SAB     = '14:00';
    const INTERVALO        = 15; // minutos

    public static function horaInicio(string $fecha): string
    {
        return date('N', strtotime($fecha)) == 6 ? self::HORA_INICIO_SAB : self::HORA_INICIO;
    }

    public static function horaFin(string $fecha): string
    {
        return date('N', strtotime($fecha)) == 6 ? self::HORA_FIN_SAB : self::HORA_FIN;
    }

    // -------------------------------------------------------
    // Listar citas (con datos del paciente)
    // -------------------------------------------------------
    public function listar(?string $fecha = null, ?int $pacienteId = null): array
    {
        $q = $this->select('citas.*, pacientes.nombre AS paciente_nombre, GROUP_CONCAT(pp.patologia SEPARATOR \', \') AS patologias', false)
                  ->join('pacientes', 'pacientes.id = citas.paciente_id')
                  ->join('paciente_patologias pp', 'pp.paciente_id = pacientes.id', 'left')
                  ->where('citas.deleted_at IS NULL')
                  ->groupBy('citas.id')
                  ->orderBy('citas.fecha', 'ASC')
                  ->orderBy('citas.hora_inicio', 'ASC');

        if ($fecha)      $q->where('citas.fecha', $fecha);
        if ($pacienteId) $q->where('citas.paciente_id', $pacienteId);

        $citas = $q->findAll();

        foreach ($citas as &$c) {
            $c['objetivos']   = $this->getObjetivos($c['id']);
            $c['actividades'] = $this->getActividades($c['id']);
            $c['materiales']  = $this->getMateriales($c['id']);
        }

        return $citas;
    }

    // -------------------------------------------------------
    // Obtener una cita con datos del paciente
    // -------------------------------------------------------
    public function obtener(int $id): ?array
    {
        $cita = $this->select('citas.*, pacientes.nombre AS paciente_nombre, pacientes.telefono AS paciente_telefono, pacientes.email AS paciente_email')
                     ->join('pacientes', 'pacientes.id = citas.paciente_id')
                     ->where('citas.id', $id)
                     ->where('citas.deleted_at IS NULL')
                     ->first();

        if (!$cita) return null;

        $cita['objetivos']   = $this->getObjetivos($id);
        $cita['actividades'] = $this->getActividades($id);
        $cita['materiales']  = $this->getMateriales($id);

        return $cita;
    }

    // -------------------------------------------------------
    // Crear cita
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
    // Actualizar cita
    // -------------------------------------------------------
    public function actualizar(int $id, array $data): void
    {
        $objetivos   = $data['objetivos'] ?? [];
        $actividades = $data['actividades'] ?? [];
        $materiales  = $data['materiales'] ?? [];

        unset($data['objetivos'], $data['actividades'], $data['materiales']);

        $this->update($id, $data);

        $this->guardarObjetivos($id, $objetivos);
        $this->guardarActividades($id, $actividades);
        $this->guardarMateriales($id, $materiales);
    }

    // -------------------------------------------------------
    // Marcar asistencia
    // -------------------------------------------------------
    public function marcarAsistencia(int $id, bool $asistio, ?string $motivo = null, bool $reprogramar = false): void
    {
        if ($asistio) {
            $this->update($id, ['estado' => 'completada']);
        } else {
            $this->update($id, [
                'estado'          => 'no_asistio',
                'motivo_ausencia' => $motivo,
                'reprogramar'     => $reprogramar ? 1 : 0,
            ]);
        }
    }

    // -------------------------------------------------------
    // Eliminar cita (soft delete)
    // -------------------------------------------------------
    public function eliminar(int $id): void
    {
        $this->db->table('citas')->where('id', $id)->update(['deleted_at' => date('Y-m-d H:i:s')]);
    }

    // -------------------------------------------------------
    // Citas del mes indexadas por fecha (para el calendario)
    // Solo campos básicos; sin cargar objetivos/materiales.
    // -------------------------------------------------------
    public function listarMes(string $mes): array
    {
        $inicio = $mes . '-01';
        $fin    = date('Y-m-t', strtotime($inicio));

        $rows = $this->select('citas.id, citas.fecha, citas.hora_inicio, citas.estado, pacientes.nombre AS paciente_nombre')
                     ->join('pacientes', 'pacientes.id = citas.paciente_id')
                     ->where('citas.fecha >=', $inicio)
                     ->where('citas.fecha <=', $fin)
                     ->where('citas.deleted_at IS NULL')
                     ->orderBy('citas.hora_inicio', 'ASC')
                     ->findAll();

        $porDia = [];
        foreach ($rows as $r) {
            $porDia[$r['fecha']][] = $r;
        }
        return $porDia;
    }

    // -------------------------------------------------------
    // Calcular huecos libres para una fecha
    // -------------------------------------------------------
    public function getHuecosLibres(string $fecha): array
    {
        // Generar todos los slots del día
        $todos = [];
        $inicio = strtotime(self::horaInicio($fecha));
        $fin    = strtotime(self::horaFin($fecha));

        for ($t = $inicio; $t < $fin; $t += self::INTERVALO * 60) {
            $todos[] = date('H:i', $t);
        }

        // Obtener citas del día (solo programadas/completadas)
        $citasDia = $this->where('fecha', $fecha)
                         ->whereIn('estado', ['programada', 'completada'])
                         ->where('deleted_at IS NULL')
                         ->findAll();

        // Marcar slots ocupados según duración
        $ocupados = [];
        foreach ($citasDia as $cita) {
            $horaInicio = strtotime($cita['hora_inicio']);
            $horaFin    = $horaInicio + ($cita['duracion'] * 60);

            for ($t = $horaInicio; $t < $horaFin; $t += self::INTERVALO * 60) {
                $ocupados[] = date('H:i', $t);
            }
        }

        $libres = array_values(array_diff($todos, $ocupados));

        return [
            'fecha'        => $fecha,
            'huecos_libres' => $libres,
            'ocupados'     => array_values(array_unique($ocupados)),
        ];
    }

    // -------------------------------------------------------
    // Auxiliares
    // -------------------------------------------------------
    public function getObjetivos(int $citaId): array
    {
        $rows = $this->db->table('cita_objetivos')
                         ->where('cita_id', $citaId)
                         ->orderBy('orden', 'ASC')
                         ->get()->getResultArray();
        return array_column($rows, 'objetivo');
    }

    public function getActividades(int $citaId): array
    {
        $rows = $this->db->table('cita_actividades')
                         ->where('cita_id', $citaId)
                         ->get()->getResultArray();
        return array_column($rows, 'actividad');
    }

    public function getMateriales(int $citaId): array
    {
        $rows = $this->db->table('cita_materiales')
                         ->where('cita_id', $citaId)
                         ->get()->getResultArray();
        return array_column($rows, 'material');
    }

    private function guardarObjetivos(int $id, array $objetivos): void
    {
        $this->db->table('cita_objetivos')->where('cita_id', $id)->delete();
        foreach ($objetivos as $orden => $obj) {
            if (trim($obj) !== '') {
                $this->db->table('cita_objetivos')->insert([
                    'cita_id'  => $id,
                    'objetivo' => trim($obj),
                    'orden'    => $orden,
                ]);
            }
        }
    }

    private function guardarActividades(int $id, array $actividades): void
    {
        $this->db->table('cita_actividades')->where('cita_id', $id)->delete();
        foreach ($actividades as $a) {
            if (trim($a) !== '') {
                $this->db->table('cita_actividades')->insert([
                    'cita_id'   => $id,
                    'actividad' => trim($a),
                ]);
            }
        }
    }

    private function guardarMateriales(int $id, array $materiales): void
    {
        $this->db->table('cita_materiales')->where('cita_id', $id)->delete();
        foreach ($materiales as $m) {
            if (trim($m) !== '') {
                $this->db->table('cita_materiales')->insert([
                    'cita_id'  => $id,
                    'material' => trim($m),
                ]);
            }
        }
    }
}
