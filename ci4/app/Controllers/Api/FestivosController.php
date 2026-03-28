<?php

namespace App\Controllers\Api;

/**
 * GET    /api/v1/festivos?año=YYYY     → lista festivos del año (auto-sincroniza si está vacío)
 * POST   /api/v1/festivos/sync?año=YYYY → fuerza sincronización con API Nager
 * DELETE /api/v1/festivos/{id}          → eliminar un festivo
 *
 * Fuente: date.nager.at — festivos nacionales ES + Comunidad de Madrid (ES-MD)
 */
class FestivosController extends BaseApiController
{
    public function index()
    {
        $año = (int)($this->request->getGet('año') ?? date('Y'));

        // Auto-sincronizar si no hay datos para este año
        $count = $this->db->table('festivos')
            ->where('YEAR(fecha)', $año)
            ->countAllResults();

        if ($count === 0) {
            $this->sincronizar($año);
        }

        $festivos = $this->db->table('festivos')
            ->where('YEAR(fecha)', $año)
            ->orderBy('fecha', 'ASC')
            ->get()->getResultArray();

        return $this->ok(['año' => $año, 'festivos' => $festivos]);
    }

    public function sync()
    {
        $año = (int)($this->request->getGet('año') ?? date('Y'));

        // Borrar los del año y re-sincronizar desde la API
        $this->db->table('festivos')->where('YEAR(fecha)', $año)->delete();
        $sincronizados = $this->sincronizar($año);

        return $this->ok([
            'año'          => $año,
            'sincronizados' => $sincronizados,
            'mensaje'      => "$sincronizados festivos importados para $año",
        ]);
    }

    public function delete(int $id)
    {
        $this->db->table('festivos')->where('id', $id)->delete();
        return $this->noContent();
    }

    // -------------------------------------------------------
    private function sincronizar(int $año): int
    {
        $url = "https://date.nager.at/api/v3/PublicHolidays/{$año}/ES";

        try {
            $client   = \Config\Services::curlrequest();
            $response = $client->get($url, [
                'timeout'    => 8,
                'verify'     => false,
                'http_errors' => false,
            ]);
            $data = json_decode($response->getBody(), true);
        } catch (\Throwable $e) {
            return 0;
        }

        if (!is_array($data) || empty($data)) return 0;

        $count = 0;
        foreach ($data as $f) {
            $esMadrid  = !empty($f['counties']) && in_array('ES-MD', (array)$f['counties']);
            $esNacional = $f['global'] === true;

            if (!$esNacional && !$esMadrid) continue;

            try {
                $this->db->table('festivos')->insert([
                    'fecha'  => $f['date'],
                    'nombre' => $f['localName'],
                ]);
                $count++;
            } catch (\Throwable $e) {
                // UNIQUE KEY: ya existe, ignorar
            }
        }

        return $count;
    }
}
