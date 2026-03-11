<?php

namespace App\Database\Migrations;

use CodeIgniter\Database\Migration;

/**
 * Añade campos de estado y control de asistencia a la tabla sesiones:
 *
 *  - hora_inicio      TIME NULL            (si no existe aún)
 *  - estado           ENUM programada|completada|cancelada  DEFAULT programada
 *  - asistio          TINYINT(1) NULL      (null=pendiente, 1=sí, 0=no)
 *  - motivo_ausencia  VARCHAR(255) NULL
 *  - reprogramar      TINYINT(1) DEFAULT 0
 */
class AddSesionEstado extends Migration
{
    public function up()
    {
        // hora_inicio puede que ya exista si la BD se creó antes que las migraciones
        if (! $this->db->fieldExists('hora_inicio', 'sesiones')) {
            $this->forge->addColumn('sesiones', [
                'hora_inicio' => [
                    'type'  => 'TIME',
                    'null'  => true,
                    'after' => 'fecha',
                ],
            ]);
        }

        $this->forge->addColumn('sesiones', [
            'estado' => [
                'type'       => 'ENUM',
                'constraint' => ['programada', 'completada', 'cancelada'],
                'default'    => 'programada',
                'after'      => 'precio',
            ],
            'asistio' => [
                'type'       => 'TINYINT',
                'constraint' => 1,
                'null'       => true,
                'after'      => 'estado',
            ],
            'motivo_ausencia' => [
                'type'       => 'VARCHAR',
                'constraint' => 255,
                'null'       => true,
                'after'      => 'asistio',
            ],
            'reprogramar' => [
                'type'       => 'TINYINT',
                'constraint' => 1,
                'default'    => 0,
                'after'      => 'motivo_ausencia',
            ],
        ]);
    }

    public function down()
    {
        $this->forge->dropColumn('sesiones', ['estado', 'asistio', 'motivo_ausencia', 'reprogramar']);
    }
}
