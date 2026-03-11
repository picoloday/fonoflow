<?php

namespace App\Models;

use CodeIgniter\Model;

class PacienteModel extends Model
{
    protected $table         = 'pacientes';
    protected $primaryKey    = 'id';
    protected $useTimestamps = true;
    protected $useSoftDeletes = false;
    protected $allowedFields = [
        'nombre', 'tutor', 'parentesco', 'telefono', 'email',
        'fecha_nacimiento', 'foto', 'notas', 'activo', 'fecha_alta',
    ];

    // -------------------------------------------------------
    // Listar pacientes con sus patologías
    // -------------------------------------------------------
    public function listar(bool $soloActivos = false): array
    {
        $query = $this->select('pacientes.*')
                      ->orderBy('nombre', 'ASC');

        if ($soloActivos) {
            $query->where('activo', 1);
        }

        $pacientes = $query->findAll();

        foreach ($pacientes as &$p) {
            $p['patologias']         = $this->getPatologias($p['id']);
            $p['objetivos_generales'] = $this->getObjetivos($p['id']);
            $p['total_sesiones']     = $this->getTotalSesiones($p['id']);
            $p['ultima_sesion']      = $this->getUltimaSesion($p['id']);
        }

        return $pacientes;
    }

    // -------------------------------------------------------
    // Obtener un paciente con todos sus datos
    // -------------------------------------------------------
    public function obtener(int $id): ?array
    {
        $paciente = $this->find($id);
        if (!$paciente) return null;

        $paciente['patologias']         = $this->getPatologias($id);
        $paciente['objetivos_generales'] = $this->getObjetivos($id);

        return $paciente;
    }

    // -------------------------------------------------------
    // Crear paciente con relaciones
    // -------------------------------------------------------
    public function crear(array $data): int
    {
        $patologias = $data['patologias'] ?? [];
        $objetivos  = $data['objetivos_generales'] ?? [];

        unset($data['patologias'], $data['objetivos_generales']);
        $data['fecha_alta'] = date('Y-m-d H:i:s');

        $this->insert($data);
        $id = $this->getInsertID();

        $this->guardarPatologias($id, $patologias);
        $this->guardarObjetivos($id, $objetivos);

        return $id;
    }

    // -------------------------------------------------------
    // Actualizar paciente con relaciones
    // -------------------------------------------------------
    public function actualizar(int $id, array $data): void
    {
        $patologias = $data['patologias'] ?? [];
        $objetivos  = $data['objetivos_generales'] ?? [];

        unset($data['patologias'], $data['objetivos_generales']);

        $this->update($id, $data);

        $this->guardarPatologias($id, $patologias);
        $this->guardarObjetivos($id, $objetivos);
    }

    // -------------------------------------------------------
    // Eliminar paciente (cascade en DB elimina relaciones)
    // -------------------------------------------------------
    public function eliminar(int $id): void
    {
        $this->delete($id);
    }

    // -------------------------------------------------------
    // Métodos privados auxiliares
    // -------------------------------------------------------
    public function getPatologias(int $pacienteId): array
    {
        $rows = $this->db->table('paciente_patologias')
                         ->where('paciente_id', $pacienteId)
                         ->get()->getResultArray();
        return array_column($rows, 'patologia');
    }

    public function getObjetivos(int $pacienteId): array
    {
        $rows = $this->db->table('paciente_objetivos')
                         ->where('paciente_id', $pacienteId)
                         ->orderBy('orden', 'ASC')
                         ->get()->getResultArray();
        return array_column($rows, 'objetivo');
    }

    private function getTotalSesiones(int $pacienteId): int
    {
        return $this->db->table('sesiones')
                        ->where('paciente_id', $pacienteId)
                        ->where('deleted_at IS NULL')
                        ->countAllResults();
    }

    private function getUltimaSesion(int $pacienteId): ?string
    {
        $row = $this->db->table('sesiones')
                        ->select('fecha')
                        ->where('paciente_id', $pacienteId)
                        ->where('deleted_at IS NULL')
                        ->orderBy('fecha', 'DESC')
                        ->limit(1)
                        ->get()->getRowArray();
        return $row['fecha'] ?? null;
    }

    private function guardarPatologias(int $id, array $patologias): void
    {
        $this->db->table('paciente_patologias')->where('paciente_id', $id)->delete();
        foreach ($patologias as $p) {
            if (trim($p) !== '') {
                $this->db->table('paciente_patologias')->insert([
                    'paciente_id' => $id,
                    'patologia'   => trim($p),
                ]);
            }
        }
    }

    /**
     * Devuelve todas las patologías registradas en la base de datos (sin duplicados).
     */
    public function getPatologiasUnicas(): array
    {
        // use GROUP BY instead of DISTINCT to avoid any automatic quoting problems
        $rows = $this->db->table('paciente_patologias')
                         ->select('patologia')
                         ->groupBy('patologia')
                         ->orderBy('patologia', 'ASC')
                         ->get()->getResultArray();
        return array_column($rows, 'patologia');
    }

    private function guardarObjetivos(int $id, array $objetivos): void
    {
        $this->db->table('paciente_objetivos')->where('paciente_id', $id)->delete();
        foreach ($objetivos as $orden => $obj) {
            if (trim($obj) !== '') {
                $this->db->table('paciente_objetivos')->insert([
                    'paciente_id' => $id,
                    'objetivo'    => trim($obj),
                    'orden'       => $orden,
                ]);
            }
        }
    }
}
