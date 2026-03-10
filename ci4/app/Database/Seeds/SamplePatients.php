<?php

namespace App\Database\Seeds;

use CodeIgniter\Database\Seeder;
use App\Models\PacienteModel;
use App\Config\AppConfig;

class SamplePatients extends Seeder
{
    public function run()
    {
        $model = new PacienteModel();

        $names = [
            'Lucas Pérez', 'María Rodríguez', 'Sofía García',
            'Mateo López', 'Emma Martínez', 'Liam Sánchez',
            'Olivia Fernández', 'Noah Gómez', 'Ava Díaz', 'Ethan Ruiz',
        ];

        $patologias = AppConfig::$patologias;

        foreach ($names as $name) {
            // choose 1-3 random patologías, maybe include a custom one
            $count = rand(1, 3);
            shuffle($patologias);
            $chosen = array_slice($patologias, 0, $count);
            // add occasional custom pathology
            if (rand(0, 3) === 0) {
                $chosen[] = 'Patología prueba ' . rand(1, 5);
            }

            $data = [
                'nombre' => $name,
                'tutor'  => 'Responsable ' . explode(' ', $name)[0],
                'telefono' => '60000000' . rand(0,9),
                'email' => strtolower(str_replace(' ', '.', $name)) . '@mail.com',
                'fecha_nacimiento' => date('Y-m-d', strtotime('-' . rand(5,15) . ' years')),
                'activo' => 1,
                'notas' => 'Paciente de ejemplo.',
                'patologias' => $chosen,
                'objetivos_generales' => ['Mejorar pronunciación', 'Aumentar vocabulario'],
            ];

            $model->crear($data);
        }
    }
}
