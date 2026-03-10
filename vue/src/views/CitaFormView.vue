<script setup>
import { ref, onMounted } from 'vue'
import { useRoute, useRouter, RouterLink } from 'vue-router'
import { useCitasStore } from '@/stores/citas'
import { getPacientes } from '@/api/pacientes'
import { getHuecos } from '@/api/citas'

const store  = useCitasStore()
const route  = useRoute()
const router = useRouter()

const pacientes = ref([])
const huecos    = ref([])
const form = ref({
  paciente_id: '',
  fecha: route.query.fecha || new Date().toISOString().slice(0,10),
  hora_inicio: route.query.hora || '',
  duracion: 30,
  precio: 12,
  notas: '',
  objetivos: [],
  actividades: [],
  materiales: [],
})
const error   = ref('')
const loading = ref(false)

onMounted(async () => {
  const { data } = await getPacientes({ activo: 1 })
  pacientes.value = data.data
  if (form.value.fecha) await cargarHuecos()
})

async function cargarHuecos() {
  const { data } = await getHuecos(form.value.fecha)
  huecos.value = data.data
}

async function guardar() {
  error.value = ''
  loading.value = true
  try {
    const nueva = await store.crear(form.value)
    router.push(`/citas/${nueva.id}`)
  } catch(e) {
    error.value = e.response?.data?.message || 'Error al guardar'
  } finally {
    loading.value = false
  }
}
</script>

<template>
  <div class="max-w-2xl mx-auto px-4 sm:px-6 py-6">
    <h1 class="text-2xl font-bold text-gray-900 mb-6">Nueva cita</h1>
    <form @submit.prevent="guardar" class="bg-white shadow-sm rounded-xl p-6 space-y-5">
      <div>
        <label class="block text-sm font-medium text-gray-700 mb-1">Paciente *</label>
        <select v-model="form.paciente_id" required class="block w-full border border-gray-300 rounded-lg py-2 px-3 text-sm focus:outline-none focus:ring-2 focus:ring-teal-500">
          <option value="">Selecciona paciente</option>
          <option v-for="p in pacientes" :key="p.id" :value="p.id">{{ p.nombre }}</option>
        </select>
      </div>
      <div class="grid grid-cols-2 gap-4">
        <div>
          <label class="block text-sm font-medium text-gray-700 mb-1">Fecha *</label>
          <input v-model="form.fecha" @change="cargarHuecos" type="date" required class="block w-full border border-gray-300 rounded-lg py-2 px-3 text-sm focus:outline-none focus:ring-2 focus:ring-teal-500"/>
        </div>
        <div>
          <label class="block text-sm font-medium text-gray-700 mb-1">Hora *</label>
          <select v-model="form.hora_inicio" required class="block w-full border border-gray-300 rounded-lg py-2 px-3 text-sm focus:outline-none focus:ring-2 focus:ring-teal-500">
            <option value="">Selecciona hora</option>
            <option v-for="h in huecos" :key="h.hora" :value="h.hora">{{ h.hora }}</option>
          </select>
        </div>
      </div>
      <div class="grid grid-cols-2 gap-4">
        <div>
          <label class="block text-sm font-medium text-gray-700 mb-1">Duración</label>
          <select v-model="form.duracion" class="block w-full border border-gray-300 rounded-lg py-2 px-3 text-sm focus:outline-none focus:ring-2 focus:ring-teal-500">
            <option :value="30">30 min</option>
            <option :value="45">45 min</option>
            <option :value="60">60 min</option>
          </select>
        </div>
        <div>
          <label class="block text-sm font-medium text-gray-700 mb-1">Precio (€)</label>
          <input v-model="form.precio" type="number" step="0.5" class="block w-full border border-gray-300 rounded-lg py-2 px-3 text-sm focus:outline-none focus:ring-2 focus:ring-teal-500"/>
        </div>
      </div>
      <div v-if="error" class="text-sm text-red-600 bg-red-50 rounded-lg px-3 py-2">{{ error }}</div>
      <div class="flex gap-3">
        <button type="submit" :disabled="loading" class="px-4 py-2 bg-teal-600 text-white text-sm rounded-lg hover:bg-teal-700 disabled:opacity-60">
          {{ loading ? 'Guardando...' : 'Guardar cita' }}
        </button>
        <RouterLink to="/agenda" class="px-4 py-2 border border-gray-300 text-sm rounded-lg hover:bg-gray-50">Cancelar</RouterLink>
      </div>
    </form>
  </div>
</template>
