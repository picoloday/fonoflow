<?= $this->extend('layouts/main') ?>
<?= $this->section('content') ?>

<div class="flex flex-wrap items-center gap-2 mb-6">
    <a href="<?= base_url('pacientes') ?>" class="text-gray-500 hover:text-gray-800 transition-colors">
        <svg xmlns="http://www.w3.org/2000/svg" class="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M15 19l-7-7 7-7" />
        </svg>
    </a>
    <h2 class="text-2xl font-semibold"><?= esc($paciente['nombre']) ?></h2>
    <?php if (!$paciente['activo']): ?>
        <span class="inline-block bg-gray-200 text-gray-600 px-2 py-0.5 rounded-full text-xs">Inactivo</span>
    <?php endif; ?>
    <div class="ml-auto flex flex-wrap gap-2">
        <a href="<?= base_url('pacientes/' . $paciente['id'] . '/editar') ?>"
           class="inline-flex items-center px-3 py-1.5 border border-teal-500 text-teal-600 rounded-lg hover:bg-teal-50 text-sm transition-colors">
            Editar
        </a>
        <a href="<?= base_url('sesiones/nueva?paciente_id=' . $paciente['id']) ?>"
           class="inline-flex items-center px-3 py-1.5 bg-green-600 text-white rounded-lg hover:bg-green-700 text-sm transition-colors">
            Nueva sesión
        </a>
        <form method="post" action="<?= base_url('pacientes/' . $paciente['id'] . '/eliminar') ?>"
              onsubmit="return confirm('¿Eliminar paciente y todos sus datos?')">
            <?= csrf_field() ?>
            <button class="inline-flex items-center px-3 py-1.5 border border-red-500 text-red-500 rounded-lg hover:bg-red-50 text-sm transition-colors">
                Eliminar
            </button>
        </form>
    </div>
</div>

<div class="grid grid-cols-1 lg:grid-cols-3 gap-6">

    <!-- Sidebar -->
    <div class="space-y-4">

        <div class="bg-white shadow-sm rounded-xl p-5">
            <h4 class="font-semibold text-gray-700 mb-3">Información</h4>
            <?php if ($paciente['tutor']): ?>
                <div class="mb-2 text-sm"><span class="font-semibold">Tutor:</span> <?= esc($paciente['tutor']) ?></div>
            <?php endif; ?>
            <?php if ($paciente['telefono']): ?>
                <div class="mb-2 text-sm">
                    <span class="font-semibold">Teléfono:</span>
                    <a href="tel:<?= esc($paciente['telefono']) ?>" class="text-teal-600 hover:underline">
                        <?= esc($paciente['telefono']) ?>
                    </a>
                </div>
            <?php endif; ?>
            <?php if ($paciente['email']): ?>
                <div class="mb-2 text-sm">
                    <span class="font-semibold">Email:</span>
                    <a href="mailto:<?= esc($paciente['email']) ?>" class="text-teal-600 hover:underline">
                        <?= esc($paciente['email']) ?>
                    </a>
                </div>
            <?php endif; ?>
            <?php if ($paciente['fecha_nacimiento']): ?>
                <div class="mb-2 text-sm">
                    <span class="font-semibold">Nacimiento:</span>
                    <?= date('d/m/Y', strtotime($paciente['fecha_nacimiento'])) ?>
                </div>
            <?php endif; ?>
            <div class="text-sm">
                <span class="font-semibold">Alta:</span>
                <?= $paciente['fecha_alta'] ? date('d/m/Y', strtotime($paciente['fecha_alta'])) : '—' ?>
            </div>
        </div>

        <?php if (!empty($paciente['patologias'])): ?>
            <div class="bg-white shadow-sm rounded-xl p-5">
                <h4 class="font-semibold text-gray-700 mb-3">Patologías</h4>
                <div class="flex flex-wrap gap-1.5">
                    <?php foreach ($paciente['patologias'] as $pat): ?>
                        <span class="bg-teal-50 text-teal-700 border border-teal-200 px-2.5 py-1 rounded-full text-xs">
                            <?= esc($pat) ?>
                        </span>
                    <?php endforeach; ?>
                </div>
            </div>
        <?php endif; ?>

        <?php if (!empty($paciente['objetivos_generales'])): ?>
            <div class="bg-white shadow-sm rounded-xl p-5">
                <h4 class="font-semibold text-gray-700 mb-3">Objetivos Terapéuticos</h4>
                <ul class="space-y-1.5">
                    <?php foreach ($paciente['objetivos_generales'] as $obj): ?>
                        <li class="flex items-start gap-2 text-sm">
                            <svg xmlns="http://www.w3.org/2000/svg" class="h-4 w-4 text-teal-500 mt-0.5 flex-shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9 5l7 7-7 7" />
                            </svg>
                            <?= esc($obj) ?>
                        </li>
                    <?php endforeach; ?>
                </ul>
            </div>
        <?php endif; ?>

        <?php if ($paciente['notas']): ?>
            <div class="bg-white shadow-sm rounded-xl p-5">
                <h4 class="font-semibold text-gray-700 mb-3">Notas</h4>
                <p class="whitespace-pre-wrap text-gray-700 text-sm leading-relaxed">
                    <?= nl2br(esc($paciente['notas'])) ?>
                </p>
            </div>
        <?php endif; ?>

    </div>

    <!-- Historial de sesiones -->
    <div class="lg:col-span-2">
        <div class="bg-white shadow-sm rounded-xl p-5">
            <div class="flex justify-between items-center mb-4">
                <span class="font-semibold flex items-center gap-2">
                    <svg xmlns="http://www.w3.org/2000/svg" class="h-5 w-5 text-green-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2"
                              d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                    </svg>
                    Historial de Sesiones
                </span>
                <span class="text-gray-500 text-sm"><?= count($historial) ?> sesiones</span>
            </div>

            <?php if (empty($historial)): ?>
                <div class="text-center text-gray-400 py-12">
                    <svg xmlns="http://www.w3.org/2000/svg" class="inline h-12 w-12 text-gray-200 mb-3" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2"
                              d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586" />
                    </svg>
                    <p class="mb-4">No hay sesiones registradas.</p>
                    <a href="<?= base_url('sesiones/nueva?paciente_id=' . $paciente['id']) ?>"
                       class="inline-flex items-center bg-green-600 text-white px-4 py-2 rounded-lg hover:bg-green-700 transition-colors">
                        Registrar primera sesión
                    </a>
                </div>
            <?php else: ?>
                <div class="space-y-2">
                    <?php foreach ($historial as $s): ?>
                        <a href="<?= base_url('sesiones/' . $s['id']) ?>"
                           class="block px-4 py-3 border border-gray-200 rounded-lg hover:bg-gray-50 transition-colors">
                            <div class="flex justify-between items-start">
                                <div class="flex-1">
                                    <div class="font-semibold text-sm mb-1">
                                        <?= date('d/m/Y', strtotime($s['fecha'])) ?> · <?= $s['duracion'] ?> min
                                    </div>
                                    <?php if ($s['evolutivo']): ?>
                                        <p class="text-gray-500 text-sm mb-1">
                                            <?= esc(mb_substr($s['evolutivo'], 0, 120)) ?>…
                                        </p>
                                    <?php endif; ?>
                                    <?php if (!empty($s['objetivos'])): ?>
                                        <?php
                                            $cumplidos = count(array_filter($s['objetivos'], fn($o) => $o['cumplido']));
                                            $total     = count($s['objetivos']);
                                        ?>
                                        <span class="text-xs text-<?= $cumplidos === $total ? 'green' : 'gray' ?>-500">
                                            <?= $cumplidos ?>/<?= $total ?> objetivos
                                        </span>
                                    <?php endif; ?>
                                </div>
                                <span class="text-green-600 font-semibold ml-3 flex-shrink-0">
                                    <?= number_format($s['precio'], 2) ?>€
                                </span>
                            </div>
                        </a>
                    <?php endforeach; ?>
                </div>
            <?php endif; ?>
        </div>
    </div>

</div>

<?= $this->endSection() ?>
