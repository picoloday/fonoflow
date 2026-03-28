<?php

namespace App\Controllers\Api;

/**
 * GET /api/v1/pagos?mes=YYYY-MM        → pacientes del mes con su pago mensual
 * PUT /api/v1/pagos/{paciente_id}/{mes} → crear/actualizar pago mensual
 */
class PagosController extends BaseApiController
{
    public function index()
    {
        $mes = $this->request->getGet('mes') ?? date('Y-m');

        if (!preg_match('/^\d{4}-\d{2}$/', $mes)) {
            return $this->fail('Formato de mes inválido (YYYY-MM)', 422);
        }

        $inicio = $mes . '-01';
        $fin    = date('Y-m-t', strtotime($inicio));

        // Pacientes que tienen sesiones este mes + su pago confirmado o valor_mensual como defecto
        $rows = $this->db->table('sesiones s')
            ->select('s.paciente_id, p.nombre, p.valor_mensual, COUNT(s.id) AS sesiones, pm.importe AS importe_confirmado')
            ->join('pacientes p', 'p.id = s.paciente_id')
            ->join('pagos_mensuales pm', "pm.paciente_id = s.paciente_id AND pm.mes = '$mes'", 'left')
            ->where('s.fecha >=', $inicio)
            ->where('s.fecha <=', $fin)
            ->where('s.deleted_at IS NULL')
            ->groupBy('s.paciente_id, p.nombre, p.valor_mensual, pm.importe')
            ->orderBy('p.nombre', 'ASC')
            ->get()->getResultArray();

        foreach ($rows as &$r) {
            $r['sesiones'] = (int) $r['sesiones'];

            if ($r['importe_confirmado'] !== null) {
                // Pago histórico confirmado — no se toca aunque cambie valor_mensual
                $r['importe']    = (float) $r['importe_confirmado'];
                $r['confirmado'] = true;
            } else {
                // Sin registro aún → usar valor_mensual como sugerencia editable
                $r['importe']    = $r['valor_mensual'] !== null ? (float) $r['valor_mensual'] : null;
                $r['confirmado'] = false;
            }
            unset($r['importe_confirmado'], $r['valor_mensual']);
        }

        // Total: suma de confirmados + sugeridos (valor_mensual)
        $total = array_sum(array_filter(
            array_column($rows, 'importe'),
            fn($v) => $v !== null
        ));

        return $this->ok(['mes' => $mes, 'pacientes' => $rows, 'total' => (float) $total]);
    }

    public function update(int $pacienteId, string $mes)
    {
        if (!preg_match('/^\d{4}-\d{2}$/', $mes)) {
            return $this->fail('Formato de mes inválido (YYYY-MM)', 422);
        }

        $json    = $this->request->getJSON(true) ?? [];
        $importe = isset($json['importe']) ? (float) $json['importe'] : 0.0;
        $now     = date('Y-m-d H:i:s');

        $existe = $this->db->table('pagos_mensuales')
            ->where('paciente_id', $pacienteId)
            ->where('mes', $mes)
            ->countAllResults();

        if ($existe) {
            $this->db->table('pagos_mensuales')
                ->where('paciente_id', $pacienteId)
                ->where('mes', $mes)
                ->update(['importe' => $importe, 'updated_at' => $now]);
        } else {
            $this->db->table('pagos_mensuales')->insert([
                'paciente_id' => $pacienteId,
                'mes'         => $mes,
                'importe'     => $importe,
                'created_at'  => $now,
                'updated_at'  => $now,
            ]);
        }

        // Actualizar valor_mensual del paciente para que sea el nuevo valor por defecto
        $this->db->table('pacientes')
            ->where('id', $pacienteId)
            ->update(['valor_mensual' => $importe, 'updated_at' => $now]);

        return $this->ok(['paciente_id' => $pacienteId, 'mes' => $mes, 'importe' => $importe]);
    }
}
