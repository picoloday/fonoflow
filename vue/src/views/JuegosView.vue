<script setup>
const juegos = [
  {
    nombre: 'Sílabas',
    descripcion: 'Identifica y separa sílabas en palabras',
    path: '/games/conciencia-fonologica/silabas/',
    icon: 'M3 5.5h18M3 12h18M3 18.5h18',
  },
  {
    nombre: 'Aplausos',
    descripcion: 'Cuenta las sílabas dando palmadas',
    path: '/games/conciencia-fonologica/aplausos/',
    icon: 'M14.828 14.828a4 4 0 01-5.656 0M9 10h.01M15 10h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z',
  },
  {
    nombre: 'Lavadora',
    descripcion: 'Clasifica palabras por número de sílabas',
    path: '/games/conciencia-fonologica/lavadora/',
    icon: 'M12 6V4m0 2a2 2 0 100 4m0-4a2 2 0 110 4m-6 8a2 2 0 100-4m0 4a2 2 0 110-4m0 4v2m0-6V4m6 6v10m6-2a2 2 0 100-4m0 4a2 2 0 110-4m0 4v2m0-6V4',
  },
  {
    nombre: 'Memoria',
    descripcion: 'Empareja imágenes con el mismo número de sílabas',
    path: '/games/conciencia-fonologica/memoria/',
    icon: 'M4 6a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2H6a2 2 0 01-2-2V6zm10 0a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2h-2a2 2 0 01-2-2V6zM4 16a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2H6a2 2 0 01-2-2v-2zm10 0a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2h-2a2 2 0 01-2-2v-2z',
  },
  {
    nombre: 'Puente',
    descripcion: 'Completa palabras eligiendo la sílaba correcta',
    path: '/games/conciencia-fonologica/puente/',
    icon: 'M9 20l-5.447-2.724A1 1 0 013 16.382V5.618a1 1 0 011.447-.894L9 7m0 13l6-3m-6 3V7m6 10l4.553 2.276A1 1 0 0021 18.382V7.618a1 1 0 00-.553-.894L15 4m0 13V4m0 0L9 7',
  },
]
</script>

<template>
  <div class="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6 space-y-8">

    <h1 class="text-2xl font-bold text-gray-900">Juegos</h1>

    <!-- Conciencia Fonológica -->
    <section>
      <h2 class="text-base font-semibold text-gray-500 uppercase tracking-wide mb-4">Conciencia Fonológica</h2>
      <div class="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">

        <a
          v-for="juego in juegos" :key="juego.path"
          :href="juego.path"
          target="_blank"
          class="bg-white shadow-sm rounded-xl p-5 flex items-start gap-4 hover:shadow-md transition-shadow group"
        >
          <div class="bg-teal-100 text-teal-600 rounded-lg p-3 shrink-0">
            <svg class="w-6 h-6" fill="none" stroke="currentColor" stroke-width="1.8" viewBox="0 0 24 24">
              <path stroke-linecap="round" stroke-linejoin="round" :d="juego.icon"/>
            </svg>
          </div>
          <div class="flex-1 min-w-0">
            <p class="font-semibold text-gray-900 group-hover:text-teal-600 transition-colors">{{ juego.nombre }}</p>
            <p class="text-sm text-gray-500 mt-0.5">{{ juego.descripcion }}</p>
          </div>
          <svg class="w-4 h-4 text-gray-300 group-hover:text-teal-400 transition-colors shrink-0 mt-1" fill="none" stroke="currentColor" stroke-width="2" viewBox="0 0 24 24">
            <path stroke-linecap="round" stroke-linejoin="round" d="M10 6H6a2 2 0 00-2 2v10a2 2 0 002 2h10a2 2 0 002-2v-4M14 4h6m0 0v6m0-6L10 14"/>
          </svg>
        </a>

      </div>
    </section>

  </div>
</template>
