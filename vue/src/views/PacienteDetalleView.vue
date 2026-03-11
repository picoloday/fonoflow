<script setup>
import { onMounted, computed } from 'vue'
import { useRoute, RouterLink } from 'vue-router'
import { usePacientesStore } from '@/stores/pacientes'

const store = usePacientesStore()
const route = useRoute()
onMounted(() => store.cargarUno(route.params.id))

const estadoBadge = {
  programada:   'bg-teal-100 text-teal-700',
  completada:   'bg-green-100 text-green-700',
  cancelada:    'bg-red-100 text-red-700',
  reprogramada: 'bg-amber-100 text-amber-700',
}

function progreso(sesion) {
  const objs = sesion.objetivos || []
  if (!objs.length) return null
  const cumplidos = objs.filter(o => o.cumplido).length
  return Math.round((cumplidos / objs.length) * 100)
}
</script>

<template>
  <div class="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
    <div v-if="store.loading" class="animate-pulse space-y-4">
      <div class="h-8 bg-gray-200 rounded w-48"></div>
    </div>
    <div v-else-if="store.actual">
      <div class="flex items-center gap-4 mb-6 flex-wrap">
        <RouterLink to="/pacientes" class="text-gray-400 hover:text-gray-600">
          <svg class="w-5 h-5" fill="none" stroke="currentColor" stroke-width="2" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" d="M15 19l-7-7 7-7"/></svg>
        </RouterLink>
        <h1 class="text-2xl font-bold text-gray-900">{{ store.actual.nombre }}</h1>
        <div class="ml-auto flex items-center gap-2">
          <RouterLink
            :to="`/sesiones/nueva?paciente=${store.actual.id}`"
            class="inline-flex items-center gap-1.5 px-3 py-1.5 bg-teal-600 text-white text-sm font-medium rounded-lg hover:bg-teal-700 transition-colors"
          >
            <svg class="w-4 h-4" fill="none" stroke="currentColor" stroke-width="2" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" d="M12 4v16m8-8H4"/></svg>
            Nueva sesión
          </RouterLink>
          <RouterLink
            :to="`/pacientes/${store.actual.id}/informe`"
            class="inline-flex items-center gap-1.5 px-3 py-1.5 border border-gray-300 text-sm rounded-lg hover:bg-gray-50 transition-colors"
          >
            <svg class="w-4 h-4" fill="none" stroke="currentColor" stroke-width="2" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z"/></svg>
            Generar informe
          </RouterLink>
          <RouterLink :to="`/pacientes/${store.actual.id}/editar`" class="inline-flex items-center px-3 py-1.5 border border-gray-300 rounded-lg text-sm hover:bg-gray-50">
            Editar
          </RouterLink>
        </div>
      </div>

      <div class="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <!-- Info básica -->
        <div class="bg-white shadow-sm rounded-xl p-5 space-y-3">
          <div v-if="store.actual.tutor"><span class="text-xs text-gray-400">Tutor</span><p class="text-sm">{{ store.actual.tutor }}</p></div>
          <div v-if="store.actual.telefono"><span class="text-xs text-gray-400">Teléfono</span><p class="text-sm">{{ store.actual.telefono }}</p></div>
          <div v-if="store.actual.email"><span class="text-xs text-gray-400">Email</span><p class="text-sm">{{ store.actual.email }}</p></div>
          <div v-if="store.actual.patologias?.length">
            <span class="text-xs text-gray-400">Patologías</span>
            <div class="flex flex-wrap gap-1 mt-1">
              <span v-for="p in store.actual.patologias" :key="p" class="text-xs bg-teal-50 text-teal-700 px-2 py-0.5 rounded-full">{{ p }}</span>
            </div>
          </div>
        </div>

        <!-- Historial -->
        <div class="lg:col-span-2 bg-white shadow-sm rounded-xl overflow-hidden">
          <div class="px-5 py-3 border-b bg-gray-50"><h2 class="font-semibold text-sm text-gray-700">Historial de sesiones</h2></div>
          <ul class="divide-y divide-gray-100">
            <li v-for="s in store.actual.historial" :key="s.id">
              <RouterLink :to="`/sesiones/${s.id}`" class="flex items-center gap-3 px-5 py-3 hover:bg-gray-50">
                <div class="flex-1 min-w-0">
                  <p class="text-sm font-medium text-gray-900">{{ s.fecha }}</p>
                  <div v-if="progreso(s) !== null" class="flex items-center gap-2 mt-1">
                    <div class="flex-1 h-1.5 bg-gray-100 rounded-full overflow-hidden">
                      <div class="h-full bg-teal-500 rounded-full" :style="`width:${progreso(s)}%`"></div>
                    </div>
                    <span class="text-xs text-gray-400">{{ progreso(s) }}%</span>
                  </div>
                </div>
                <span class="text-xs px-2 py-0.5 rounded-full font-medium shrink-0" :class="estadoBadge[s.estado] || 'bg-gray-100 text-gray-600'">{{ s.estado }}</span>
                <span class="text-sm text-teal-600 shrink-0">{{ Number(s.precio).toFixed(2) }}€</span>
              </RouterLink>
            </li>
            <li v-if="!store.actual.historial?.length" class="px-5 py-8 text-center text-gray-400 text-sm">Sin sesiones</li>
          </ul>
        </div>
      </div>
    </div>
  </div>
</template>
