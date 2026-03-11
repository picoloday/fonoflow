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

        $sesionesHoy = $sesionModel->listar(null, $hoy);

        return $this->ok([
            'total_pacientes'   => $pacienteModel->where('activo', 1)->where('deleted_at IS NULL')->countAllResults(),
            'citas_hoy'         => count($sesionesHoy),
            'sesiones_este_mes' => $sesionModel->totalMes($mes),
            'ingresos_este_mes' => (float)$sesionModel->ingresosMes($mes),
            'proximas_citas'    => $sesionesHoy,
            'ultimas_sesiones'  => array_slice($sesionModel->listar(), 0, 5),
        ]);
    }
}
