<?php

namespace App\Controllers\Api;

use App\Models\PacienteModel;
use App\Models\SesionModel;
use App\Config\AppConfig;

/**
 * GET    /api/v1/pacientes              → lista (filtros: ?activo=1&q=nombre)
 * POST   /api/v1/pacientes              → crear
 * GET    /api/v1/pacientes/{id}         → detalle + historial sesiones
 * PUT    /api/v1/pacientes/{id}         → actualizar
 * DELETE /api/v1/pacientes/{id}         → eliminar (soft)
 * GET    /api/v1/pacientes/patologias   → lista de patologías únicas (para autocomplete)
 */
class PacientesController extends BaseApiController
{
    private PacienteModel $model;

    public function __construct()
    {
        $this->model = new PacienteModel();
    }

    public function index()
    {
        $soloActivos = $this->request->getGet('activo') !== '0';
        $busqueda    = $this->request->getGet('q') ?? '';

        $pacientes = $this->model->listar($soloActivos);

        if ($busqueda !== '') {
            $q = mb_strtolower($busqueda);
            $pacientes = array_values(array_filter($pacientes, function ($p) use ($q) {
                if (mb_strpos(mb_strtolower($p['nombre']), $q) !== false) return true;
                foreach ($p['patologias'] as $pat) {
                    if (mb_strpos(mb_strtolower($pat), $q) !== false) return true;
                }
                return false;
            }));
        }

        return $this->ok($pacientes);
    }

    public function show(int $id)
    {
        $paciente = $this->model->obtener($id);
        if (!$paciente) return $this->notFound('Paciente no encontrado');

        $sesionModel = new SesionModel();
        $paciente['historial'] = $sesionModel->historialPaciente($id);

        return $this->ok($paciente);
    }

    public function create()
    {
        $data = $this->parseBody();

        if (!$this->validate(['nombre' => 'required|min_length[2]|max_length[255]'])) {
            return $this->validationError($this->validator->getErrors());
        }

        $id = $this->model->crear($data);
        return $this->created($this->model->obtener($id));
    }

    public function update(int $id)
    {
        if (!$this->model->obtener($id)) return $this->notFound('Paciente no encontrado');

        $data = $this->parseBody();

        if (!$this->validate(['nombre' => 'required|min_length[2]|max_length[255]'])) {
            return $this->validationError($this->validator->getErrors());
        }

        $this->model->actualizar($id, $data);
        return $this->ok($this->model->obtener($id), 'Paciente actualizado');
    }

    public function delete(int $id)
    {
        if (!$this->model->obtener($id)) return $this->notFound('Paciente no encontrado');
        $this->model->eliminar($id);
        return $this->noContent();
    }

    public function patologias()
    {
        // Combina catálogo maestro + patologías ya usadas en pacientes
        $catalogo  = array_column(
            $this->db->table('cat_patologias')->where('activo', 1)->orderBy('nombre')->get()->getResultArray(),
            'nombre'
        );
        $enUso     = $this->model->getPatologiasUnicas();
        $lista     = array_unique(array_merge($catalogo, $enUso));
        sort($lista);
        return $this->ok($lista);
    }

    // -------------------------------------------------------
    private function parseBody(): array
    {
        $json = $this->request->getJSON(true) ?? [];

        $patologias = array_values(array_unique(array_filter(
            array_map('trim', $json['patologias'] ?? []),
            fn($p) => $p !== ''
        )));
        $objetivos = array_values(array_filter(
            $json['objetivos_generales'] ?? [],
            fn($o) => trim($o) !== ''
        ));

        return [
            'nombre'              => $json['nombre'] ?? null,
            'tutor'               => $json['tutor'] ?? null,
            'parentesco'          => $json['parentesco'] ?? null,
            'telefono'            => $json['telefono'] ?? null,
            'email'               => $json['email'] ?? null,
            'fecha_nacimiento'    => $json['fecha_nacimiento'] ?? null,
            'notas'               => $json['notas'] ?? null,
            'activo'              => isset($json['activo']) ? (int)(bool)$json['activo'] : 1,
            'patologias'          => $patologias,
            'objetivos_generales' => $objetivos,
        ];
    }
}
