<script setup>
import { onMounted } from 'vue'
import { useRoute, RouterLink } from 'vue-router'
import { useSesionesStore } from '@/stores/sesiones'

const store = useSesionesStore()
const route = useRoute()
onMounted(() => store.cargarUna(route.params.id))

async function toggle(objId) {
  await store.toggleObjetivo(route.params.id, objId)
}

const progreso = (objetivos) => {
  if (!objetivos?.length) return 0
  return Math.round(objetivos.filter(o => o.cumplido).length / objetivos.length * 100)
}
</script>

<template>
  <div class="max-w-3xl mx-auto px-4 sm:px-6 py-6">
    <div v-if="store.loading" class="animate-pulse space-y-4">
      <div class="h-8 bg-gray-200 rounded w-48"></div>
    </div>
    <div v-else-if="store.actual">
      <div class="flex items-center gap-3 mb-6">
        <RouterLink to="/sesiones" class="text-gray-400 hover:text-gray-600">
          <svg class="w-5 h-5" fill="none" stroke="currentColor" stroke-width="2" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" d="M15 19l-7-7 7-7"/></svg>
        </RouterLink>
        <div>
          <h1 class="text-xl font-bold text-gray-900">Sesión — {{ store.actual.paciente?.nombre }}</h1>
          <p class="text-sm text-gray-400">{{ store.actual.fecha }} {{ store.actual.hora_inicio }}</p>
        </div>
      </div>

      <div class="space-y-5">
        <!-- Objetivos -->
        <div v-if="store.actual.objetivos?.length" class="bg-white shadow-sm rounded-xl overflow-hidden">
          <div class="px-5 py-3 border-b bg-gray-50 flex items-center justify-between">
            <h2 class="font-semibold text-sm text-gray-700">Objetivos</h2>
            <span class="text-xs text-teal-600 font-medium">{{ progreso(store.actual.objetivos) }}%</span>
          </div>
          <div class="px-5 py-2">
            <div class="w-full bg-gray-200 rounded-full h-1.5 mb-3">
              <div class="bg-teal-500 h-1.5 rounded-full transition-all" :style="`width:${progreso(store.actual.objetivos)}%`"></div>
            </div>
          </div>
          <ul class="divide-y divide-gray-100">
            <li v-for="obj in store.actual.objetivos" :key="obj.id" class="flex items-center gap-3 px-5 py-3">
              <button @click="toggle(obj.id)" class="flex-shrink-0 w-5 h-5 rounded-full border-2 flex items-center justify-center transition-colors"
                :class="obj.cumplido ? 'bg-teal-500 border-teal-500' : 'border-gray-300 hover:border-teal-400'">
                <svg v-if="obj.cumplido" class="w-3 h-3 text-white" fill="none" stroke="currentColor" stroke-width="3" viewBox="0 0 24 24">
                  <path stroke-linecap="round" stroke-linejoin="round" d="M5 13l4 4L19 7"/>
                </svg>
              </button>
              <span class="text-sm" :class="obj.cumplido ? 'line-through text-gray-400' : 'text-gray-700'">{{ obj.objetivo }}</span>
            </li>
          </ul>
        </div>

        <!-- Evolutivo -->
        <div v-if="store.actual.evolutivo" class="bg-white shadow-sm rounded-xl p-5">
          <h2 class="font-semibold text-sm text-gray-700 mb-2">Evolutivo</h2>
          <p class="text-sm text-gray-600 whitespace-pre-line">{{ store.actual.evolutivo }}</p>
        </div>

        <!-- Materiales & Actividades -->
        <div class="grid grid-cols-2 gap-4">
          <div v-if="store.actual.materiales?.length" class="bg-white shadow-sm rounded-xl p-5">
            <h2 class="font-semibold text-sm text-gray-700 mb-2">Materiales</h2>
            <ul class="space-y-1">
              <li v-for="m in store.actual.materiales" :key="m" class="text-sm text-gray-600">• {{ m.material }}</li>
            </ul>
          </div>
          <div v-if="store.actual.actividades?.length" class="bg-white shadow-sm rounded-xl p-5">
            <h2 class="font-semibold text-sm text-gray-700 mb-2">Actividades</h2>
            <ul class="space-y-1">
              <li v-for="a in store.actual.actividades" :key="a" class="text-sm text-gray-600">• {{ a.actividad }}</li>
            </ul>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>
