<?php

namespace App\Database\Migrations;

use CodeIgniter\Database\Migration;

/**
 * Añade campos faltantes y tablas catálogo para listas ampliables.
 *
 * - parentesco del tutor en pacientes
 * - cita_actividades (actividades planificadas en la cita)
 * - cat_patologias, cat_materiales, cat_actividades (listas maestras ampliables)
 */
class AddMissingFields extends Migration
{
    public function up()
    {
        // 1. parentesco del tutor
        $this->forge->addColumn('pacientes', [
            'parentesco' => [
                'type'       => 'VARCHAR',
                'constraint' => 50,
                'null'       => true,
                'after'      => 'email',
            ],
        ]);

        // 2. Actividades planificadas para la cita
        $this->forge->addField([
            'id'        => ['type' => 'INT', 'constraint' => 11, 'unsigned' => true, 'auto_increment' => true],
            'cita_id'   => ['type' => 'INT', 'constraint' => 11, 'unsigned' => true],
            'actividad' => ['type' => 'VARCHAR', 'constraint' => 255],
        ]);
        $this->forge->addKey('id', true);
        $this->forge->addForeignKey('cita_id', 'citas', 'id', 'CASCADE', 'CASCADE');
        $this->forge->createTable('cita_actividades');

        // 3. Catálogo de patologías
        $this->forge->addField([
            'id'         => ['type' => 'INT', 'constraint' => 11, 'unsigned' => true, 'auto_increment' => true],
            'nombre'     => ['type' => 'VARCHAR', 'constraint' => 150],
            'activo'     => ['type' => 'TINYINT', 'constraint' => 1, 'default' => 1],
            'created_at' => ['type' => 'DATETIME', 'null' => true],
        ]);
        $this->forge->addKey('id', true);
        $this->forge->addUniqueKey('nombre');
        $this->forge->createTable('cat_patologias');

        // 4. Catálogo de materiales
        $this->forge->addField([
            'id'         => ['type' => 'INT', 'constraint' => 11, 'unsigned' => true, 'auto_increment' => true],
            'nombre'     => ['type' => 'VARCHAR', 'constraint' => 255],
            'activo'     => ['type' => 'TINYINT', 'constraint' => 1, 'default' => 1],
            'created_at' => ['type' => 'DATETIME', 'null' => true],
        ]);
        $this->forge->addKey('id', true);
        $this->forge->addUniqueKey('nombre');
        $this->forge->createTable('cat_materiales');

        // 5. Catálogo de actividades
        $this->forge->addField([
            'id'         => ['type' => 'INT', 'constraint' => 11, 'unsigned' => true, 'auto_increment' => true],
            'nombre'     => ['type' => 'VARCHAR', 'constraint' => 255],
            'activo'     => ['type' => 'TINYINT', 'constraint' => 1, 'default' => 1],
            'created_at' => ['type' => 'DATETIME', 'null' => true],
        ]);
        $this->forge->addKey('id', true);
        $this->forge->addUniqueKey('nombre');
        $this->forge->createTable('cat_actividades');
    }

    public function down()
    {
        $this->forge->dropTable('cat_actividades', true);
        $this->forge->dropTable('cat_materiales', true);
        $this->forge->dropTable('cat_patologias', true);
        $this->forge->dropTable('cita_actividades', true);
        $this->forge->dropColumn('pacientes', 'parentesco');
    }
}
