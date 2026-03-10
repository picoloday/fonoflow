<?= $this->extend('layouts/main') ?>
<?= $this->section('content') ?>

<div class="flex flex-wrap items-center gap-2 mb-6">
    <a href="<?= base_url('sesiones') ?>" class="text-gray-500 hover:text-gray-800 transition-colors">
        <svg xmlns="http://www.w3.org/2000/svg" class="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M15 19l-7-7 7-7" />
        </svg>
    </a>
    <h2 class="text-2xl font-semibold">Sesión — <?= date('d/m/Y', strtotime($sesion['fecha'])) ?></h2>
    <div class="ml-auto flex gap-2">
        <a href="<?= base_url('sesiones/' . $sesion['id'] . '/editar') ?>"
           class="inline-flex items-center gap-1 px-3 py-1.5 border border-teal-500 text-teal-600 rounded-lg hover:bg-teal-50 text-sm transition-colors">
            <svg xmlns="http://www.w3.org/2000/svg" class="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2"
                      d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" />
            </svg>
            Editar
        </a>
        <form method="post" action="<?= base_url('sesiones/' . $sesion['id'] . '/eliminar') ?>"
              onsubmit="return confirm('¿Eliminar esta sesión?')">
            <?= csrf_field() ?>
            <button class="inline-flex items-center gap-1 px-3 py-1.5 border border-red-500 text-red-500 rounded-lg hover:bg-red-50 text-sm transition-colors">
                <svg xmlns="http://www.w3.org/2000/svg" class="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M6 18L18 6M6 6l12 12" />
                </svg>
                Eliminar
            </button>
        </form>
    </div>
</div>

<div class="grid grid-cols-1 lg:grid-cols-3 gap-6">

    <!-- Columna izquierda -->
    <div class="space-y-4">

        <!-- Datos -->
        <div class="bg-white shadow-sm rounded-xl p-5">
            <h4 class="font-semibold text-gray-700 mb-3">Datos</h4>
            <div class="grid grid-cols-2 gap-3 text-sm text-gray-600">
                <div>
                    <div class="font-semibold text-gray-700">Fecha</div>
                    <div><?= date('d/m/Y', strtotime($sesion['fecha'])) ?></div>
                </div>
                <div>
                    <div class="font-semibold text-gray-700">Duración</div>
                    <div><?= $sesion['duracion'] ?> min</div>
                </div>
                <div class="col-span-2">
                    <div class="font-semibold text-gray-700">Precio</div>
                    <div class="text-green-600 text-2xl font-bold"><?= number_format($sesion['precio'], 2) ?>€</div>
                </div>
            </div>
        </div>

        <!-- Paciente -->
        <?php if ($paciente): ?>
            <div class="bg-white shadow-sm rounded-xl p-5">
                <h4 class="font-semibold text-gray-700 mb-3">Paciente</h4>
                <div class="flex items-center gap-3">
                    <div class="h-10 w-10 rounded-full bg-teal-600 text-white flex items-center justify-center font-bold flex-shrink-0">
                        <?= mb_strtoupper(mb_substr($paciente['nombre'], 0, 1)) ?>
                    </div>
                    <div class="font-semibold"><?= esc($paciente['nombre']) ?></div>
                </div>
                <a href="<?= base_url('pacientes/' . $paciente['id']) ?>"
                   class="mt-3 inline-flex items-center px-3 py-1.5 border border-teal-500 text-teal-600 rounded-lg hover:bg-teal-50 text-sm transition-colors">
                    Ver perfil
                </a>
            </div>
        <?php endif; ?>

        <!-- Materiales -->
        <?php if (!empty($sesion['materiales'])): ?>
            <div class="bg-white shadow-sm rounded-xl p-5">
                <h4 class="font-semibold text-gray-700 mb-3">Materiales</h4>
                <div class="flex flex-wrap gap-2">
                    <?php foreach ($sesion['materiales'] as $m): ?>
                        <span class="bg-gray-100 text-gray-700 px-2.5 py-1 rounded-full text-sm">
                            <?= esc($m) ?>
                        </span>
                    <?php endforeach; ?>
                </div>
            </div>
        <?php endif; ?>

        <!-- Actividades -->
        <?php if (!empty($sesion['actividades'])): ?>
            <div class="bg-white shadow-sm rounded-xl p-5">
                <h4 class="font-semibold text-gray-700 mb-3">Actividades</h4>
                <ul class="space-y-1.5">
                    <?php foreach ($sesion['actividades'] as $a): ?>
                        <li class="flex items-start gap-2 text-sm">
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

    </div>

    <!-- Columna derecha -->
    <div class="lg:col-span-2 space-y-4">

        <!-- Objetivos con checklist interactivo -->
        <?php if (!empty($sesion['objetivos'])):
            $cumplidos = count(array_filter($sesion['objetivos'], fn($o) => $o['cumplido']));
            $total     = count($sesion['objetivos']);
            $pct       = $total > 0 ? ($cumplidos / $total * 100) : 0;
        ?>
            <div class="bg-white shadow-sm rounded-xl p-5">
                <div class="flex justify-between items-center mb-3">
                    <span class="font-semibold text-gray-700">Objetivos</span>
                    <span id="obj-count"
                          class="px-2.5 py-1 rounded-full text-sm font-medium
                                 <?= $cumplidos === $total ? 'bg-green-100 text-green-700' : 'bg-yellow-100 text-yellow-700' ?>">
                        <?= $cumplidos ?>/<?= $total ?>
                    </span>
                </div>
                <div class="w-full bg-gray-200 rounded-full h-1.5 mb-4">
                    <div id="obj-progress"
                         class="h-1.5 bg-green-500 rounded-full transition-all duration-300"
                         style="width:<?= $pct ?>%"></div>
                </div>
                <ul id="objetivos-list" class="space-y-2">
                    <?php foreach ($sesion['objetivos'] as $obj): ?>
                        <li class="flex items-center gap-3 cursor-pointer select-none objetivo-item hover:bg-gray-50 rounded-lg p-1 -m-1 transition-colors"
                            data-id="<?= $obj['id'] ?>"
                            data-sesion="<?= $sesion['id'] ?>">

                            <?php if ($obj['cumplido']): ?>
                                <svg class="h-5 w-5 text-green-500 flex-shrink-0 icono-obj" viewBox="0 0 20 20" fill="currentColor">
                                    <path fill-rule="evenodd"
                                          d="M10 18a8 8 0 100-16 8 8 0 000 16zm-1-4l-3-3 1.414-1.414L9 11.172l4.586-4.586L15 8l-6 6z"
                                          clip-rule="evenodd" />
                                </svg>
                            <?php else: ?>
                                <svg class="h-5 w-5 text-gray-400 flex-shrink-0 icono-obj" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                    <circle cx="12" cy="12" r="9" stroke-width="2" />
                                </svg>
                            <?php endif; ?>

                            <span class="text-sm texto-obj <?= $obj['cumplido'] ? 'line-through text-gray-400' : 'text-gray-700' ?>">
                                <?= esc($obj['objetivo']) ?>
                            </span>
                        </li>
                    <?php endforeach; ?>
                </ul>
            </div>
        <?php endif; ?>

        <!-- Evolutivo -->
        <?php if ($sesion['evolutivo']): ?>
            <div class="bg-white shadow-sm rounded-xl p-5">
                <h4 class="font-semibold text-gray-700 mb-3">Evolutivo</h4>
                <p class="whitespace-pre-wrap text-gray-700 text-sm leading-relaxed">
                    <?= nl2br(esc($sesion['evolutivo'])) ?>
                </p>
            </div>
        <?php endif; ?>

        <!-- Observaciones -->
        <?php if ($sesion['observaciones']): ?>
            <div class="bg-white shadow-sm rounded-xl p-5">
                <h4 class="font-semibold text-gray-700 mb-3">Observaciones Clínicas</h4>
                <p class="whitespace-pre-wrap text-gray-700 text-sm leading-relaxed">
                    <?= nl2br(esc($sesion['observaciones'])) ?>
                </p>
            </div>
        <?php endif; ?>

    </div>
</div>

<?= $this->endSection() ?>
<?= $this->section('scripts') ?>
<script>
const BASE_URL = '<?= base_url() ?>';

// Plantillas SVG para los iconos de objetivo
const SVG_CUMPLIDO = `<svg class="h-5 w-5 text-green-500 flex-shrink-0 icono-obj" viewBox="0 0 20 20" fill="currentColor">
    <path fill-rule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm-1-4l-3-3 1.414-1.414L9 11.172l4.586-4.586L15 8l-6 6z" clip-rule="evenodd"/>
</svg>`;
const SVG_PENDIENTE = `<svg class="h-5 w-5 text-gray-400 flex-shrink-0 icono-obj" fill="none" viewBox="0 0 24 24" stroke="currentColor">
    <circle cx="12" cy="12" r="9" stroke-width="2"/>
</svg>`;

document.getElementById('objetivos-list')?.addEventListener('click', async e => {
    const item = e.target.closest('.objetivo-item');
    if (!item) return;

    const sesionId   = item.dataset.sesion;
    const objetivoId = item.dataset.id;

    try {
        const res  = await fetch(`${BASE_URL}/sesiones/${sesionId}/objetivo/${objetivoId}`, {
            method: 'POST',
            headers: {
                'X-Requested-With': 'XMLHttpRequest',
                'Content-Type': 'application/json'
            },
            body: JSON.stringify({ <?= csrf_token() ?>: '<?= csrf_hash() ?>' })
        });
        const data = await res.json();

        if (data.ok) {
            data.objetivos.forEach(obj => {
                const li  = document.querySelector(`.objetivo-item[data-id="${obj.id}"]`);
                if (!li) return;

                // Reemplazar icono SVG
                const tmp = document.createElement('div');
                tmp.innerHTML = obj.cumplido == 1 ? SVG_CUMPLIDO : SVG_PENDIENTE;
                li.querySelector('.icono-obj').replaceWith(tmp.firstElementChild);

                // Actualizar estilo del texto
                const txt = li.querySelector('.texto-obj');
                if (obj.cumplido == 1) {
                    txt.classList.add('line-through', 'text-gray-400');
                    txt.classList.remove('text-gray-700');
                } else {
                    txt.classList.remove('line-through', 'text-gray-400');
                    txt.classList.add('text-gray-700');
                }
            });

            // Actualizar contador y barra de progreso
            const cumplidos = data.objetivos.filter(o => o.cumplido == 1).length;
            const total     = data.objetivos.length;
            const pct       = total > 0 ? (cumplidos / total * 100) : 0;

            const countEl = document.getElementById('obj-count');
            countEl.textContent = `${cumplidos}/${total}`;
            countEl.className = `px-2.5 py-1 rounded-full text-sm font-medium ${
                cumplidos === total
                    ? 'bg-green-100 text-green-700'
                    : 'bg-yellow-100 text-yellow-700'
            }`;
            document.getElementById('obj-progress').style.width = `${pct}%`;
        }
    } catch (err) {
        console.error('Error al actualizar objetivo:', err);
    }
});
</script>
<?= $this->endSection() ?>
