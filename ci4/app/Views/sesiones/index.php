<?= $this->extend('layouts/main') ?>
<?= $this->section('content') ?>

<div class="flex justify-between items-center mb-4">
    <h2 class="text-2xl font-semibold flex items-center">
        <svg xmlns="http://www.w3.org/2000/svg" class="h-6 w-6 mr-2 text-green-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 8c-3.866 0-7 1.79-7 4v2h14v-2c0-2.21-3.134-4-7-4z" />
        </svg>Sesiones
    </h2>
    <a href="<?= base_url('sesiones/nueva') ?>" class="inline-flex items-center bg-green-600 text-white px-4 py-2 rounded hover:bg-green-700">
        <svg xmlns="http://www.w3.org/2000/svg" class="h-5 w-5 mr-1" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 4v16m8-8H4" />
        </svg> Nueva Sesión
    </a>
</div>

<!-- Resumen global -->
<div class="grid grid-cols-1 md:grid-cols-2 gap-4 mb-6">
    <div class="bg-white shadow rounded p-4 text-center">
        <div class="text-3xl font-bold text-green-600"><?= $totalSesiones ?></div>
        <div class="text-gray-500 text-sm">Total sesiones</div>
    </div>
    <div class="bg-white shadow rounded p-4 text-center">
        <div class="text-3xl font-bold text-green-600"><?= number_format($totalIngresos, 2) ?>€</div>
        <div class="text-gray-500 text-sm">Total ingresos</div>
    </div>
</div>

<?php if (empty($porMes)): ?>
    <div class="text-center text-gray-500 py-12">
        <svg xmlns="http://www.w3.org/2000/svg" class="inline h-12 w-12" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9 17v-2a4 4 0 014-4h1a4 4 0 014 4v2" />
        </svg>
        <p class="mt-2">No hay sesiones registradas todavía.</p>
        <a href="<?= base_url('sesiones/nueva') ?>" class="mt-4 inline-flex items-center bg-green-600 text-white px-4 py-2 rounded hover:bg-green-700">Registrar primera sesión</a>
    </div>
<?php else: ?>
    <?php foreach ($porMes as $mes => $grupo): ?>
        <?php
            $mesesNombres = ['01'=>'Enero','02'=>'Febrero','03'=>'Marzo','04'=>'Abril',
                             '05'=>'Mayo','06'=>'Junio','07'=>'Julio','08'=>'Agosto',
                             '09'=>'Septiembre','10'=>'Octubre','11'=>'Noviembre','12'=>'Diciembre'];
            [$anio, $numMes] = explode('-', $mes);
            $nombreMes = ($mesesNombres[$numMes] ?? $numMes) . ' ' . $anio;
        ?>
        <div class="mb-6">
            <div class="flex justify-between items-center mb-2">
                <h5 class="text-lg font-medium mb-0"><?= $nombreMes ?></h5>
                <span class="text-green-600 font-semibold"><?= number_format($grupo['ingresos'], 2) ?>€</span>
            </div>
            <div class="bg-white shadow rounded">
                <?php foreach ($grupo['sesiones'] as $s): ?>
                    <a href="<?= base_url('sesiones/' . $s['id']) ?>" class="block px-4 py-3 border-b last:border-none hover:bg-gray-50">
                        <div class="flex justify-between items-start">
                            <div>
                                <div class="font-semibold"><?= esc($s['paciente_nombre']) ?></div>
                                <small class="text-gray-500">
                                    <?= fecha_dia($s['fecha']) ?> · <?= $s['duracion'] ?> min
                                    <?php if (!empty($s['objetivos'])): ?>
                                        <?php $cumplidos = count(array_filter($s['objetivos'], fn($o) => $o['cumplido'])); ?>
                                        · <span class="text-<?php echo $cumplidos === count($s['objetivos']) ? 'green' : 'yellow'; ?>-500">
                                            <?= $cumplidos ?>/<?= count($s['objetivos']) ?> obj
                                        </span>
                                    <?php endif; ?>
                                </small>
                            </div>
                            <span class="text-green-600 font-semibold ml-3"><?= number_format($s['precio'], 2) ?>€</span>
                        </div>
                    </a>
                <?php endforeach; ?>
            </div>
        </div>
    <?php endforeach; ?>
<?php endif; ?>

<?= $this->endSection() ?>
