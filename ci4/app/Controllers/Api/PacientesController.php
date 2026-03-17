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

    public function agendar(int $id)
    {
        $paciente = $this->model->obtener($id);
        if (!$paciente) return $this->notFound('Paciente no encontrado');

        // horario: array de {dia, hora, duracion}
        $horario = json_decode($paciente['dias_semana'] ?? '', true);
        if (empty($horario)) {
            return $this->fail('El paciente no tiene horario habitual configurado. Edítalo y establece días y hora de sesión.', 422);
        }

        $mes = $this->request->getGet('mes') ?? date('Y-m');
        if (!preg_match('/^\d{4}-\d{2}$/', $mes)) {
            return $this->fail('El parámetro mes debe tener el formato YYYY-MM', 422);
        }

        // Índice rápido: dia_semana (int) → {hora, duracion}
        $horarioPorDia = [];
        foreach ($horario as $entrada) {
            $horarioPorDia[(int)$entrada['dia']] = [
                'hora'     => substr($entrada['hora'], 0, 5),
                'duracion' => (int)($entrada['duracion'] ?? 30),
            ];
        }

        $primerDia = $mes . '-01';
        $totalDias = (int) date('t', strtotime($primerDia));

        $sesionModel = new SesionModel();
        $creadas     = [];
        $omitidas    = [];

        for ($d = 1; $d <= $totalDias; $d++) {
            $fecha     = sprintf('%s-%02d', $mes, $d);
            $diaSemana = (int) date('N', strtotime($fecha)); // 1=Lun … 6=Sáb

            if (!isset($horarioPorDia[$diaSemana])) continue;

            $hora     = $horarioPorDia[$diaSemana]['hora'];
            $duracion = $horarioPorDia[$diaSemana]['duracion'];

            // ¿Ya tiene sesión este paciente ese día?
            $yaExiste = $this->db->table('sesiones')
                ->where('paciente_id', $id)
                ->where('fecha', $fecha)
                ->where('deleted_at IS NULL')
                ->countAllResults();

            if ($yaExiste) {
                $omitidas[] = ['fecha' => $fecha, 'motivo' => 'Ya tiene sesión ese día'];
                continue;
            }

            // ¿Hay conflicto de horario con otro paciente?
            $conflicto = $this->db->table('sesiones')
                ->where('fecha', $fecha)
                ->where('LEFT(hora_inicio, 5)', $hora)
                ->whereIn('estado', ['programada', 'completada'])
                ->where('deleted_at IS NULL')
                ->countAllResults();

            if ($conflicto) {
                $omitidas[] = ['fecha' => $fecha, 'motivo' => "Conflicto de horario a las $hora"];
                continue;
            }

            $sesionModel->crear([
                'paciente_id' => $id,
                'fecha'       => $fecha,
                'hora_inicio' => $hora,
                'duracion'    => $duracion,
                'precio'      => 12.00,
                'objetivos'   => array_map(fn($o) => trim($o), $paciente['objetivos_generales'] ?? []),
            ]);

            $creadas[] = $fecha;
        }

        return $this->ok([
            'creadas'  => count($creadas),
            'fechas'   => $creadas,
            'omitidas' => $omitidas,
        ], count($creadas) . ' sesiones programadas para ' . $mes);
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

        // horario llega como [{dia:1,hora:"15:00",duracion:30}, ...] → guardamos como JSON
        $horario = [];
        foreach ($json['horario'] ?? [] as $entrada) {
            $dia = (int)($entrada['dia'] ?? 0);
            if ($dia < 1 || $dia > 6 || empty($entrada['hora'])) continue;
            $horario[] = [
                'dia'      => $dia,
                'hora'     => substr($entrada['hora'], 0, 5),
                'duracion' => (int)($entrada['duracion'] ?? 30),
            ];
        }
        usort($horario, fn($a, $b) => $a['dia'] - $b['dia']);

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
            'dias_semana'         => !empty($horario) ? json_encode($horario) : null,
        ];
    }
}
