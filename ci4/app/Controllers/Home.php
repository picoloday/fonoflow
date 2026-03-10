<?php

namespace App\Controllers;

use App\Models\PacienteModel;
use App\Models\CitaModel;
use App\Models\SesionModel;

class Home extends BaseController
{
    public function index(): string
    {
        $pacienteModel = new PacienteModel();
        $citaModel     = new CitaModel();
        $sesionModel   = new SesionModel();

        $hoy = date('Y-m-d');
        $mes = date('Y-m');

        $data = [
            'titulo'          => 'Dashboard',
            'totalPacientes'  => $pacienteModel->where('activo', 1)->where('deleted_at IS NULL')->countAllResults(),
            'citasHoy'        => count($citaModel->listar($hoy)),
            'sesionesEsteMes' => $sesionModel->totalMes($mes),
            'ingresosEsteMes' => $sesionModel->ingresosMes($mes),
            'proximasCitas'   => $citaModel->listar($hoy),
            'ultimasSesiones' => array_slice($sesionModel->listar(), 0, 5),
        ];

        return view('home/dashboard', $data);
    }
}
