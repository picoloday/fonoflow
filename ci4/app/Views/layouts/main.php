<!DOCTYPE html>
<html lang="es">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title><?= esc($titulo ?? 'FonoFlow') ?> — FonoFlow</title>
    <script src="https://cdn.tailwindcss.com"></script>
    <style>
        /* Timeline agenda */
        .slot-libre   { border-left: 3px solid #0d9488; background: #f0fdfa; }
        .slot-ocupado { border-left: 3px solid #e5e7eb; }
        /* Smooth nav underline transitions */
        nav a.nav-link { position: relative; }
    </style>
</head>
<body class="bg-gray-50 text-gray-800 min-h-screen">

<!-- ══════════════════════════════════════════════
     NAVBAR — blanca con tabs estilo profesional
══════════════════════════════════════════════════ -->
<nav class="bg-white sticky top-0 z-50 shadow-sm border-b border-gray-200">
    <div class="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div class="flex items-stretch h-16">

            <!-- Logo -->
            <a href="<?= base_url('/') ?>"
               class="flex items-center gap-2 text-teal-600 font-bold text-xl mr-8 flex-shrink-0">
                <svg xmlns="http://www.w3.org/2000/svg" class="h-7 w-7" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2"
                          d="M9 19V6l-2 2m0-2l2 2m9 11V6l2 2m0-2l-2 2" />
                </svg>
                <span>FonoFlow</span>
            </a>

            <?php
                $uri     = uri_string();
                $isHome  = $uri === '';
                $isAgenda = strpos($uri, 'agenda') === 0 || strpos($uri, 'citas') === 0;
                $isPac   = strpos($uri, 'pacientes') === 0;
                $isSes   = strpos($uri, 'sesiones') === 0;
            ?>

            <!-- Desktop nav — tab style con borde inferior activo -->
            <div class="hidden md:flex items-stretch">
                <a href="<?= base_url('/') ?>"
                   class="flex items-center px-4 text-sm font-medium border-b-2 transition-colors
                          <?= $isHome
                              ? 'border-teal-600 text-teal-600'
                              : 'border-transparent text-gray-600 hover:text-teal-600 hover:border-teal-300' ?>">
                    Dashboard
                </a>
                <a href="<?= base_url('agenda') ?>"
                   class="flex items-center px-4 text-sm font-medium border-b-2 transition-colors
                          <?= $isAgenda
                              ? 'border-teal-600 text-teal-600'
                              : 'border-transparent text-gray-600 hover:text-teal-600 hover:border-teal-300' ?>">
                    Agenda
                </a>
                <a href="<?= base_url('pacientes') ?>"
                   class="flex items-center px-4 text-sm font-medium border-b-2 transition-colors
                          <?= $isPac
                              ? 'border-teal-600 text-teal-600'
                              : 'border-transparent text-gray-600 hover:text-teal-600 hover:border-teal-300' ?>">
                    Pacientes
                </a>
                <a href="<?= base_url('sesiones') ?>"
                   class="flex items-center px-4 text-sm font-medium border-b-2 transition-colors
                          <?= $isSes
                              ? 'border-teal-600 text-teal-600'
                              : 'border-transparent text-gray-600 hover:text-teal-600 hover:border-teal-300' ?>">
                    Sesiones
                </a>
            </div>

            <!-- Botón hamburguesa móvil -->
            <button id="mobile-menu-btn"
                    class="md:hidden ml-auto flex items-center justify-center p-2 rounded-md text-gray-500 hover:text-gray-700 hover:bg-gray-100 focus:outline-none transition-colors">
                <svg id="icon-open" class="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M4 6h16M4 12h16M4 18h16" />
                </svg>
                <svg id="icon-close" class="h-6 w-6 hidden" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M6 18L18 6M6 6l12 12" />
                </svg>
            </button>
        </div>
    </div>

    <!-- Menú móvil desplegable -->
    <div id="mobile-menu" class="hidden md:hidden border-t border-gray-200 bg-white">
        <div class="px-3 py-2 space-y-0.5">
            <a href="<?= base_url('/') ?>"
               class="flex items-center gap-2 px-3 py-2.5 rounded-lg text-sm font-medium transition-colors
                      <?= $isHome ? 'bg-teal-50 text-teal-700' : 'text-gray-700 hover:bg-gray-50 hover:text-teal-600' ?>">
                <svg xmlns="http://www.w3.org/2000/svg" class="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2"
                          d="M3 12l2-2m0 0l7-7 7 7M5 10v10a1 1 0 001 1h3m10-11l2 2m-2-2v10a1 1 0 01-1 1h-3m-6 0a1 1 0 001-1v-4a1 1 0 011-1h2a1 1 0 011 1v4a1 1 0 001 1m-6 0h6" />
                </svg>
                Dashboard
            </a>
            <a href="<?= base_url('agenda') ?>"
               class="flex items-center gap-2 px-3 py-2.5 rounded-lg text-sm font-medium transition-colors
                      <?= $isAgenda ? 'bg-teal-50 text-teal-700' : 'text-gray-700 hover:bg-gray-50 hover:text-teal-600' ?>">
                <svg xmlns="http://www.w3.org/2000/svg" class="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2"
                          d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
                </svg>
                Agenda
            </a>
            <a href="<?= base_url('pacientes') ?>"
               class="flex items-center gap-2 px-3 py-2.5 rounded-lg text-sm font-medium transition-colors
                      <?= $isPac ? 'bg-teal-50 text-teal-700' : 'text-gray-700 hover:bg-gray-50 hover:text-teal-600' ?>">
                <svg xmlns="http://www.w3.org/2000/svg" class="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2"
                          d="M17 20h5V4H2v16h5m5-9a3 3 0 100-6 3 3 0 000 6z" />
                </svg>
                Pacientes
            </a>
            <a href="<?= base_url('sesiones') ?>"
               class="flex items-center gap-2 px-3 py-2.5 rounded-lg text-sm font-medium transition-colors
                      <?= $isSes ? 'bg-teal-50 text-teal-700' : 'text-gray-700 hover:bg-gray-50 hover:text-teal-600' ?>">
                <svg xmlns="http://www.w3.org/2000/svg" class="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2"
                          d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                </svg>
                Sesiones
            </a>
        </div>
    </div>
</nav>

<!-- Flash messages -->
<div class="fixed top-[4.5rem] right-4 z-50 space-y-2 w-full max-w-sm pointer-events-none">
    <?php if (session()->getFlashdata('exito')): ?>
        <div class="pointer-events-auto bg-teal-50 border border-teal-300 text-teal-800 px-4 py-3 rounded-xl shadow-md flex items-start gap-3" role="alert">
            <svg xmlns="http://www.w3.org/2000/svg" class="h-5 w-5 flex-shrink-0 mt-0.5 text-teal-500" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
            </svg>
            <span class="text-sm"><?= session()->getFlashdata('exito') ?></span>
        </div>
    <?php endif; ?>
    <?php if (session()->getFlashdata('error')): ?>
        <div class="pointer-events-auto bg-red-50 border border-red-300 text-red-800 px-4 py-3 rounded-xl shadow-md flex items-start gap-3" role="alert">
            <svg xmlns="http://www.w3.org/2000/svg" class="h-5 w-5 flex-shrink-0 mt-0.5 text-red-500" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
            </svg>
            <span class="text-sm"><?= session()->getFlashdata('error') ?></span>
        </div>
    <?php endif; ?>
</div>

<!-- Contenido principal -->
<main class="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
    <?= $this->renderSection('content') ?>
</main>

<?= $this->renderSection('scripts') ?>
<script>
    // Auto-fade flash messages
    setTimeout(() => {
        document.querySelectorAll('.fixed.top-\\[4\\.5rem\\] > div').forEach(el => {
            el.style.transition = 'opacity .4s';
            el.style.opacity = '0';
            setTimeout(() => el.remove(), 400);
        });
    }, 4000);

    // Mobile menu toggle
    const mobileBtn  = document.getElementById('mobile-menu-btn');
    const mobileMenu = document.getElementById('mobile-menu');
    const iconOpen   = document.getElementById('icon-open');
    const iconClose  = document.getElementById('icon-close');
    mobileBtn?.addEventListener('click', () => {
        mobileMenu.classList.toggle('hidden');
        iconOpen.classList.toggle('hidden');
        iconClose.classList.toggle('hidden');
    });
</script>
</body>
</html>
