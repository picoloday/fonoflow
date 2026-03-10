<script setup>
import { onMounted } from 'vue'
import { useRoute, useRouter, RouterLink } from 'vue-router'
import { useCitasStore } from '@/stores/citas'

const store  = useCitasStore()
const route  = useRoute()
const router = useRouter()
onMounted(() => store.cargarUna(route.params.id))

async function asistio() {
  const r = await store.asistencia(route.params.id, { asistio: true })
  if (r.sesion_id) router.push(`/sesiones/${r.sesion_id}`)
}
async function ausencia() {
  await store.asistencia(route.params.id, { asistio: false })
  await store.cargarUna(route.params.id)
}
async function cancelar() {
  await store.cancelar(route.params.id)
}
</script>

<template>
  <div class="max-w-2xl mx-auto px-4 sm:px-6 py-6">
    <div v-if="!store.actual" class="animate-pulse">
      <div class="h-8 bg-gray-200 rounded w-48 mb-4"></div>
    </div>
    <div v-else>
      <div class="flex items-center gap-3 mb-6">
        <RouterLink to="/agenda" class="text-gray-400 hover:text-gray-600">
          <svg class="w-5 h-5" fill="none" stroke="currentColor" stroke-width="2" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" d="M15 19l-7-7 7-7"/></svg>
        </RouterLink>
        <div class="flex-1">
          <h1 class="text-xl font-bold text-gray-900">{{ store.actual.paciente?.nombre }}</h1>
          <p class="text-sm text-gray-400">{{ store.actual.fecha }} · {{ store.actual.hora_inicio }} · {{ store.actual.duracion }} min</p>
        </div>
      </div>

      <div class="bg-white shadow-sm rounded-xl p-5 space-y-4">
        <div class="flex items-center gap-2">
          <span class="text-sm text-gray-500">Estado:</span>
          <span class="text-sm font-medium px-2 py-0.5 rounded-full"
            :class="{
              'bg-teal-100 text-teal-700': store.actual.estado === 'programada',
              'bg-green-100 text-green-700': store.actual.estado === 'completada',
              'bg-red-100 text-red-700': store.actual.estado === 'cancelada',
              'bg-gray-100 text-gray-600': store.actual.estado === 'no_asistio',
            }">
            {{ store.actual.estado }}
          </span>
        </div>

        <div v-if="store.actual.estado === 'programada'" class="flex gap-3 pt-2">
          <button @click="asistio" class="px-4 py-2 bg-teal-600 text-white text-sm rounded-lg hover:bg-teal-700">
            Marcar asistencia
          </button>
          <button @click="ausencia" class="px-4 py-2 border border-gray-300 text-sm rounded-lg hover:bg-gray-50">
            No asistió
          </button>
          <button @click="cancelar" class="px-4 py-2 border border-red-200 text-red-600 text-sm rounded-lg hover:bg-red-50">
            Cancelar cita
          </button>
        </div>
      </div>
    </div>
  </div>
</template>
