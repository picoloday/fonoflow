<?php

namespace App\Database\Migrations;

use CodeIgniter\Database\Migration;

/**
 * Amplía el ENUM estado de sesiones para incluir 'reprogramada'.
 * Una sesión cancelada con reprogramar=1 pasa a 'reprogramada'
 * automáticamente cuando se crea la nueva sesión del paciente.
 */
class AddReprogramadaEstado extends Migration
{
    public function up()
    {
        $this->db->query(
            "ALTER TABLE sesiones MODIFY COLUMN estado
             ENUM('programada','completada','cancelada','reprogramada')
             NOT NULL DEFAULT 'programada'"
        );
    }

    public function down()
    {
        $this->db->query(
            "ALTER TABLE sesiones MODIFY COLUMN estado
             ENUM('programada','completada','cancelada')
             NOT NULL DEFAULT 'programada'"
        );
    }
}
