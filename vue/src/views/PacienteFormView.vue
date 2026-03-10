<script setup>
import { ref, onMounted } from 'vue'
import { useRoute, useRouter } from 'vue-router'
import { usePacientesStore } from '@/stores/pacientes'
import { getPatologias } from '@/api/pacientes'

const store  = usePacientesStore()
const route  = useRoute()
const router = useRouter()
const esEditar = !!route.params.id

const form = ref({ nombre: '', tutor: '', telefono: '', email: '', fecha_nacimiento: '', notas: '', activo: true, patologias: [], objetivos_generales: [] })
const error   = ref('')
const loading = ref(false)
const patologiasDisp = ref([])

onMounted(async () => {
  const { data } = await getPatologias()
  patologiasDisp.value = data.data
  if (esEditar) {
    await store.cargarUno(route.params.id)
    const p = store.actual
    form.value = { ...p, activo: !!p.activo, patologias: [...(p.patologias || [])], objetivos_generales: [...(p.objetivos_generales || [])] }
  }
})

function addObj()    { form.value.objetivos_generales.push('') }
function removeObj(i){ form.value.objetivos_generales.splice(i, 1) }

async function guardar() {
  if (!form.value.nombre) { error.value = 'El nombre es requerido'; return }
  loading.value = true
  error.value = ''
  try {
    const datos = { ...form.value, objetivos_generales: form.value.objetivos_generales.filter(o => o.trim()) }
    if (esEditar) {
      await store.editar(route.params.id, datos)
      router.push(`/pacientes/${route.params.id}`)
    } else {
      const nuevo = await store.crear(datos)
      router.push(`/pacientes/${nuevo.id}`)
    }
  } catch(e) {
    error.value = e.response?.data?.message || 'Error al guardar'
  } finally {
    loading.value = false
  }
}
</script>

<template>
  <div class="max-w-2xl mx-auto px-4 sm:px-6 py-6">
    <h1 class="text-2xl font-bold text-gray-900 mb-6">{{ esEditar ? 'Editar paciente' : 'Nuevo paciente' }}</h1>
    <form @submit.prevent="guardar" class="bg-white shadow-sm rounded-xl p-6 space-y-5">
      <div>
        <label class="block text-sm font-medium text-gray-700 mb-1">Nombre *</label>
        <input v-model="form.nombre" type="text" required class="block w-full border border-gray-300 rounded-lg py-2 px-3 text-sm focus:outline-none focus:ring-2 focus:ring-teal-500"/>
      </div>
      <div class="grid grid-cols-2 gap-4">
        <div>
          <label class="block text-sm font-medium text-gray-700 mb-1">Tutor</label>
          <input v-model="form.tutor" type="text" class="block w-full border border-gray-300 rounded-lg py-2 px-3 text-sm focus:outline-none focus:ring-2 focus:ring-teal-500"/>
        </div>
        <div>
          <label class="block text-sm font-medium text-gray-700 mb-1">Teléfono</label>
          <input v-model="form.telefono" type="tel" class="block w-full border border-gray-300 rounded-lg py-2 px-3 text-sm focus:outline-none focus:ring-2 focus:ring-teal-500"/>
        </div>
      </div>
      <div>
        <label class="block text-sm font-medium text-gray-700 mb-1">Email</label>
        <input v-model="form.email" type="email" class="block w-full border border-gray-300 rounded-lg py-2 px-3 text-sm focus:outline-none focus:ring-2 focus:ring-teal-500"/>
      </div>
      <div>
        <label class="block text-sm font-medium text-gray-700 mb-1">Patologías</label>
        <div class="flex flex-wrap gap-2">
          <label v-for="p in patologiasDisp" :key="p" class="flex items-center gap-1 text-sm cursor-pointer">
            <input type="checkbox" :value="p" v-model="form.patologias" class="rounded text-teal-600 focus:ring-teal-500"/>
            {{ p }}
          </label>
        </div>
      </div>
      <div>
        <div class="flex items-center justify-between mb-2">
          <label class="text-sm font-medium text-gray-700">Objetivos generales</label>
          <button type="button" @click="addObj" class="text-xs text-teal-600 hover:text-teal-700">+ Añadir</button>
        </div>
        <div v-for="(obj, i) in form.objetivos_generales" :key="i" class="flex mb-2">
          <input v-model="form.objetivos_generales[i]" type="text" class="flex-1 border border-gray-300 rounded-l-lg py-2 px-3 text-sm focus:outline-none focus:ring-2 focus:ring-teal-500"/>
          <button type="button" @click="removeObj(i)" class="px-3 bg-red-500 text-white rounded-r-lg hover:bg-red-600">✕</button>
        </div>
      </div>
      <div v-if="error" class="text-sm text-red-600 bg-red-50 rounded-lg px-3 py-2">{{ error }}</div>
      <div class="flex gap-3">
        <button type="submit" :disabled="loading" class="px-4 py-2 bg-teal-600 text-white text-sm rounded-lg hover:bg-teal-700 disabled:opacity-60">
          {{ loading ? 'Guardando...' : 'Guardar' }}
        </button>
        <RouterLink :to="esEditar ? `/pacientes/${route.params.id}` : '/pacientes'" class="px-4 py-2 border border-gray-300 text-sm rounded-lg hover:bg-gray-50">
          Cancelar
        </RouterLink>
      </div>
    </form>
  </div>
</template>
