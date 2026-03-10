<?php

namespace App\Database\Migrations;

use CodeIgniter\Database\Migration;

class CreatePacientesTable extends Migration
{
    public function up()
    {
        $this->forge->addField([
            'id'               => ['type' => 'INT', 'constraint' => 11, 'unsigned' => true, 'auto_increment' => true],
            'nombre'           => ['type' => 'VARCHAR', 'constraint' => 255],
            'tutor'            => ['type' => 'VARCHAR', 'constraint' => 255, 'null' => true],
            'telefono'         => ['type' => 'VARCHAR', 'constraint' => 50, 'null' => true],
            'email'            => ['type' => 'VARCHAR', 'constraint' => 255, 'null' => true],
            'fecha_nacimiento' => ['type' => 'DATE', 'null' => true],
            'foto'             => ['type' => 'LONGTEXT', 'null' => true],
            'notas'            => ['type' => 'TEXT', 'null' => true],
            'activo'           => ['type' => 'TINYINT', 'constraint' => 1, 'default' => 1],
            'fecha_alta'       => ['type' => 'DATETIME', 'null' => true],
            'updated_at'       => ['type' => 'DATETIME', 'null' => true],
            'created_at'       => ['type' => 'DATETIME', 'null' => true],
            'deleted_at'       => ['type' => 'DATETIME', 'null' => true],
        ]);
        $this->forge->addKey('id', true);
        $this->forge->createTable('pacientes');

        // Patologías del paciente
        $this->forge->addField([
            'id'          => ['type' => 'INT', 'constraint' => 11, 'unsigned' => true, 'auto_increment' => true],
            'paciente_id' => ['type' => 'INT', 'constraint' => 11, 'unsigned' => true],
            'patologia'   => ['type' => 'VARCHAR', 'constraint' => 150],
        ]);
        $this->forge->addKey('id', true);
        $this->forge->addForeignKey('paciente_id', 'pacientes', 'id', 'CASCADE', 'CASCADE');
        $this->forge->createTable('paciente_patologias');

        // Objetivos generales del paciente
        $this->forge->addField([
            'id'          => ['type' => 'INT', 'constraint' => 11, 'unsigned' => true, 'auto_increment' => true],
            'paciente_id' => ['type' => 'INT', 'constraint' => 11, 'unsigned' => true],
            'objetivo'    => ['type' => 'TEXT'],
            'orden'       => ['type' => 'INT', 'constraint' => 11, 'default' => 0],
        ]);
        $this->forge->addKey('id', true);
        $this->forge->addForeignKey('paciente_id', 'pacientes', 'id', 'CASCADE', 'CASCADE');
        $this->forge->createTable('paciente_objetivos');
    }

    public function down()
    {
        $this->forge->dropTable('paciente_objetivos', true);
        $this->forge->dropTable('paciente_patologias', true);
        $this->forge->dropTable('pacientes', true);
    }
}
