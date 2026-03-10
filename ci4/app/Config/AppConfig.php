<?php

namespace App\Config;

class AppConfig
{
    public static array $patologias = [
        'Dislalia',
        'Disfasia',
        'Tartamudez',
        'Afasia',
        'Disfonía',
        'Disfemia',
        'Retraso del lenguaje',
        'Trastorno del espectro autista (TEA)',
        'Deglución atípica',
        'Disglosia',
    ];

    public static array $duraciones = [30, 45, 60];

    public static array $motivosAusencia = [
        'Enfermedad',
        'Trabajo',
        'Viaje',
        'Olvido',
        'Emergencia familiar',
        'Sin avisar',
        'Otro',
    ];

    public static string $horaInicio = '15:00';
    public static string $horaFin    = '21:00';

    public static array $estados = [
        'programada'  => ['label' => 'Programada',   'color' => 'teal'],
        'completada'  => ['label' => 'Completada',   'color' => 'green'],
        'realizada'   => ['label' => 'Realizada',    'color' => 'green'],
        'cancelada'   => ['label' => 'Cancelada',    'color' => 'red'],
        'no_asistio'  => ['label' => 'No asistió',   'color' => 'gray'],
    ];
}
