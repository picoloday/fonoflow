<?= $this->extend('layouts/main') ?>
<?= $this->section('content') ?>

<div class="flex items-center gap-2 mb-6">
    <a href="<?= base_url('sesiones') ?>" class="text-gray-500 hover:text-gray-800 transition-colors">
        <svg xmlns="http://www.w3.org/2000/svg" class="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M15 19l-7-7 7-7" />
        </svg>
    </a>
    <h2 class="text-2xl font-semibold"><?= esc($titulo) ?></h2>
</div>

<?php if (!empty($errores)): ?>
    <div class="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded-lg mb-4">
        <ul class="list-disc pl-5 space-y-1">
            <?php foreach ($errores as $e): ?><li><?= esc($e) ?></li><?php endforeach; ?>
        </ul>
    </div>
<?php endif; ?>

<form method="post" action="<?= base_url('sesiones/' . ($accion === 'editar' ? $sesion['id'] . '/editar' : 'nueva')) ?>">
    <?= csrf_field() ?>

    <div class="grid grid-cols-1 lg:grid-cols-3 gap-6">

        <!-- Columna izquierda: datos de la sesión -->
        <div class="lg:col-span-2">
            <div class="bg-white shadow-sm rounded-xl overflow-hidden">
                <div class="px-5 py-3 border-b bg-gray-50 font-semibold text-gray-700">
                    Datos de la Sesión
                </div>
                <div class="p-5 grid grid-cols-1 md:grid-cols-2 gap-4">

                    <!-- Paciente -->
                    <div class="md:col-span-2">
                        <label class="block text-sm font-medium text-gray-700 mb-1">
                            Paciente <span class="text-red-500">*</span>
                        </label>
                        <select name="paciente_id" required
                                class="block w-full border border-gray-300 rounded-lg py-2 px-3 shadow-sm focus:outline-none focus:ring-2 focus:ring-teal-500">
                            <option value="">Seleccionar paciente...</option>
                            <?php
                                $selectedPaciente = isset($sesion['paciente_id']) ? (int)$sesion['paciente_id']
                                    : (isset($paciente['id']) ? (int)$paciente['id'] : 0);
                            ?>
                            <?php foreach ($pacientes as $p): ?>
                                <option value="<?= $p['id'] ?>" <?= $selectedPaciente == $p['id'] ? 'selected' : '' ?>>
                                    <?= esc($p['nombre']) ?>
                                </option>
                            <?php endforeach; ?>
                        </select>
                    </div>

                    <!-- Fecha y hora -->
                    <?php
                        $horaRaw   = $sesion['hora_inicio'] ?? '';
                        $hora5     = $horaRaw ? substr($horaRaw, 0, 5) : '';
                        $fechaBase = $sesion['fecha'] ?? $fecha ?? date('Y-m-d');
                        $dtValue   = $hora5 ? $fechaBase . 'T' . $hora5 : $fechaBase . 'T15:00';
                    ?>
                    <div class="md:col-span-2">
                        <label class="block text-sm font-medium text-gray-700 mb-1">
                            Fecha y hora <span class="text-red-500">*</span>
                        </label>
                        <input type="datetime-local" name="fecha_hora" required
                               class="block w-full border border-gray-300 rounded-lg py-2 px-3 shadow-sm focus:outline-none focus:ring-2 focus:ring-teal-500"
                               value="<?= esc($dtValue) ?>">
                        <p class="mt-1 text-xs text-gray-400">Rango habitual: 15:00 – 21:00</p>
                    </div>

                    <!-- Duración -->
                    <div>
                        <label class="block text-sm font-medium text-gray-700 mb-1">
                            Duración <span class="text-red-500">*</span>
                        </label>
                        <select name="duracion" id="select-duracion" required
                                class="block w-full border border-gray-300 rounded-lg py-2 px-3 shadow-sm focus:outline-none focus:ring-2 focus:ring-teal-500">
                            <?php foreach ($duraciones as $d): ?>
                                <option value="<?= $d ?>" <?= ($sesion['duracion'] ?? 30) == $d ? 'selected' : '' ?>>
                                    <?= $d ?> minutos
                                </option>
                            <?php endforeach; ?>
                        </select>
                    </div>

                    <!-- Precio -->
                    <div class="md:col-span-2 sm:max-w-xs">
                        <label class="block text-sm font-medium text-gray-700 mb-1">Precio (€)</label>
                        <div class="flex">
                            <input type="number" name="precio" step="0.01" min="0"
                                   class="flex-1 border border-gray-300 rounded-l-lg py-2 px-3 shadow-sm focus:outline-none focus:ring-2 focus:ring-teal-500"
                                   value="<?= esc($sesion['precio'] ?? '12.00') ?>">
                            <span class="inline-flex items-center px-3 border border-l-0 border-gray-300 bg-gray-50 text-gray-500 rounded-r-lg">
                                €
                            </span>
                        </div>
                    </div>

                    <!-- Evolutivo -->
                    <div class="md:col-span-2">
                        <label class="block text-sm font-medium text-gray-700 mb-1">
                            Evolutivo (evolución del paciente)
                        </label>
                        <textarea name="evolutivo" rows="4"
                                  class="block w-full border border-gray-300 rounded-lg py-2 px-3 shadow-sm focus:outline-none focus:ring-2 focus:ring-teal-500"
                                  placeholder="Describe la evolución observada durante la sesión..."><?= esc($sesion['evolutivo'] ?? '') ?></textarea>
                    </div>

                    <!-- Observaciones -->
                    <div class="md:col-span-2">
                        <label class="block text-sm font-medium text-gray-700 mb-1">
                            Observaciones clínicas
                        </label>
                        <textarea name="observaciones" rows="3"
                                  class="block w-full border border-gray-300 rounded-lg py-2 px-3 shadow-sm focus:outline-none focus:ring-2 focus:ring-teal-500"
                                  placeholder="Observaciones adicionales..."><?= esc($sesion['observaciones'] ?? '') ?></textarea>
                    </div>

                </div>
            </div>
        </div>

        <!-- Columna derecha: info paciente + objetivos + actividades + materiales -->
        <div class="space-y-4">

            <!-- Panel info paciente (AJAX) -->
            <div id="panel-paciente" class="hidden bg-white shadow-sm rounded-xl overflow-hidden border-l-4 border-teal-500">
                <div class="px-4 py-3 bg-teal-50 border-b border-teal-100 flex items-center gap-2">
                    <svg xmlns="http://www.w3.org/2000/svg" class="h-4 w-4 text-teal-600 flex-shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
                    </svg>
                    <span class="text-sm font-semibold text-teal-700">Ficha del paciente</span>
                </div>
                <div class="p-4 space-y-4">

                    <!-- Patologías -->
                    <div id="pp-patologias-wrap">
                        <p class="text-xs font-semibold text-gray-400 uppercase tracking-wide mb-1.5">Patología</p>
                        <div id="pp-patologias" class="flex flex-wrap gap-1"></div>
                    </div>

                    <!-- Objetivos terapéuticos generales -->
                    <div id="pp-objetivos-wrap">
                        <p class="text-xs font-semibold text-gray-400 uppercase tracking-wide mb-1.5">Objetivos terapéuticos</p>
                        <ul id="pp-objetivos" class="space-y-1"></ul>
                    </div>

                    <!-- Última sesión -->
                    <div id="pp-ultima-wrap" class="hidden">
                        <p class="text-xs font-semibold text-gray-400 uppercase tracking-wide mb-1.5">Última sesión</p>
                        <p id="pp-ultima-fecha" class="text-xs text-gray-500 mb-2"></p>

                        <p class="text-xs font-medium text-gray-600 mb-1">Objetivos:</p>
                        <ul id="pp-ultima-objetivos" class="space-y-1 mb-3"></ul>

                        <div id="pp-ultima-act-wrap" class="hidden">
                            <p class="text-xs font-medium text-gray-600 mb-1">Actividades:</p>
                            <ul id="pp-ultima-actividades" class="space-y-1"></ul>
                        </div>
                    </div>

                </div>
            </div>

            <!-- Objetivos -->
            <div class="bg-white shadow-sm rounded-xl p-4">
                <h4 class="font-semibold text-gray-700 mb-3">Objetivos</h4>
                <div id="objetivos-lista" class="space-y-2">
                    <?php $objetivos = $sesion['objetivos'] ?? ['']; ?>
                    <?php foreach ($objetivos as $obj):
                        $texto = is_array($obj) ? $obj['objetivo'] : $obj;
                    ?>
                        <div class="flex objetivo-row">
                            <input type="text" name="objetivos[]"
                                   class="flex-1 border border-gray-300 rounded-l-lg py-2 px-3 text-sm shadow-sm"
                                   placeholder="Objetivo..." value="<?= esc($texto) ?>">
                            <button type="button"
                                    class="px-3 bg-red-500 text-white rounded-r-lg hover:bg-red-600 btn-elim-obj">
                                &times;
                            </button>
                        </div>
                    <?php endforeach; ?>
                </div>
                <button type="button" id="btn-add-obj"
                        class="mt-2 inline-flex items-center gap-1 px-3 py-1.5 bg-teal-500 text-white rounded-lg text-sm hover:bg-teal-600">
                    <svg xmlns="http://www.w3.org/2000/svg" class="h-3.5 w-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 4v16m8-8H4" />
                    </svg>
                    Objetivo
                </button>
            </div>

            <!-- Actividades -->
            <div class="bg-white shadow-sm rounded-xl p-4">
                <h4 class="font-semibold text-gray-700 mb-3">Actividades realizadas</h4>
                <div id="actividades-lista" class="space-y-2">
                    <?php $actividades = $sesion['actividades'] ?? []; ?>
                    <?php foreach ($actividades as $a): ?>
                        <div class="flex actividad-row">
                            <input type="text" name="actividades[]"
                                   class="flex-1 border border-gray-300 rounded-l-lg py-2 px-3 text-sm shadow-sm"
                                   placeholder="Actividad..." value="<?= esc($a) ?>">
                            <button type="button"
                                    class="px-3 bg-red-500 text-white rounded-r-lg hover:bg-red-600 btn-elim-act">
                                &times;
                            </button>
                        </div>
                    <?php endforeach; ?>
                </div>
                <button type="button" id="btn-add-act"
                        class="mt-2 inline-flex items-center gap-1 px-3 py-1.5 bg-teal-500 text-white rounded-lg text-sm hover:bg-teal-600">
                    <svg xmlns="http://www.w3.org/2000/svg" class="h-3.5 w-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 4v16m8-8H4" />
                    </svg>
                    Actividad
                </button>
            </div>

            <!-- Materiales -->
            <div class="bg-white shadow-sm rounded-xl p-4">
                <h4 class="font-semibold text-gray-700 mb-3">Materiales utilizados</h4>
                <div id="materiales-lista" class="space-y-2">
                    <?php $mats = $sesion['materiales'] ?? []; ?>
                    <?php foreach ($mats as $m): ?>
                        <div class="flex material-row">
                            <input type="text" name="materiales[]"
                                   class="flex-1 border border-gray-300 rounded-l-lg py-2 px-3 text-sm shadow-sm"
                                   placeholder="Material..." value="<?= esc($m) ?>" list="materiales-sugeridos">
                            <button type="button"
                                    class="px-3 bg-red-500 text-white rounded-r-lg hover:bg-red-600 btn-elim-mat">
                                &times;
                            </button>
                        </div>
                    <?php endforeach; ?>
                </div>
                <datalist id="materiales-sugeridos">
                    <?php foreach ($materiales as $m): ?>
                        <option value="<?= esc($m) ?>">
                    <?php endforeach; ?>
                </datalist>
                <button type="button" id="btn-add-mat"
                        class="mt-2 inline-flex items-center gap-1 px-3 py-1.5 bg-teal-500 text-white rounded-lg text-sm hover:bg-teal-600">
                    <svg xmlns="http://www.w3.org/2000/svg" class="h-3.5 w-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 4v16m8-8H4" />
                    </svg>
                    Material
                </button>
            </div>

        </div>
    </div>

    <!-- Botones -->
    <div class="mt-6 flex flex-wrap gap-2">
        <button type="submit"
                class="inline-flex items-center gap-1.5 px-5 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 font-medium transition-colors">
            <svg xmlns="http://www.w3.org/2000/svg" class="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M5 13l4 4L19 7" />
            </svg>
            Guardar
        </button>
        <a href="<?= base_url($accion === 'editar' ? 'sesiones/' . $sesion['id'] : 'sesiones') ?>"
           class="inline-flex items-center px-5 py-2 border border-gray-300 rounded-lg hover:bg-gray-100 transition-colors">
            Cancelar
        </a>
    </div>
</form>

<?= $this->endSection() ?>
<?= $this->section('scripts') ?>
<script>
const BASE_URL = '<?= base_url() ?>';

async function cargarInfoPaciente(id) {
    const panel = document.getElementById('panel-paciente');
    if (!id) { panel.classList.add('hidden'); return; }

    try {
        const res  = await fetch(`${BASE_URL}/sesiones/paciente/${id}`);
        const data = await res.json();
        if (data.error) { panel.classList.add('hidden'); return; }

        // Patologías
        const pats = document.getElementById('pp-patologias');
        pats.innerHTML = data.patologias.length
            ? data.patologias.map(p =>
                `<span class="px-2 py-0.5 rounded-full text-xs bg-teal-100 text-teal-700 font-medium">${escHtml(p)}</span>`
              ).join('')
            : '<span class="text-xs text-gray-400">Sin patología registrada</span>';

        // Objetivos generales
        const objs = document.getElementById('pp-objetivos');
        objs.innerHTML = data.objetivos_generales.length
            ? data.objetivos_generales.map(o =>
                `<li class="flex items-start gap-1.5 text-xs text-gray-600">
                    <svg class="h-3.5 w-3.5 text-teal-400 flex-shrink-0 mt-0.5" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9 5l7 7-7 7"/></svg>
                    ${escHtml(o)}
                </li>`
              ).join('')
            : '<li class="text-xs text-gray-400">Sin objetivos registrados</li>';

        // Última sesión
        const ultimaWrap = document.getElementById('pp-ultima-wrap');
        if (data.ultima_sesion) {
            const u = data.ultima_sesion;
            document.getElementById('pp-ultima-fecha').textContent =
                u.fecha + (u.hora ? ' · ' + u.hora : '');

            const ulObjs = document.getElementById('pp-ultima-objetivos');
            ulObjs.innerHTML = u.objetivos.length
                ? u.objetivos.map(o => {
                    const cumplido = o.cumplido == 1;
                    return `<li class="flex items-start gap-1.5 text-xs">
                        <svg class="h-3.5 w-3.5 flex-shrink-0 mt-0.5 ${cumplido ? 'text-green-500' : 'text-gray-300'}" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="${cumplido ? 'M5 13l4 4L19 7' : 'M6 18L18 6M6 6l12 12'}"/>
                        </svg>
                        <span class="${cumplido ? 'text-gray-700' : 'text-gray-400 line-through'}">${escHtml(o.objetivo)}</span>
                    </li>`;
                  }).join('')
                : '<li class="text-xs text-gray-400">Sin objetivos</li>';

            const actWrap = document.getElementById('pp-ultima-act-wrap');
            if (u.actividades.length) {
                document.getElementById('pp-ultima-actividades').innerHTML =
                    u.actividades.map(a =>
                        `<li class="flex items-start gap-1.5 text-xs text-gray-600">
                            <svg class="h-3.5 w-3.5 text-gray-400 flex-shrink-0 mt-0.5" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M14.752 11.168l-3.197-2.132A1 1 0 0010 9.87v4.263a1 1 0 001.555.832l3.197-2.132a1 1 0 000-1.664z"/><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M21 12a9 9 0 11-18 0 9 9 0 0118 0z"/></svg>
                            ${escHtml(a)}
                        </li>`
                    ).join('');
                actWrap.classList.remove('hidden');
            } else {
                actWrap.classList.add('hidden');
            }

            ultimaWrap.classList.remove('hidden');
        } else {
            ultimaWrap.classList.add('hidden');
        }

        panel.classList.remove('hidden');
    } catch(e) { panel.classList.add('hidden'); }
}

function escHtml(str) {
    return String(str).replace(/&/g,'&amp;').replace(/</g,'&lt;').replace(/>/g,'&gt;').replace(/"/g,'&quot;');
}

// Disparar al cambiar el select de paciente
document.querySelector('select[name="paciente_id"]').addEventListener('change', e => {
    cargarInfoPaciente(e.target.value);
});
// Si ya hay paciente seleccionado (editar o error de validación)
const pacienteInicial = document.querySelector('select[name="paciente_id"]').value;
if (pacienteInicial) cargarInfoPaciente(pacienteInicial);

function addRow(listId, name, placeholder, elimClass, rowClass, extra = '') {
    const row = document.createElement('div');
    row.className = `flex ${rowClass}`;
    row.innerHTML = `<input type="text" name="${name}"
                            class="flex-1 border border-gray-300 rounded-l-lg py-2 px-3 text-sm shadow-sm"
                            placeholder="${placeholder}"${extra}>
                     <button type="button"
                             class="px-3 bg-red-500 text-white rounded-r-lg hover:bg-red-600 ${elimClass}">
                         &times;
                     </button>`;
    document.getElementById(listId).appendChild(row);
}

document.getElementById('btn-add-obj').addEventListener('click', () =>
    addRow('objetivos-lista', 'objetivos[]', 'Objetivo...', 'btn-elim-obj', 'objetivo-row'));
document.getElementById('objetivos-lista').addEventListener('click', e => {
    if (e.target.closest('.btn-elim-obj')) e.target.closest('.objetivo-row').remove();
});

document.getElementById('btn-add-act').addEventListener('click', () =>
    addRow('actividades-lista', 'actividades[]', 'Actividad...', 'btn-elim-act', 'actividad-row'));
document.getElementById('actividades-lista').addEventListener('click', e => {
    if (e.target.closest('.btn-elim-act')) e.target.closest('.actividad-row').remove();
});

document.getElementById('btn-add-mat').addEventListener('click', () =>
    addRow('materiales-lista', 'materiales[]', 'Material...', 'btn-elim-mat', 'material-row', ' list="materiales-sugeridos"'));
document.getElementById('materiales-lista').addEventListener('click', e => {
    if (e.target.closest('.btn-elim-mat')) e.target.closest('.material-row').remove();
});
</script>
<?= $this->endSection() ?>
