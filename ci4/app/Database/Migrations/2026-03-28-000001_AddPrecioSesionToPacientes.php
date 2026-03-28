<?php

namespace App\Database\Migrations;

use CodeIgniter\Database\Migration;

class AddPrecioSesionToPacientes extends Migration
{
    public function up()
    {
        $this->forge->addColumn('pacientes', [
            'precio_sesion' => [
                'type'    => 'DECIMAL',
                'constraint' => '8,2',
                'null'    => true,
                'default' => null,
                'after'   => 'dias_semana',
            ],
        ]);
    }

    public function down()
    {
        $this->forge->dropColumn('pacientes', 'precio_sesion');
    }
}
