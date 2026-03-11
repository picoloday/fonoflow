<script setup>
import { ref, onMounted } from 'vue'
import { RouterLink } from 'vue-router'
import { getDashboard } from '@/api/dashboard'

const stats   = ref(null)
const loading = ref(true)

onMounted(async () => {
  const { data } = await getDashboard()
  stats.value = data.data
  loading.value = false
})

const estadoColor = {
  programada:   'bg-teal-100 text-teal-700',
  completada:   'bg-green-100 text-green-700',
  cancelada:    'bg-red-100 text-red-700',
  reprogramada: 'bg-amber-100 text-amber-700',
  no_asistio:   'bg-gray-100 text-gray-600',
}
</script>

<template>
  <div class="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6 space-y-6">

    <h1 class="text-2xl font-bold text-gray-900">Dashboard</h1>

    <!-- Skeleton -->
    <template v-if="loading">
      <div class="grid grid-cols-1 sm:grid-cols-3 gap-4">
        <div v-for="i in 3" :key="i" class="bg-white rounded-xl p-5 animate-pulse">
          <div class="h-4 bg-gray-200 rounded w-2/3 mb-3"></div>
          <div class="h-8 bg-gray-200 rounded w-1/2"></div>
        </div>
      </div>
    </template>

    <template v-else-if="stats">

      <!-- Stats -->
      <div class="grid grid-cols-1 sm:grid-cols-3 gap-4">
        <div class="bg-white shadow-sm rounded-xl p-5">
          <p class="text-xs text-gray-500 uppercase tracking-wide font-medium">Pacientes</p>
          <p class="text-3xl font-bold text-teal-600 mt-1">{{ stats.total_pacientes }}</p>
        </div>
        <div class="bg-white shadow-sm rounded-xl p-5">
          <p class="text-xs text-gray-500 uppercase tracking-wide font-medium">Sesiones hoy</p>
          <p class="text-3xl font-bold text-teal-600 mt-1">{{ stats.citas_hoy }}</p>
        </div>
        <div class="bg-white shadow-sm rounded-xl p-5">
          <p class="text-xs text-gray-500 uppercase tracking-wide font-medium">Sesiones este mes</p>
          <p class="text-3xl font-bold text-teal-600 mt-1">{{ stats.sesiones_este_mes }}</p>
        </div>
      </div>

      <!-- Proximas citas + últimas sesiones -->
      <div class="grid grid-cols-1 lg:grid-cols-2 gap-6">

        <!-- Próximas citas -->
        <div class="bg-white shadow-sm rounded-xl overflow-hidden">
          <div class="px-5 py-3 border-b bg-gray-50 flex justify-between items-center">
            <h2 class="font-semibold text-gray-700 text-sm">Sesiones de hoy</h2>
            <RouterLink to="/agenda" class="text-xs text-teal-600 hover:underline">Ver agenda</RouterLink>
          </div>
          <div v-if="stats.proximas_citas.length === 0" class="px-5 py-8 text-center text-gray-400 text-sm">
            No hay sesiones programadas para hoy
          </div>
          <ul v-else class="divide-y divide-gray-100">
            <li v-for="s in stats.proximas_citas" :key="s.id">
              <RouterLink :to="`/sesiones/${s.id}`" class="px-5 py-3 flex items-center gap-3 hover:bg-gray-50">
                <span class="text-sm font-mono text-gray-500 w-12 shrink-0">{{ s.hora_inicio ? s.hora_inicio.slice(0,5) : '—' }}</span>
                <div class="flex-1 min-w-0">
                  <p class="text-sm font-medium text-gray-900 truncate">{{ s.paciente_nombre }}</p>
                  <p class="text-xs text-gray-400">{{ s.duracion }} min</p>
                </div>
                <span class="text-xs px-2 py-0.5 rounded-full font-medium shrink-0" :class="estadoColor[s.estado] || 'bg-gray-100 text-gray-600'">
                  {{ s.estado }}
                </span>
              </RouterLink>
            </li>
          </ul>
        </div>

        <!-- Últimas sesiones -->
        <div class="bg-white shadow-sm rounded-xl overflow-hidden">
          <div class="px-5 py-3 border-b bg-gray-50 flex justify-between items-center">
            <h2 class="font-semibold text-gray-700 text-sm">Últimas sesiones</h2>
            <RouterLink to="/sesiones" class="text-xs text-teal-600 hover:underline">Ver todas</RouterLink>
          </div>
          <div v-if="stats.ultimas_sesiones.length === 0" class="px-5 py-8 text-center text-gray-400 text-sm">
            Sin sesiones registradas
          </div>
          <ul v-else class="divide-y divide-gray-100">
            <li v-for="s in stats.ultimas_sesiones" :key="s.id">
              <RouterLink :to="`/sesiones/${s.id}`" class="px-5 py-3 flex items-center gap-3 hover:bg-gray-50">
                <div class="flex-1 min-w-0">
                  <p class="text-sm font-medium text-gray-900 truncate">{{ s.paciente_nombre }}</p>
                  <p class="text-xs text-gray-400">{{ s.fecha }}</p>
                </div>
                <span class="text-xs px-2 py-0.5 rounded-full font-medium shrink-0" :class="estadoColor[s.estado] || 'bg-gray-100 text-gray-600'">
                  {{ s.estado }}
                </span>
              </RouterLink>
            </li>
          </ul>
        </div>

      </div>
    </template>

  </div>
</template>
