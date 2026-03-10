<?= $this->extend('layouts/main') ?>
<?= $this->section('content') ?>

<div class="flex items-center gap-2 mb-6">
    <a href="<?= base_url('pacientes') ?>" class="text-gray-500 hover:text-gray-800 transition-colors">
        <svg xmlns="http://www.w3.org/2000/svg" class="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M15 19l-7-7 7-7" />
        </svg>
    </a>
    <h2 class="text-2xl font-semibold"><?= esc($titulo) ?></h2>
</div>

<?php if (!empty($errores)): ?>
    <div class="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded-lg mb-4">
        <ul class="list-disc pl-5 space-y-1">
            <?php foreach ($errores as $e): ?>
                <li><?= esc($e) ?></li>
            <?php endforeach; ?>
        </ul>
    </div>
<?php endif; ?>

<form method="post" action="<?= base_url('pacientes/' . ($accion === 'editar' ? $paciente['id'] . '/editar' : 'nuevo')) ?>">
    <?= csrf_field() ?>

    <div class="grid grid-cols-1 lg:grid-cols-3 gap-6">

        <!-- Datos personales (2/3) -->
        <div class="lg:col-span-2 bg-white shadow-sm rounded-xl p-6">
            <h3 class="text-lg font-semibold text-gray-800 mb-5">Datos Personales</h3>

            <div class="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                    <label class="block text-sm font-medium text-gray-700 mb-1">
                        Nombre completo <span class="text-red-500">*</span>
                    </label>
                    <input type="text" name="nombre" required
                           class="block w-full border border-gray-300 rounded-lg py-2 px-3 shadow-sm focus:outline-none focus:ring-2 focus:ring-teal-500"
                           value="<?= esc($paciente['nombre'] ?? '') ?>">
                </div>
                <div>
                    <label class="block text-sm font-medium text-gray-700 mb-1">Tutor / Responsable</label>
                    <input type="text" name="tutor"
                           class="block w-full border border-gray-300 rounded-lg py-2 px-3 shadow-sm focus:outline-none focus:ring-2 focus:ring-teal-500"
                           value="<?= esc($paciente['tutor'] ?? '') ?>">
                </div>
                <div>
                    <label class="block text-sm font-medium text-gray-700 mb-1">Teléfono</label>
                    <input type="tel" name="telefono"
                           class="block w-full border border-gray-300 rounded-lg py-2 px-3 shadow-sm focus:outline-none focus:ring-2 focus:ring-teal-500"
                           value="<?= esc($paciente['telefono'] ?? '') ?>">
                </div>
                <div>
                    <label class="block text-sm font-medium text-gray-700 mb-1">Email</label>
                    <input type="email" name="email"
                           class="block w-full border border-gray-300 rounded-lg py-2 px-3 shadow-sm focus:outline-none focus:ring-2 focus:ring-teal-500"
                           value="<?= esc($paciente['email'] ?? '') ?>">
                </div>
                <div>
                    <label class="block text-sm font-medium text-gray-700 mb-1">Fecha de nacimiento</label>
                    <input type="date" name="fecha_nacimiento"
                           class="block w-full border border-gray-300 rounded-lg py-2 px-3 shadow-sm focus:outline-none focus:ring-2 focus:ring-teal-500"
                           value="<?= esc($paciente['fecha_nacimiento'] ?? '') ?>">
                </div>
                <div class="flex items-center">
                    <input id="activo" name="activo" type="checkbox" value="1"
                           class="h-4 w-4 text-teal-600 border-gray-300 rounded"
                           <?= ($paciente['activo'] ?? 1) ? 'checked' : '' ?>>
                    <label for="activo" class="ml-2 text-sm text-gray-700">Paciente activo</label>
                </div>
                <div class="md:col-span-2">
                    <label class="block text-sm font-medium text-gray-700 mb-1">Notas generales</label>
                    <textarea name="notas" rows="3"
                              class="block w-full border border-gray-300 rounded-lg py-2 px-3 shadow-sm focus:outline-none focus:ring-2 focus:ring-teal-500"><?= esc($paciente['notas'] ?? '') ?></textarea>
                </div>
            </div>

            <!-- Objetivos terapéuticos -->
            <div class="mt-6">
                <h4 class="text-md font-semibold text-gray-700 mb-3">Objetivos Terapéuticos Generales</h4>
                <div id="objetivos-lista" class="space-y-2">
                    <?php $objetivos = $paciente['objetivos_generales'] ?? ['']; ?>
                    <?php foreach ($objetivos as $obj): ?>
                        <div class="flex objetivo-row">
                            <input type="text" name="objetivos[]"
                                   class="flex-1 border border-gray-300 rounded-l-lg py-2 px-3 shadow-sm focus:outline-none focus:ring-2 focus:ring-teal-500"
                                   placeholder="Objetivo terapéutico..."
                                   value="<?= esc($obj) ?>">
                            <button type="button"
                                    class="px-3 bg-red-500 text-white rounded-r-lg hover:bg-red-600 transition-colors btn-eliminar-objetivo">
                                &times;
                            </button>
                        </div>
                    <?php endforeach; ?>
                </div>
                <button type="button" id="btn-agregar-objetivo"
                        class="mt-3 inline-flex items-center gap-1.5 px-3 py-1.5 bg-teal-500 text-white rounded-lg text-sm hover:bg-teal-600 transition-colors">
                    <svg xmlns="http://www.w3.org/2000/svg" class="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 4v16m8-8H4" />
                    </svg>
                    Agregar objetivo
                </button>
            </div>
        </div>

        <!-- Patologías (1/3) -->
        <div class="bg-white shadow-sm rounded-xl p-6">
            <h3 class="text-lg font-semibold text-gray-800 mb-5">Patologías</h3>

            <div id="patologias-lista" class="space-y-2">
                <?php $seleccionadas = $paciente['patologias'] ?? ['']; ?>
                <?php foreach ($seleccionadas as $pat): ?>
                    <div class="flex patologia-row">
                        <input type="text" name="patologias[]"
                               class="flex-1 border border-gray-300 rounded-l-lg py-2 px-3 shadow-sm focus:outline-none focus:ring-2 focus:ring-teal-500 text-sm"
                               placeholder="Patología..."
                               value="<?= esc($pat) ?>"
                               list="patologias-sugeridas">
                        <button type="button"
                                class="px-3 bg-red-500 text-white rounded-r-lg hover:bg-red-600 transition-colors btn-elim-pat">
                            &times;
                        </button>
                    </div>
                <?php endforeach; ?>
            </div>

            <datalist id="patologias-sugeridas">
                <?php foreach ($patologias as $pat): ?>
                    <option value="<?= esc($pat) ?>">
                <?php endforeach; ?>
            </datalist>

            <button type="button" id="btn-add-patologia"
                    class="mt-3 inline-flex items-center gap-1.5 px-3 py-1.5 border border-teal-500 text-teal-600 rounded-lg text-sm hover:bg-teal-50 transition-colors">
                <svg xmlns="http://www.w3.org/2000/svg" class="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 4v16m8-8H4" />
                </svg>
                Agregar patología
            </button>
        </div>
    </div>

    <div class="mt-6 flex flex-wrap gap-2">
        <button type="submit"
                class="inline-flex items-center gap-1.5 px-5 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 transition-colors font-medium">
            <svg xmlns="http://www.w3.org/2000/svg" class="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M5 13l4 4L19 7" />
            </svg>
            Guardar
        </button>
        <a href="<?= base_url('pacientes' . ($accion === 'editar' ? '/' . $paciente['id'] : '')) ?>"
           class="inline-flex items-center px-5 py-2 border border-gray-300 rounded-lg hover:bg-gray-100 transition-colors">
            Cancelar
        </a>
    </div>
</form>

<?= $this->endSection() ?>
<?= $this->section('scripts') ?>
<script>
document.getElementById('btn-agregar-objetivo').addEventListener('click', () => {
    const row = document.createElement('div');
    row.className = 'flex objetivo-row';
    row.innerHTML = `<input type="text" name="objetivos[]"
                            class="flex-1 border border-gray-300 rounded-l-lg py-2 px-3 shadow-sm focus:outline-none focus:ring-2 focus:ring-teal-500"
                            placeholder="Objetivo terapéutico...">
                     <button type="button"
                             class="px-3 bg-red-500 text-white rounded-r-lg hover:bg-red-600 transition-colors btn-eliminar-objetivo">
                         &times;
                     </button>`;
    document.getElementById('objetivos-lista').appendChild(row);
});

document.getElementById('objetivos-lista').addEventListener('click', e => {
    if (e.target.closest('.btn-eliminar-objetivo')) {
        e.target.closest('.objetivo-row').remove();
    }
});

function addPatologiaRow(value = '') {
    const row = document.createElement('div');
    row.className = 'flex patologia-row';
    row.innerHTML = `<input type="text" name="patologias[]"
                            class="flex-1 border border-gray-300 rounded-l-lg py-2 px-3 shadow-sm focus:outline-none focus:ring-2 focus:ring-teal-500 text-sm"
                            placeholder="Patología..." value="${value}" list="patologias-sugeridas">
                     <button type="button"
                             class="px-3 bg-red-500 text-white rounded-r-lg hover:bg-red-600 transition-colors btn-elim-pat">
                         &times;
                     </button>`;
    document.getElementById('patologias-lista').appendChild(row);
}

document.getElementById('btn-add-patologia').addEventListener('click', () => addPatologiaRow());
document.getElementById('patologias-lista').addEventListener('click', e => {
    if (e.target.closest('.btn-elim-pat')) {
        e.target.closest('.patologia-row').remove();
    }
});
</script>
<?= $this->endSection() ?>
