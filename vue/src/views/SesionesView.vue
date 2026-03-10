<script setup>
import { onMounted, computed } from 'vue'
import { RouterLink } from 'vue-router'
import { useSesionesStore } from '@/stores/sesiones'

const store = useSesionesStore()
onMounted(() => store.cargar())

const meses = computed(() => Object.keys(store.lista.por_mes))

const nombreMes = (ym) => {
  const [y, m] = ym.split('-')
  return new Date(y, m - 1).toLocaleString('es', { month: 'long', year: 'numeric' })
}
</script>

<template>
  <div class="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6 space-y-5">

    <div class="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
      <div>
        <h1 class="text-2xl font-bold text-gray-900">Sesiones</h1>
        <p class="text-sm text-gray-500 mt-0.5">
          {{ store.lista.total_sesiones }} sesiones · {{ store.lista.total_ingresos.toFixed(2) }}€ total
        </p>
      </div>
      <RouterLink
        to="/sesiones/nueva"
        class="inline-flex items-center gap-1.5 px-4 py-2 bg-teal-600 text-white text-sm rounded-lg hover:bg-teal-700 transition-colors"
      >
        <svg class="w-4 h-4" fill="none" stroke="currentColor" stroke-width="2" viewBox="0 0 24 24">
          <path stroke-linecap="round" stroke-linejoin="round" d="M12 4v16m8-8H4"/>
        </svg>
        Nueva sesión
      </RouterLink>
    </div>

    <div v-if="store.loading" class="space-y-4">
      <div v-for="i in 3" :key="i" class="bg-white rounded-xl p-5 animate-pulse">
        <div class="h-4 bg-gray-200 rounded w-32 mb-4"></div>
        <div v-for="j in 3" :key="j" class="h-12 bg-gray-100 rounded-lg mb-2"></div>
      </div>
    </div>

    <div v-else class="space-y-6">
      <div v-for="mes in meses" :key="mes" class="bg-white shadow-sm rounded-xl overflow-hidden">
        <div class="px-5 py-3 border-b bg-gray-50 flex justify-between items-center">
          <h2 class="font-semibold text-gray-700 capitalize">{{ nombreMes(mes) }}</h2>
          <span class="text-sm font-medium text-teal-600">
            {{ store.lista.por_mes[mes].ingresos.toFixed(2) }}€
          </span>
        </div>
        <ul class="divide-y divide-gray-100">
          <li v-for="s in store.lista.por_mes[mes].sesiones" :key="s.id">
            <RouterLink :to="`/sesiones/${s.id}`" class="flex items-center gap-3 px-5 py-3 hover:bg-gray-50">
              <div class="flex-1 min-w-0">
                <p class="text-sm font-medium text-gray-900 truncate">{{ s.paciente_nombre }}</p>
                <p class="text-xs text-gray-400">{{ s.fecha }} {{ s.hora_inicio ? '· ' + s.hora_inicio : '' }}</p>
              </div>
              <span class="text-sm font-medium text-teal-600">{{ Number(s.precio).toFixed(2) }}€</span>
              <svg class="w-4 h-4 text-gray-300" fill="none" stroke="currentColor" stroke-width="2" viewBox="0 0 24 24">
                <path stroke-linecap="round" stroke-linejoin="round" d="M9 5l7 7-7 7"/>
              </svg>
            </RouterLink>
          </li>
        </ul>
      </div>

      <div v-if="!meses.length" class="text-center py-12 text-gray-400">
        No hay sesiones registradas
      </div>
    </div>

  </div>
</template>
