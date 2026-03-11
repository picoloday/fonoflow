<?php

namespace App\Database\Migrations;

use CodeIgniter\Database\Migration;

/**
 * Añade sesion_reprogramada_id a sesiones:
 * cuando una sesión cancelada se reprograma, este campo apunta
 * al ID de la nueva sesión creada.
 */
class AddSesionReprogramadaId extends Migration
{
    public function up()
    {
        $this->forge->addColumn('sesiones', [
            'sesion_reprogramada_id' => [
                'type'       => 'INT',
                'constraint' => 11,
                'unsigned'   => true,
                'null'       => true,
                'default'    => null,
                'after'      => 'reprogramar',
            ],
        ]);
    }

    public function down()
    {
        $this->forge->dropColumn('sesiones', 'sesion_reprogramada_id');
    }
}
