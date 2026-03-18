<?php

if (!function_exists('fecha_dia')) {
    /**
     * Formatea una fecha como "Mié, 20/03/2026"
     */
    function fecha_dia(string $fecha): string
    {
        $dias = ['Lun', 'Mar', 'Mié', 'Jue', 'Vie', 'Sáb', 'Dom'];
        $ts   = strtotime($fecha);
        return $dias[date('N', $ts) - 1] . ', ' . date('d/m/Y', $ts);
    }
}
