<?php

namespace App\Database\Migrations;

use CodeIgniter\Database\Migration;

class AddHorarioToPacientes extends Migration
{
    public function up(): void
    {
        $this->db->query("ALTER TABLE pacientes
            ADD COLUMN dias_semana    VARCHAR(20)  NULL COMMENT '1=Lun,2=Mar,3=Mié,4=Jue,5=Vie,6=Sáb. Ej: 1,3',
            ADD COLUMN hora_sesion    TIME         NULL COMMENT 'Hora habitual de la sesión',
            ADD COLUMN duracion_sesion INT UNSIGNED NULL DEFAULT 30 COMMENT 'Duración en minutos: 30, 45 o 60'
        ");
    }

    public function down(): void
    {
        $this->db->query("ALTER TABLE pacientes
            DROP COLUMN dias_semana,
            DROP COLUMN hora_sesion,
            DROP COLUMN duracion_sesion
        ");
    }
}
