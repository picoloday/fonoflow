<?= $this->extend('layouts/main') ?>
<?= $this->section('content') ?>

<?php $estado = \App\Config\AppConfig::$estados[$cita['estado']] ?? ['label' => $cita['estado'], 'color' => 'gray']; ?>

<div class="flex flex-wrap items-center gap-2 mb-6">
    <a href="<?= base_url('agenda?fecha=' . $cita['fecha']) ?>" class="text-gray-500 hover:text-gray-800 transition-colors">
        <svg xmlns="http://www.w3.org/2000/svg" class="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M15 19l-7-7 7-7" />
        </svg>
    </a>
    <h2 class="text-2xl font-semibold">Sesión</h2>
    <span class="ml-1 inline-block px-2.5 py-1 rounded-full text-sm font-medium
                 bg-<?= $estado['color'] ?>-100 text-<?= $estado['color'] ?>-700">
        <?= $estado['label'] ?>
    </span>

    <?php if ($cita['estado'] === 'programada'): ?>
        <div class="ml-auto flex flex-wrap gap-2">
            <a href="<?= base_url('citas/' . $cita['id'] . '/editar') ?>"
               class="inline-flex items-center px-3 py-1.5 border border-teal-500 text-teal-600 rounded-lg hover:bg-teal-50 text-sm transition-colors">
                Editar
            </a>
            <form method="post" action="<?= base_url('citas/' . $cita['id'] . '/cancelar') ?>"
                  onsubmit="return confirm('¿Cancelar esta sesión?')">
                <?= csrf_field() ?>
                <button class="inline-flex items-center px-3 py-1.5 border border-yellow-500 text-yellow-600 rounded-lg hover:bg-yellow-50 text-sm transition-colors">
                    Cancelar
                </button>
            </form>
            <form method="post" action="<?= base_url('citas/' . $cita['id'] . '/eliminar') ?>"
                  onsubmit="return confirm('¿Eliminar esta sesión definitivamente?')">
                <?= csrf_field() ?>
                <button class="inline-flex items-center px-3 py-1.5 border border-red-500 text-red-500 rounded-lg hover:bg-red-50 text-sm transition-colors">
                    Eliminar
                </button>
            </form>
        </div>
    <?php endif; ?>
</div>

<div class="grid grid-cols-1 lg:grid-cols-3 gap-6">

    <!-- Sidebar info -->
    <div class="space-y-4">

        <div class="bg-white shadow-sm rounded-xl p-5">
            <h4 class="font-semibold text-gray-700 mb-3">Datos de la Sesión</h4>
            <div class="grid grid-cols-2 gap-3 text-sm text-gray-600">
                <div>
                    <div class="font-semibold text-gray-700">Fecha</div>
                    <div><?= fecha_dia($cita['fecha']) ?></div>
                </div>
                <div>
                    <div class="font-semibold text-gray-700">Hora</div>
                    <div><?= $cita['hora_inicio'] ?></div>
                </div>
                <div>
                    <div class="font-semibold text-gray-700">Duración</div>
                    <div><?= $cita['duracion'] ?> min</div>
                </div>
                <div>
                    <div class="font-semibold text-gray-700">Precio</div>
                    <div class="text-green-600 font-bold text-base"><?= number_format($cita['precio'], 2) ?>€</div>
                </div>
            </div>
            <?php if ($cita['notas']): ?>
                <div class="mt-4 pt-3 border-t">
                    <div class="font-semibold text-sm text-gray-700 mb-1">Notas</div>
                    <div class="text-gray-600 text-sm"><?= nl2br(esc($cita['notas'])) ?></div>
                </div>
            <?php endif; ?>
            <?php if ($cita['estado'] === 'no_asistio' && $cita['motivo_ausencia']): ?>
                <div class="mt-4 pt-3 border-t">
                    <div class="font-semibold text-sm text-gray-700 mb-1">Motivo ausencia</div>
                    <div class="text-gray-600 text-sm"><?= esc($cita['motivo_ausencia']) ?></div>
                    <?php if ($cita['reprogramar']): ?>
                        <span class="inline-block mt-1 bg-teal-100 text-teal-700 px-2 py-0.5 rounded-full text-xs font-medium">
                            Reprogramar
                        </span>
                    <?php endif; ?>
                </div>
            <?php endif; ?>
        </div>

        <?php if ($paciente): ?>
            <div class="bg-white shadow-sm rounded-xl p-5">
                <h4 class="font-semibold text-gray-700 mb-3">Paciente</h4>
                <div class="flex items-center gap-3">
                    <div class="rounded-full bg-teal-600 text-white flex items-center justify-center font-bold flex-shrink-0"
                         style="width:44px;height:44px">
                        <?= mb_strtoupper(mb_substr($paciente['nombre'], 0, 1)) ?>
                    </div>
                    <div>
                        <div class="font-semibold"><?= esc($paciente['nombre']) ?></div>
                        <?php if ($paciente['telefono']): ?>
                            <div class="text-gray-500 text-sm"><?= esc($paciente['telefono']) ?></div>
                        <?php endif; ?>
                    </div>
                </div>
                <div class="mt-3">
                    <a href="<?= base_url('pacientes/' . $paciente['id']) ?>"
                       class="inline-block px-3 py-1.5 border border-teal-500 text-teal-600 rounded-lg hover:bg-teal-50 text-sm transition-colors">
                        Ver perfil
                    </a>
                </div>
            </div>
        <?php endif; ?>

        <?php if (!empty($cita['objetivos'])): ?>
            <div class="bg-white shadow-sm rounded-xl p-5">
                <h4 class="font-semibold text-gray-700 mb-3">Objetivos</h4>
                <ul class="space-y-1.5">
                    <?php foreach ($cita['objetivos'] as $obj): ?>
                        <li class="flex items-start gap-2 text-sm text-gray-700">
                            <svg xmlns="http://www.w3.org/2000/svg" class="h-4 w-4 text-teal-500 mt-0.5 flex-shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9 5l7 7-7 7" />
                            </svg>
                            <?= esc($obj) ?>
                        </li>
                    <?php endforeach; ?>
                </ul>
            </div>
        <?php endif; ?>

        <?php if (!empty($cita['actividades'])): ?>
            <div class="bg-white shadow-sm rounded-xl p-5">
                <h4 class="font-semibold text-gray-700 mb-3">Actividades</h4>
                <ul class="space-y-1.5">
                    <?php foreach ($cita['actividades'] as $a): ?>
                        <li class="flex items-start gap-2 text-sm text-gray-700">
                            <svg xmlns="http://www.w3.org/2000/svg" class="h-4 w-4 text-teal-500 mt-0.5 flex-shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2"
                                      d="M14.752 11.168l-3.197-2.132A1 1 0 0010 9.868v4.264a1 1 0 001.555.832l3.197-2.132a1 1 0 000-1.664z" />
                            </svg>
                            <?= esc($a) ?>
                        </li>
                    <?php endforeach; ?>
                </ul>
            </div>
        <?php endif; ?>

        <?php if (!empty($cita['materiales'])): ?>
            <div class="bg-white shadow-sm rounded-xl p-5">
                <h4 class="font-semibold text-gray-700 mb-3">Materiales</h4>
                <div class="flex flex-wrap gap-2">
                    <?php foreach ($cita['materiales'] as $m): ?>
                        <span class="inline-block bg-gray-100 text-gray-700 px-2.5 py-1 rounded-full text-sm">
                            <?= esc($m) ?>
                        </span>
                    <?php endforeach; ?>
                </div>
            </div>
        <?php endif; ?>

    </div>

    <!-- Acciones (solo si está programada) -->
    <?php if ($cita['estado'] === 'programada'): ?>
        <div class="lg:col-span-2 space-y-4">

            <!-- Marcar asistencia -->
            <div class="bg-green-50 border border-green-200 rounded-xl overflow-hidden">
                <div class="bg-green-600 text-white px-5 py-3 font-semibold flex items-center gap-2">
                    <svg xmlns="http://www.w3.org/2000/svg" class="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M5 13l4 4L19 7" />
                    </svg>
                    Marcar Asistencia
                </div>
                <div class="p-5">
                    <form method="post" action="<?= base_url('citas/' . $cita['id'] . '/asistencia') ?>">
                        <?= csrf_field() ?>
                        <input type="hidden" name="asistio" value="1">
                        <p class="text-gray-600 text-sm mb-4">
                            El paciente asistió a la sesión. Se creará automáticamente el registro.
                        </p>
                        <button type="submit"
                                class="inline-flex items-center gap-1.5 px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 transition-colors">
                            <svg xmlns="http://www.w3.org/2000/svg" class="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M5 13l4 4L19 7" />
                            </svg>
                            Paciente asistió
                        </button>
                    </form>
                </div>
            </div>

            <!-- Registrar ausencia -->
            <div class="bg-red-50 border border-red-200 rounded-xl overflow-hidden">
                <div class="bg-red-600 text-white px-5 py-3 font-semibold flex items-center gap-2">
                    <svg xmlns="http://www.w3.org/2000/svg" class="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M6 18L18 6M6 6l12 12" />
                    </svg>
                    Registrar Ausencia
                </div>
                <div class="p-5">
                    <form method="post" action="<?= base_url('citas/' . $cita['id'] . '/asistencia') ?>">
                        <?= csrf_field() ?>
                        <input type="hidden" name="asistio" value="0">
                        <div class="mb-4">
                            <label class="block text-sm font-medium text-gray-700 mb-1">
                                Motivo de la ausencia
                            </label>
                            <select name="motivo_ausencia"
                                    class="block w-full border border-gray-300 rounded-lg py-2 px-3 focus:outline-none focus:ring-2 focus:ring-red-400">
                                <option value="">Sin especificar</option>
                                <?php foreach ($motivosAusencia as $m): ?>
                                    <option value="<?= esc($m) ?>"><?= esc($m) ?></option>
                                <?php endforeach; ?>
                            </select>
                        </div>
                        <div class="flex items-center mb-4">
                            <input id="chk-reprogramar" class="h-4 w-4 text-red-600 rounded border-gray-300"
                                   type="checkbox" name="reprogramar" value="1">
                            <label for="chk-reprogramar" class="ml-2 text-sm text-gray-700">
                                Reprogramar sesión
                            </label>
                        </div>
                        <button type="submit"
                                class="inline-flex items-center gap-1.5 px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700 transition-colors">
                            <svg xmlns="http://www.w3.org/2000/svg" class="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M6 18L18 6M6 6l12 12" />
                            </svg>
                            Paciente no asistió
                        </button>
                    </form>
                </div>
            </div>

        </div>
    <?php endif; ?>

</div>

<?= $this->endSection() ?>
