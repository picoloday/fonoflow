<script setup>
import { onMounted, computed } from 'vue'
import { useRoute, RouterLink } from 'vue-router'
import { usePacientesStore } from '@/stores/pacientes'

const store = usePacientesStore()
const route = useRoute()
onMounted(() => store.cargarUno(route.params.id))

const hoy = new Date().toLocaleDateString('es', { day: 'numeric', month: 'long', year: 'numeric' })

const sesionesCompletadas = computed(() =>
  (store.actual?.historial || []).filter(s => s.estado === 'completada')
)

const sesionesTotales = computed(() => store.actual?.historial?.length || 0)

// Todos los objetivos trabajados (con % de éxito)
const objetivosResumen = computed(() => {
  const mapa = {}
  for (const s of sesionesCompletadas.value) {
    for (const o of s.objetivos || []) {
      const key = o.objetivo
      if (!mapa[key]) mapa[key] = { objetivo: key, veces: 0, cumplidas: 0 }
      mapa[key].veces++
      if (o.cumplido) mapa[key].cumplidas++
    }
  }
  return Object.values(mapa).sort((a, b) => b.veces - a.veces)
})

function formatFecha(f) {
  if (!f) return ''
  const [y, m, d] = f.split('-')
  return new Date(y, m - 1, d).toLocaleDateString('es', { day: 'numeric', month: 'long', year: 'numeric' })
}

function imprimir() {
  window.print()
}
</script>

<template>
  <div class="max-w-3xl mx-auto px-4 sm:px-6 lg:px-8 py-6">

    <!-- Controles (no se imprimen) -->
    <div class="flex items-center gap-3 mb-6 print:hidden">
      <RouterLink :to="`/pacientes/${route.params.id}`" class="text-gray-400 hover:text-gray-600">
        <svg class="w-5 h-5" fill="none" stroke="currentColor" stroke-width="2" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" d="M15 19l-7-7 7-7"/></svg>
      </RouterLink>
      <h1 class="text-lg font-bold text-gray-700">Vista previa del informe</h1>
      <button @click="imprimir"
        class="ml-auto inline-flex items-center gap-1.5 px-4 py-2 bg-teal-600 text-white text-sm font-medium rounded-lg hover:bg-teal-700">
        <svg class="w-4 h-4" fill="none" stroke="currentColor" stroke-width="2" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" d="M17 17h2a2 2 0 002-2v-4a2 2 0 00-2-2H5a2 2 0 00-2 2v4a2 2 0 002 2h2m2 4h6a2 2 0 002-2v-4a2 2 0 00-2-2H9a2 2 0 00-2 2v4a2 2 0 002 2zm8-12V5a2 2 0 00-2-2H9a2 2 0 00-2 2v4h10z"/></svg>
        Imprimir / PDF
      </button>
    </div>

    <div v-if="store.loading" class="animate-pulse space-y-4">
      <div class="h-10 bg-gray-200 rounded w-64"></div>
    </div>

    <div v-else-if="store.actual" class="bg-white shadow-sm rounded-xl p-8 space-y-8 print:shadow-none print:p-0">

      <!-- Cabecera -->
      <div class="flex items-start justify-between border-b border-gray-200 pb-6">
        <div>
          <div class="flex items-center gap-2 text-teal-600 font-bold text-lg mb-1">
            <svg class="w-6 h-6" viewBox="0 0 28 28" fill="none" xmlns="http://www.w3.org/2000/svg">
              <rect width="28" height="28" rx="7" fill="#0d9488"/>
              <path d="M4 8.5A2.5 2.5 0 016.5 6h15A2.5 2.5 0 0124 8.5v8a2.5 2.5 0 01-2.5 2.5H17l-3 2.5-3-2.5H6.5A2.5 2.5 0 014 16.5v-8z" fill="white"/>
              <rect x="9" y="11.5" width="1.8" height="3.5" rx="0.9" fill="#0d9488"/>
              <rect x="13" y="9.5" width="1.8" height="7.5" rx="0.9" fill="#0d9488"/>
              <rect x="17" y="11.5" width="1.8" height="3.5" rx="0.9" fill="#0d9488"/>
            </svg>
            FonoFlow
          </div>
          <h2 class="text-2xl font-bold text-gray-900">Informe Logopédico</h2>
          <p class="text-sm text-gray-400 mt-1">Generado el {{ hoy }}</p>
        </div>
      </div>

      <!-- Datos del paciente -->
      <section>
        <h3 class="text-sm font-semibold text-gray-400 uppercase tracking-wide mb-3">Datos del paciente</h3>
        <div class="grid grid-cols-2 gap-x-8 gap-y-2 text-sm">
          <div><span class="text-gray-400">Nombre: </span><span class="font-medium text-gray-900">{{ store.actual.nombre }}</span></div>
          <div v-if="store.actual.tutor"><span class="text-gray-400">Tutor/Responsable: </span><span class="font-medium text-gray-900">{{ store.actual.tutor }}</span></div>
          <div v-if="store.actual.telefono"><span class="text-gray-400">Teléfono: </span><span class="font-medium text-gray-900">{{ store.actual.telefono }}</span></div>
          <div v-if="store.actual.email"><span class="text-gray-400">Email: </span><span class="font-medium text-gray-900">{{ store.actual.email }}</span></div>
        </div>
        <div v-if="store.actual.patologias?.length" class="mt-3">
          <span class="text-sm text-gray-400">Diagnóstico / Patologías: </span>
          <span v-for="p in store.actual.patologias" :key="p" class="inline-block ml-1 text-sm bg-teal-50 text-teal-700 px-2 py-0.5 rounded-full">{{ p }}</span>
        </div>
      </section>

      <!-- Resumen estadístico -->
      <section>
        <h3 class="text-sm font-semibold text-gray-400 uppercase tracking-wide mb-3">Resumen de intervención</h3>
        <div class="grid grid-cols-3 gap-4">
          <div class="bg-gray-50 rounded-xl p-4 text-center">
            <p class="text-2xl font-bold text-gray-900">{{ sesionesTotales }}</p>
            <p class="text-sm text-gray-400 mt-1">Sesiones programadas</p>
          </div>
          <div class="bg-teal-50 rounded-xl p-4 text-center">
            <p class="text-2xl font-bold text-teal-700">{{ sesionesCompletadas.length }}</p>
            <p class="text-sm text-gray-400 mt-1">Sesiones realizadas</p>
          </div>
          <div class="bg-gray-50 rounded-xl p-4 text-center">
            <p class="text-2xl font-bold text-gray-900">
              {{ sesionesTotales ? Math.round((sesionesCompletadas.length / sesionesTotales) * 100) : 0 }}%
            </p>
            <p class="text-sm text-gray-400 mt-1">Asistencia</p>
          </div>
        </div>
      </section>

      <!-- Objetivos trabajados -->
      <section v-if="objetivosResumen.length">
        <h3 class="text-sm font-semibold text-gray-400 uppercase tracking-wide mb-3">Objetivos trabajados</h3>
        <div class="space-y-2">
          <div v-for="o in objetivosResumen" :key="o.objetivo" class="flex items-center gap-3">
            <div class="flex-1 min-w-0">
              <p class="text-sm text-gray-800 truncate">{{ o.objetivo }}</p>
              <div class="flex items-center gap-2 mt-0.5">
                <div class="flex-1 h-1.5 bg-gray-100 rounded-full overflow-hidden">
                  <div class="h-full bg-teal-500 rounded-full transition-all"
                    :style="`width:${Math.round((o.cumplidas / o.veces) * 100)}%`"></div>
                </div>
                <span class="text-sm text-gray-400 shrink-0">{{ o.cumplidas }}/{{ o.veces }}</span>
              </div>
            </div>
            <span class="text-sm font-medium shrink-0"
              :class="o.cumplidas === o.veces ? 'text-green-600' : 'text-gray-400'">
              {{ Math.round((o.cumplidas / o.veces) * 100) }}%
            </span>
          </div>
        </div>
      </section>

      <!-- Historial de sesiones -->
      <section v-if="sesionesCompletadas.length">
        <h3 class="text-sm font-semibold text-gray-400 uppercase tracking-wide mb-3">Historial de sesiones realizadas</h3>
        <div class="space-y-4">
          <div v-for="s in sesionesCompletadas" :key="s.id" class="border border-gray-100 rounded-xl p-4">
            <div class="flex items-center justify-between mb-2">
              <p class="text-sm font-semibold text-gray-900">{{ formatFecha(s.fecha) }}</p>
              <span class="text-sm text-gray-400">{{ s.duracion }} min</span>
            </div>
            <div v-if="s.objetivos?.length" class="flex flex-wrap gap-1 mb-2">
              <span v-for="o in s.objetivos" :key="o.id || o.objetivo"
                class="text-sm px-2 py-0.5 rounded-full"
                :class="o.cumplido ? 'bg-green-100 text-green-700' : 'bg-gray-100 text-gray-500'">
                {{ o.cumplido ? '✓' : '○' }} {{ o.objetivo }}
              </span>
            </div>
            <p v-if="s.evolutivo" class="text-sm text-gray-600 mt-2 whitespace-pre-line">{{ s.evolutivo }}</p>
          </div>
        </div>
      </section>

    </div>
  </div>
</template>

