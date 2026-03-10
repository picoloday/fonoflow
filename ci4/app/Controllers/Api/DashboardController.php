<?php

namespace App\Controllers\Api;

use App\Models\PacienteModel;
use App\Models\CitaModel;
use App\Models\SesionModel;

/**
 * GET /api/v1/dashboard → estadísticas del panel principal
 */
class DashboardController extends BaseApiController
{
    public function index()
    {
        $pacienteModel = new PacienteModel();
        $citaModel     = new CitaModel();
        $sesionModel   = new SesionModel();

        $hoy = date('Y-m-d');
        $mes = date('Y-m');

        return $this->ok([
            'total_pacientes'   => $pacienteModel->where('activo', 1)->where('deleted_at IS NULL')->countAllResults(),
            'citas_hoy'         => count($citaModel->listar($hoy)),
            'sesiones_este_mes' => $sesionModel->totalMes($mes),
            'ingresos_este_mes' => (float)$sesionModel->ingresosMes($mes),
            'proximas_citas'    => $citaModel->listar($hoy),
            'ultimas_sesiones'  => array_slice($sesionModel->listar(), 0, 5),
        ]);
    }
}
