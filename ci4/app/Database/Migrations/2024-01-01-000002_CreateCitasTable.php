<?php

namespace App\Database\Migrations;

use CodeIgniter\Database\Migration;

class CreateCitasTable extends Migration
{
    public function up()
    {
        // Citas (sesiones agenda)
        $this->forge->addField([
            'id'              => ['type' => 'INT', 'constraint' => 11, 'unsigned' => true, 'auto_increment' => true],
            'paciente_id'     => ['type' => 'INT', 'constraint' => 11, 'unsigned' => true],
            'fecha'           => ['type' => 'DATE'],
            'hora_inicio'     => ['type' => 'VARCHAR', 'constraint' => 5],
            'duracion'        => ['type' => 'INT', 'constraint' => 11, 'default' => 30],
            'precio'          => ['type' => 'DECIMAL', 'constraint' => '8,2', 'default' => 12.00],
            'estado'          => ['type' => 'ENUM', 'constraint' => ['programada', 'completada', 'cancelada', 'no_asistio'], 'default' => 'programada'],
            'motivo_ausencia' => ['type' => 'VARCHAR', 'constraint' => 255, 'null' => true],
            'reprogramar'     => ['type' => 'TINYINT', 'constraint' => 1, 'null' => true],
            'notas'           => ['type' => 'TEXT', 'null' => true],
            'created_at'      => ['type' => 'DATETIME', 'null' => true],
            'updated_at'      => ['type' => 'DATETIME', 'null' => true],
            'deleted_at'      => ['type' => 'DATETIME', 'null' => true],
        ]);
        $this->forge->addKey('id', true);
        $this->forge->addForeignKey('paciente_id', 'pacientes', 'id', 'CASCADE', 'CASCADE');
        $this->forge->createTable('citas');

        // Objetivos de la cita
        $this->forge->addField([
            'id'       => ['type' => 'INT', 'constraint' => 11, 'unsigned' => true, 'auto_increment' => true],
            'cita_id'  => ['type' => 'INT', 'constraint' => 11, 'unsigned' => true],
            'objetivo' => ['type' => 'TEXT'],
            'orden'    => ['type' => 'INT', 'constraint' => 11, 'default' => 0],
        ]);
        $this->forge->addKey('id', true);
        $this->forge->addForeignKey('cita_id', 'citas', 'id', 'CASCADE', 'CASCADE');
        $this->forge->createTable('cita_objetivos');

        // Materiales de la cita
        $this->forge->addField([
            'id'       => ['type' => 'INT', 'constraint' => 11, 'unsigned' => true, 'auto_increment' => true],
            'cita_id'  => ['type' => 'INT', 'constraint' => 11, 'unsigned' => true],
            'material' => ['type' => 'VARCHAR', 'constraint' => 255],
        ]);
        $this->forge->addKey('id', true);
        $this->forge->addForeignKey('cita_id', 'citas', 'id', 'CASCADE', 'CASCADE');
        $this->forge->createTable('cita_materiales');
    }

    public function down()
    {
        $this->forge->dropTable('cita_materiales', true);
        $this->forge->dropTable('cita_objetivos', true);
        $this->forge->dropTable('citas', true);
    }
}
