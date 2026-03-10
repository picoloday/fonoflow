<?= $this->extend('layouts/main') ?>
<?= $this->section('content') ?>

<div class="flex flex-wrap justify-between items-center mb-6 gap-3">
    <h2 class="text-2xl font-semibold flex items-center gap-2">
        <svg xmlns="http://www.w3.org/2000/svg" class="h-7 w-7 text-teal-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2"
                  d="M3 12l2-2m0 0l7-7 7 7M5 10v10a1 1 0 001 1h3m10-11l2 2m-2-2v10a1 1 0 01-1 1h-3m-6 0h6" />
        </svg>
        Dashboard
    </h2>
    <span class="text-gray-500 text-sm"><?= date('l, d \d\e F \d\e Y') ?></span>
</div>

<!-- Tarjetas estadísticas -->
<div class="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-4 gap-4 mb-6">

    <div class="bg-white rounded-xl shadow-sm p-5 flex items-center gap-4">
        <div class="rounded-full bg-teal-100 p-3 flex-shrink-0">
            <svg xmlns="http://www.w3.org/2000/svg" class="h-6 w-6 text-teal-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2"
                      d="M17 20h5V4H2v16h5m5-9a3 3 0 100-6 3 3 0 000 6zm0 2c-3.314 0-6 1.343-6 3v1h12v-1c0-1.657-2.686-3-6-3z" />
            </svg>
        </div>
        <div>
            <div class="text-3xl font-bold"><?= $totalPacientes ?></div>
            <div class="text-gray-500 text-sm">Pacientes activos</div>
        </div>
    </div>

    <div class="bg-white rounded-xl shadow-sm p-5 flex items-center gap-4">
        <div class="rounded-full bg-yellow-100 p-3 flex-shrink-0">
            <svg xmlns="http://www.w3.org/2000/svg" class="h-6 w-6 text-yellow-500" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2"
                      d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
            </svg>
        </div>
        <div>
            <div class="text-3xl font-bold"><?= $citasHoy ?></div>
            <div class="text-gray-500 text-sm">Sesiones hoy</div>
        </div>
    </div>

    <div class="bg-white rounded-xl shadow-sm p-5 flex items-center gap-4">
        <div class="rounded-full bg-green-100 p-3 flex-shrink-0">
            <svg xmlns="http://www.w3.org/2000/svg" class="h-6 w-6 text-green-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2"
                      d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2m-6 9l2 2 4-4" />
            </svg>
        </div>
        <div>
            <div class="text-3xl font-bold"><?= $sesionesEsteMes ?></div>
            <div class="text-gray-500 text-sm">Sesiones este mes</div>
        </div>
    </div>

    <div class="bg-white rounded-xl shadow-sm p-5 flex items-center gap-4">
        <div class="rounded-full bg-indigo-100 p-3 flex-shrink-0">
            <svg xmlns="http://www.w3.org/2000/svg" class="h-6 w-6 text-indigo-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2"
                      d="M12 8c-1.657 0-3 .895-3 2s1.343 2 3 2 3 .895 3 2-1.343 2-3 2m0-8c1.11 0 2.08.402 2.599 1M12 8V7m0 1v8m0 0v1m0-1c-1.11 0-2.08-.402-2.599-1M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
            </svg>
        </div>
        <div>
            <div class="text-3xl font-bold"><?= number_format($ingresosEsteMes, 2) ?>€</div>
            <div class="text-gray-500 text-sm">Ingresos este mes</div>
        </div>
    </div>

</div>

<!-- Paneles principales -->
<div class="grid grid-cols-1 lg:grid-cols-2 gap-6">

    <!-- Sesiones de hoy -->
    <div class="bg-white rounded-xl shadow-sm flex flex-col">
        <div class="px-5 py-4 border-b flex justify-between items-center">
            <span class="font-semibold flex items-center gap-2">
                <svg xmlns="http://www.w3.org/2000/svg" class="h-5 w-5 text-teal-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2"
                          d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
                </svg>
                Sesiones de Hoy
            </span>
            <a href="<?= base_url('citas/nueva') ?>"
               class="inline-flex items-center gap-1 px-3 py-1.5 bg-teal-600 text-white rounded-lg text-sm hover:bg-teal-700 transition-colors">
                <svg xmlns="http://www.w3.org/2000/svg" class="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 4v16m8-8H4" />
                </svg>
                Nueva
            </a>
        </div>

        <?php if (empty($proximasCitas)): ?>
            <div class="flex-1 flex items-center justify-center py-12 text-gray-400 text-sm">
                No hay sesiones para hoy.
            </div>
        <?php else: ?>
            <div class="divide-y">
                <?php foreach ($proximasCitas as $c):
                    $colores = ['programada'=>'teal','realizada'=>'green','completada'=>'green','cancelada'=>'red','no_asistio'=>'gray'];
                    $col = $colores[$c['estado']] ?? 'gray';
                    $est = \App\Config\AppConfig::$estados[$c['estado']] ?? ['label' => $c['estado']];
                ?>
                    <a href="<?= base_url('citas/' . $c['id']) ?>"
                       class="flex justify-between items-center px-5 py-3 hover:bg-gray-50 transition-colors">
                        <div>
                            <div class="font-medium"><?= esc($c['paciente_nombre']) ?></div>
                            <div class="text-gray-500 text-sm"><?= $c['hora_inicio'] ?> · <?= $c['duracion'] ?> min</div>
                        </div>
                        <span class="px-2.5 py-1 text-xs rounded-full font-medium
                                     bg-<?= $col ?>-100 text-<?= $col ?>-700">
                            <?= $est['label'] ?>
                        </span>
                    </a>
                <?php endforeach; ?>
            </div>
        <?php endif; ?>
    </div>

    <!-- Últimas sesiones -->
    <div class="bg-white rounded-xl shadow-sm flex flex-col">
        <div class="px-5 py-4 border-b flex justify-between items-center">
            <span class="font-semibold flex items-center gap-2">
                <svg xmlns="http://www.w3.org/2000/svg" class="h-5 w-5 text-green-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2"
                          d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                </svg>
                Últimas Sesiones
            </span>
            <a href="<?= base_url('sesiones') ?>" class="text-sm text-teal-600 hover:underline">Ver todas</a>
        </div>

        <?php if (empty($ultimasSesiones)): ?>
            <div class="flex-1 flex items-center justify-center py-12 text-gray-400 text-sm">
                No hay sesiones registradas.
            </div>
        <?php else: ?>
            <div class="divide-y">
                <?php foreach ($ultimasSesiones as $s): ?>
                    <a href="<?= base_url('sesiones/' . $s['id']) ?>"
                       class="flex justify-between items-center px-5 py-3 hover:bg-gray-50 transition-colors">
                        <div>
                            <div class="font-medium"><?= esc($s['paciente_nombre']) ?></div>
                            <div class="text-gray-500 text-sm">
                                <?= date('d/m/Y', strtotime($s['fecha'])) ?> · <?= $s['duracion'] ?> min
                            </div>
                        </div>
                        <span class="text-green-600 font-semibold"><?= number_format($s['precio'], 2) ?>€</span>
                    </a>
                <?php endforeach; ?>
            </div>
        <?php endif; ?>
    </div>

</div>

<?= $this->endSection() ?>
