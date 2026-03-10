<?= $this->extend('layouts/main') ?>
<?= $this->section('content') ?>

<?php
$diasCortos  = ['L', 'M', 'X', 'J', 'V', 'S', 'D'];
$diasLargos  = ['lunes', 'martes', 'miércoles', 'jueves', 'viernes', 'sábado', 'domingo'];
$mesesLargos = [
    '01' => 'enero',    '02' => 'febrero',   '03' => 'marzo',
    '04' => 'abril',    '05' => 'mayo',       '06' => 'junio',
    '07' => 'julio',    '08' => 'agosto',     '09' => 'septiembre',
    '10' => 'octubre',  '11' => 'noviembre',  '12' => 'diciembre',
];
$fechaTs     = strtotime($fecha);
$diaNum      = (int)date('j', $fechaTs);
$diaLargo    = $diasLargos[date('N', $fechaTs) - 1];
$mesLargoSel = $mesesLargos[date('m', $fechaTs)] ?? '';

$colores = [
    'programada' => 'teal',
    'completada' => 'green',
    'realizada'  => 'green',
    'cancelada'  => 'red',
    'no_asistio' => 'gray',
];
?>

<!-- Cabecera -->
<div class="flex flex-wrap justify-between items-center mb-6 gap-3">
    <h2 class="text-2xl font-semibold flex items-center gap-2">
        <svg xmlns="http://www.w3.org/2000/svg" class="h-7 w-7 text-teal-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2"
                  d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
        </svg>
        Agenda
    </h2>
    <a href="<?= base_url('citas/nueva?fecha=' . $fecha) ?>"
       class="inline-flex items-center gap-1.5 bg-teal-600 text-white px-4 py-2 rounded-lg hover:bg-teal-700 text-sm font-medium transition-colors">
        <svg xmlns="http://www.w3.org/2000/svg" class="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 4v16m8-8H4" />
        </svg>
        Nueva Sesión
    </a>
</div>

<!-- Layout: calendario | detalle del día -->
<div class="flex flex-col lg:flex-row gap-6 items-start">

    <!-- ══════════════════════════════════
         CALENDARIO MENSUAL
    ══════════════════════════════════════ -->
    <div class="bg-white shadow-sm rounded-xl p-5 w-full lg:w-72 xl:w-80 flex-shrink-0">

        <!-- Navegación de mes -->
        <div class="flex items-center justify-between mb-4">
            <h3 class="text-sm font-semibold text-gray-900">
                <?= ucfirst($mesNombre) ?> <?= $anio ?>
            </h3>
            <div class="flex items-center gap-0.5">
                <a href="?mes=<?= $mesPrev ?>&fecha=<?= $mesPrev ?>-01"
                   class="p-1.5 rounded-lg hover:bg-gray-100 text-gray-400 hover:text-gray-700 transition-colors"
                   title="Mes anterior">
                    <svg xmlns="http://www.w3.org/2000/svg" class="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M15 19l-7-7 7-7" />
                    </svg>
                </a>
                <a href="?mes=<?= date('Y-m') ?>&fecha=<?= $today ?>"
                   class="px-2 py-1 rounded-lg hover:bg-gray-100 text-gray-400 hover:text-gray-700 text-xs font-semibold transition-colors"
                   title="Ir a hoy">Hoy</a>
                <a href="?mes=<?= $mesNext ?>&fecha=<?= $mesNext ?>-01"
                   class="p-1.5 rounded-lg hover:bg-gray-100 text-gray-400 hover:text-gray-700 transition-colors"
                   title="Mes siguiente">
                    <svg xmlns="http://www.w3.org/2000/svg" class="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9 5l7 7-7 7" />
                    </svg>
                </a>
            </div>
        </div>

        <!-- Nombres de días de semana -->
        <div class="grid grid-cols-7 mb-1">
            <?php foreach ($diasCortos as $dc): ?>
                <div class="text-center text-xs font-semibold text-gray-400 py-1"><?= $dc ?></div>
            <?php endforeach; ?>
        </div>

        <!-- Cuadrícula de días -->
        <div class="grid grid-cols-7 gap-y-0.5">
            <?php foreach ($semanas as $semana): ?>
                <?php foreach ($semana as $dia): ?>
                    <?php
                        $esMesActual = substr($dia, 0, 7) === $mes;
                        $esSeleccion = $dia === $fecha;
                        $esHoy       = $dia === $today;
                        $diaCitas    = $citasPorDia[$dia] ?? [];
                        $numDia      = (int)date('j', strtotime($dia));

                        if ($esSeleccion && $esHoy) {
                            $numClases = 'bg-teal-600 text-white ring-2 ring-teal-300 ring-offset-1';
                        } elseif ($esSeleccion) {
                            $numClases = 'bg-teal-600 text-white';
                        } elseif ($esHoy) {
                            $numClases = 'bg-teal-100 text-teal-700 font-bold';
                        } else {
                            $numClases = 'text-gray-700';
                        }
                    ?>

                    <?php if ($esMesActual): ?>
                        <a href="?mes=<?= $mes ?>&fecha=<?= $dia ?>"
                           class="flex flex-col items-center py-0.5 rounded-lg hover:bg-teal-50 transition-colors">
                    <?php else: ?>
                        <div class="flex flex-col items-center py-0.5 rounded-lg opacity-20">
                    <?php endif; ?>

                        <span class="w-8 h-8 flex items-center justify-center rounded-full text-sm transition-colors <?= $numClases ?>">
                            <?= $numDia ?>
                        </span>
                        <div class="flex gap-0.5 h-1.5">
                            <?php if ($esMesActual && !empty($diaCitas)): ?>
                                <?php foreach (array_slice($diaCitas, 0, 3) as $c): ?>
                                    <div class="h-1.5 w-1.5 rounded-full bg-<?= $colores[$c['estado']] ?? 'gray' ?>-500"></div>
                                <?php endforeach; ?>
                            <?php endif; ?>
                        </div>

                    <?php if ($esMesActual): ?>
                        </a>
                    <?php else: ?>
                        </div>
                    <?php endif; ?>

                <?php endforeach; ?>
            <?php endforeach; ?>
        </div>

        <!-- Leyenda de colores -->
        <div class="mt-4 pt-4 border-t border-gray-100 grid grid-cols-2 gap-x-3 gap-y-1.5">
            <div class="flex items-center gap-1.5 text-xs text-gray-500">
                <span class="h-2 w-2 rounded-full bg-teal-500 flex-shrink-0"></span>Programada
            </div>
            <div class="flex items-center gap-1.5 text-xs text-gray-500">
                <span class="h-2 w-2 rounded-full bg-green-500 flex-shrink-0"></span>Realizada
            </div>
            <div class="flex items-center gap-1.5 text-xs text-gray-500">
                <span class="h-2 w-2 rounded-full bg-red-500 flex-shrink-0"></span>Cancelada
            </div>
            <div class="flex items-center gap-1.5 text-xs text-gray-500">
                <span class="h-2 w-2 rounded-full bg-gray-400 flex-shrink-0"></span>No asistió
            </div>
        </div>
    </div>

    <!-- ══════════════════════════════════
         DETALLE DEL DÍA SELECCIONADO
    ══════════════════════════════════════ -->
    <div class="flex-1 min-w-0 space-y-4">

        <!-- Encabezado del día -->
        <div class="bg-white shadow-sm rounded-xl px-5 py-4 flex flex-wrap justify-between items-center gap-3">
            <div>
                <h3 class="text-base font-semibold text-gray-800 capitalize">
                    <?= $diaLargo ?>, <?= $diaNum ?> de <?= $mesLargoSel ?> de <?= $anio ?>
                </h3>
                <?php
                    $numCitasDia = count($citasPorDia[$fecha] ?? []);
                    if ($numCitasDia === 0)     $txtCitas = 'Sin sesiones programadas';
                    elseif ($numCitasDia === 1) $txtCitas = '1 sesión programada';
                    else                        $txtCitas = "$numCitasDia sesiones programadas";
                ?>
                <p class="text-sm text-gray-400 mt-0.5">
                    <?= $txtCitas ?>
                    <?php if ($fecha === $today): ?>
                        <span class="ml-2 bg-teal-100 text-teal-700 px-2 py-0.5 rounded-full text-xs font-medium">Hoy</span>
                    <?php endif; ?>
                </p>
            </div>
            <a href="<?= base_url('citas/nueva?fecha=' . $fecha) ?>"
               class="inline-flex items-center gap-1.5 px-3 py-1.5 border border-teal-500 text-teal-600 rounded-lg hover:bg-teal-50 text-sm font-medium transition-colors">
                <svg xmlns="http://www.w3.org/2000/svg" class="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 4v16m8-8H4" />
                </svg>
                Nueva sesión
            </a>
        </div>

        <!-- Timeline de horas -->
        <div class="bg-white shadow-sm rounded-xl overflow-hidden">

            <!-- Cabecera del timeline -->
            <div class="px-4 py-2.5 bg-gray-50 border-b border-gray-100 flex justify-between items-center">
                <span class="text-xs font-semibold text-gray-500 uppercase tracking-wide">
                    <?= $horaInicio ?> – <?= $horaFin ?>
                </span>
                <?php
                    $nOcupados = count(array_filter($slots, fn($s) => $s !== null));
                    $nLibres   = count($slots) - $nOcupados;
                ?>
                <span class="text-xs text-gray-400">
                    <?= $nOcupados ?> ocupado<?= $nOcupados !== 1 ? 's' : '' ?>
                    · <?= $nLibres ?> libre<?= $nLibres !== 1 ? 's' : '' ?>
                </span>
            </div>

            <div class="divide-y divide-gray-100">
                <?php foreach ($slots as $hora => $cita): ?>
                    <div class="flex items-stretch min-h-[52px]">

                        <!-- Etiqueta de hora -->
                        <div class="w-16 px-3 border-r border-gray-100 flex items-center justify-end flex-shrink-0">
                            <span class="text-xs text-gray-400 font-mono"><?= $hora ?></span>
                        </div>

                        <!-- Contenido -->
                        <div class="flex-1 px-3 py-2 flex items-center">

                            <?php if ($cita):
                                $col     = $colores[$cita['estado']] ?? 'gray';
                                $est     = $estados[$cita['estado']] ?? ['label' => ucfirst(str_replace('_', ' ', $cita['estado']))];
                                $urlItem = ($cita['_tipo'] ?? '') === 'sesion' ? 'sesiones/' . $cita['id'] : 'citas/' . $cita['id'];
                            ?>
                                <a href="<?= base_url($urlItem) ?>"
                                   class="w-full flex justify-between items-center rounded-lg px-2 py-1.5 -mx-2 -my-1.5 hover:bg-teal-50 transition-colors group">

                                    <div class="flex items-center gap-3 min-w-0">
                                        <div class="h-2.5 w-2.5 rounded-full bg-<?= $col ?>-500 flex-shrink-0"></div>
                                        <div class="min-w-0">
                                            <div class="font-semibold text-sm text-gray-800 group-hover:text-teal-700 transition-colors truncate">
                                                <?= esc($cita['paciente_nombre']) ?>
                                            </div>
                                            <div class="text-xs text-gray-400"><?= $cita['duracion'] ?> min</div>
                                        </div>
                                    </div>

                                    <div class="flex items-center gap-2 flex-shrink-0 ml-3">
                                        <span class="hidden sm:inline-block px-2 py-0.5 rounded-full text-xs font-medium bg-<?= $col ?>-100 text-<?= $col ?>-700">
                                            <?= $est['label'] ?>
                                        </span>
                                        <span class="text-green-600 font-semibold text-sm">
                                            <?= number_format($cita['precio'], 2) ?>€
                                        </span>
                                        <svg xmlns="http://www.w3.org/2000/svg" class="h-4 w-4 text-gray-300 group-hover:text-teal-400 transition-colors" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9 5l7 7-7 7" />
                                        </svg>
                                    </div>
                                </a>

                            <?php else: ?>
                                <a href="<?= base_url('citas/nueva?fecha=' . $fecha . '&hora=' . urlencode($hora)) ?>"
                                   class="flex items-center gap-1.5 text-sm text-gray-300 hover:text-teal-500 transition-colors w-full">
                                    <svg xmlns="http://www.w3.org/2000/svg" class="h-3.5 w-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                        <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 4v16m8-8H4" />
                                    </svg>
                                    Disponible
                                </a>
                            <?php endif; ?>

                        </div>
                    </div>
                <?php endforeach; ?>
            </div>
        </div>

    </div><!-- /detalle -->
</div><!-- /layout -->

<?= $this->endSection() ?>
