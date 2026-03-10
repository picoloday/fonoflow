<?= $this->extend('layouts/main') ?>
<?= $this->section('content') ?>

<div class="flex flex-wrap justify-between items-center mb-4 gap-3">
    <h2 class="text-2xl font-semibold flex items-center gap-2">
        <svg xmlns="http://www.w3.org/2000/svg" class="h-7 w-7 text-teal-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2"
                  d="M17 20h5V4H2v16h5m5-9a3 3 0 100-6 3 3 0 000 6zm0 2c-3.314 0-6 1.343-6 3v1h12v-1c0-1.657-2.686-3-6-3z" />
        </svg>
        Pacientes
    </h2>
    <a href="<?= base_url('pacientes/nuevo') ?>"
       class="inline-flex items-center gap-1.5 bg-teal-600 text-white px-4 py-2 rounded-lg hover:bg-teal-700 text-sm font-medium transition-colors">
        <svg xmlns="http://www.w3.org/2000/svg" class="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 4v16m8-8H4" />
        </svg>
        Nuevo Paciente
    </a>
</div>

<!-- Barra de búsqueda y filtros -->
<form method="get" class="grid grid-cols-1 md:grid-cols-5 gap-3 mb-6">
    <div class="md:col-span-3">
        <div class="relative">
            <svg xmlns="http://www.w3.org/2000/svg" class="absolute top-2.5 left-3 h-5 w-5 text-gray-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
            </svg>
            <input type="text" name="q"
                   class="pl-10 pr-4 py-2 w-full border border-gray-300 rounded-lg shadow-sm focus:outline-none focus:ring-2 focus:ring-teal-500"
                   placeholder="Buscar por nombre o patología..."
                   value="<?= esc($busqueda) ?>">
        </div>
    </div>
    <div>
        <select name="activo"
                class="block w-full border border-gray-300 rounded-lg py-2 px-3 shadow-sm focus:outline-none focus:ring-2 focus:ring-teal-500"
                onchange="this.form.submit()">
            <option value="1" <?= $soloActivos ? 'selected' : '' ?>>Solo activos</option>
            <option value="0" <?= !$soloActivos ? 'selected' : '' ?>>Todos</option>
        </select>
    </div>
    <div>
        <button type="submit"
                class="w-full inline-flex justify-center items-center px-4 py-2 border border-gray-300 rounded-lg hover:bg-gray-100 transition-colors">
            Filtrar
        </button>
    </div>
</form>

<?php if (empty($pacientes)): ?>
    <div class="text-center text-gray-500 py-16">
        <svg xmlns="http://www.w3.org/2000/svg" class="inline h-12 w-12 text-gray-300 mb-3" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2"
                  d="M17 20h5V4H2v16h5m5-9a3 3 0 100-6 3 3 0 000 6z" />
        </svg>
        <p class="mt-2">No se encontraron pacientes.</p>
    </div>
<?php else: ?>
    <div class="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-3 gap-4">
        <?php foreach ($pacientes as $p): ?>
            <div class="bg-white shadow-sm rounded-xl flex flex-col">
                <div class="p-4 flex items-center gap-3">
                    <div class="h-12 w-12 rounded-full bg-teal-600 text-white flex items-center justify-center text-xl font-bold flex-shrink-0">
                        <?= mb_strtoupper(mb_substr($p['nombre'], 0, 1)) ?>
                    </div>
                    <div>
                        <div class="font-semibold"><?= esc($p['nombre']) ?></div>
                        <?php if (!$p['activo']): ?>
                            <span class="inline-block bg-gray-200 text-gray-600 px-2 py-0.5 rounded-full text-xs">Inactivo</span>
                        <?php endif; ?>
                    </div>
                </div>

                <?php if (!empty($p['patologias'])): ?>
                    <div class="px-4 pb-2 flex flex-wrap gap-1">
                        <?php foreach ($p['patologias'] as $pat): ?>
                            <span class="bg-teal-50 text-teal-700 border border-teal-200 px-2 py-0.5 rounded-full text-xs">
                                <?= esc($pat) ?>
                            </span>
                        <?php endforeach; ?>
                    </div>
                <?php endif; ?>

                <div class="px-4 py-2 flex justify-between text-gray-500 text-sm border-t border-gray-50">
                    <span><?= $p['total_sesiones'] ?> sesiones</span>
                    <?php if ($p['ultima_sesion']): ?>
                        <span>Última: <?= date('d/m/Y', strtotime($p['ultima_sesion'])) ?></span>
                    <?php endif; ?>
                </div>
                <div class="mt-auto p-4 pt-2 flex gap-2">
                    <a href="<?= base_url('pacientes/' . $p['id']) ?>"
                       class="flex-1 inline-flex justify-center items-center px-3 py-2 border border-teal-500 text-teal-600 rounded-lg hover:bg-teal-50 text-sm transition-colors">
                        Ver
                    </a>
                    <a href="<?= base_url('sesiones/nueva?paciente_id=' . $p['id']) ?>"
                       class="flex-1 inline-flex justify-center items-center px-3 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 text-sm transition-colors">
                        Sesión
                    </a>
                </div>
            </div>
        <?php endforeach; ?>
    </div>
<?php endif; ?>

<?= $this->endSection() ?>
