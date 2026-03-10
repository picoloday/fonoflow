<?php

namespace App\Database\Migrations;

use CodeIgniter\Database\Migration;

class CreateSesionesTable extends Migration
{
    public function up()
    {
        // Sesiones (registro clínico)
        $this->forge->addField([
            'id'           => ['type' => 'INT', 'constraint' => 11, 'unsigned' => true, 'auto_increment' => true],
            'paciente_id'  => ['type' => 'INT', 'constraint' => 11, 'unsigned' => true],
            'cita_id'      => ['type' => 'INT', 'constraint' => 11, 'unsigned' => true, 'null' => true],
            'fecha'        => ['type' => 'DATE'],
            'duracion'     => ['type' => 'INT', 'constraint' => 11, 'default' => 30],
            'precio'       => ['type' => 'DECIMAL', 'constraint' => '8,2', 'default' => 12.00],
            'evolutivo'    => ['type' => 'TEXT', 'null' => true],
            'observaciones'=> ['type' => 'TEXT', 'null' => true],
            'created_at'   => ['type' => 'DATETIME', 'null' => true],
            'updated_at'   => ['type' => 'DATETIME', 'null' => true],
            'deleted_at'   => ['type' => 'DATETIME', 'null' => true],
        ]);
        $this->forge->addKey('id', true);
        $this->forge->addForeignKey('paciente_id', 'pacientes', 'id', 'CASCADE', 'CASCADE');
        $this->forge->addForeignKey('cita_id', 'citas', 'id', 'CASCADE', 'SET NULL');
        $this->forge->createTable('sesiones');

        // Objetivos de la sesión (con estado de cumplimiento)
        $this->forge->addField([
            'id'         => ['type' => 'INT', 'constraint' => 11, 'unsigned' => true, 'auto_increment' => true],
            'sesion_id'  => ['type' => 'INT', 'constraint' => 11, 'unsigned' => true],
            'objetivo'   => ['type' => 'TEXT'],
            'cumplido'   => ['type' => 'TINYINT', 'constraint' => 1, 'default' => 0],
            'orden'      => ['type' => 'INT', 'constraint' => 11, 'default' => 0],
        ]);
        $this->forge->addKey('id', true);
        $this->forge->addForeignKey('sesion_id', 'sesiones', 'id', 'CASCADE', 'CASCADE');
        $this->forge->createTable('sesion_objetivos');

        // Actividades de la sesión
        $this->forge->addField([
            'id'        => ['type' => 'INT', 'constraint' => 11, 'unsigned' => true, 'auto_increment' => true],
            'sesion_id' => ['type' => 'INT', 'constraint' => 11, 'unsigned' => true],
            'actividad' => ['type' => 'VARCHAR', 'constraint' => 255],
        ]);
        $this->forge->addKey('id', true);
        $this->forge->addForeignKey('sesion_id', 'sesiones', 'id', 'CASCADE', 'CASCADE');
        $this->forge->createTable('sesion_actividades');

        // Materiales de la sesión
        $this->forge->addField([
            'id'        => ['type' => 'INT', 'constraint' => 11, 'unsigned' => true, 'auto_increment' => true],
            'sesion_id' => ['type' => 'INT', 'constraint' => 11, 'unsigned' => true],
            'material'  => ['type' => 'VARCHAR', 'constraint' => 255],
        ]);
        $this->forge->addKey('id', true);
        $this->forge->addForeignKey('sesion_id', 'sesiones', 'id', 'CASCADE', 'CASCADE');
        $this->forge->createTable('sesion_materiales');
    }

    public function down()
    {
        $this->forge->dropTable('sesion_materiales', true);
        $this->forge->dropTable('sesion_actividades', true);
        $this->forge->dropTable('sesion_objetivos', true);
        $this->forge->dropTable('sesiones', true);
    }
}
