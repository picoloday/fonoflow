<script setup>
import { ref, watch, computed, onMounted } from 'vue'
import { useRouter, useRoute, RouterLink } from 'vue-router'
import { useSesionesStore } from '@/stores/sesiones'
import { getSesion, getInfoPaciente } from '@/api/sesiones'
import { getPacientes } from '@/api/pacientes'
import { getCatalogo, addCatalogo } from '@/api/catalogo'
import { getFestivos } from '@/api/festivos'

const store  = useSesionesStore()
const router = useRouter()
const route  = useRoute()

const esEditar = !!route.params.id

const pacientes     = ref([])
const infoPaciente  = ref(null)
const loadingInfo   = ref(false)
const materiales    = ref([])
const actividades   = ref([])

const form = ref({
  paciente_id:  route.query.paciente ? parseInt(route.query.paciente) : '',
  fecha:        route.query.fecha || new Date().toISOString().slice(0, 10),
  hora_inicio:  route.query.hora  || '',
  duracion:     30,
  objetivos:    [],
  actividades:  [],
  materiales:   [],
})

const error   = ref('')
const loading = ref(false)

// Festivos: cache por año para no repetir llamadas
const festivosCache = {}
const festivoDia = ref('')   // nombre del festivo si la fecha elegida lo es

async function checkFestivo(fecha) {
  if (!fecha) { festivoDia.value = ''; return }
  const año = fecha.slice(0, 4)
  if (!festivosCache[año]) {
    try {
      const { data } = await getFestivos(año)
      const map = {}
      for (const f of data.data.festivos) map[f.fecha] = f.nombre
      festivosCache[año] = map
    } catch { festivosCache[año] = {} }
  }
  festivoDia.value = festivosCache[año][fecha] || ''
}

watch(() => form.value.fecha, checkFestivo, { immediate: true })

// Genera slots según día: sábado 09:00–14:00, resto 15:00–21:00
const horasDisponibles = computed(() => {
  const [y, m, d] = (form.value.fecha || '').split('-').map(Number)
  const esSabado = y ? new Date(y, m - 1, d).getDay() === 6 : false
  const horaIni = esSabado ? 9  : 15
  const horaFin = esSabado ? 14 : 21
  const slots = []
  for (let h = horaIni; h < horaFin; h++) {
    for (let min = 0; min < 60; min += 15) {
      slots.push(`${String(h).padStart(2,'0')}:${String(min).padStart(2,'0')}`)
    }
  }
  return slots
})

const nuevaMaterial  = ref(''); const addingMat = ref(false); const errorMat = ref('')
const nuevaActividad = ref(''); const addingAct = ref(false); const errorAct = ref('')

const titulo = computed(() => esEditar ? 'Editar sesión' : 'Nueva sesión')

onMounted(async () => {
  const [{ data: dp }, { data: dm }, { data: da }] = await Promise.all([
    getPacientes({ activo: 1 }),
    getCatalogo('materiales'),
    getCatalogo('actividades'),
  ])
  pacientes.value   = dp.data
  materiales.value  = dm.data.map(i => typeof i === 'object' ? i.nombre : i)
  actividades.value = da.data.map(i => typeof i === 'object' ? i.nombre : i)

  // Modo edición: cargar datos de la sesión existente
  if (esEditar) {
    const { data } = await getSesion(route.params.id)
    const s = data.data
    form.value = {
      paciente_id: s.paciente_id,
      fecha:       s.fecha,
      hora_inicio: s.hora_inicio ? s.hora_inicio.slice(0, 5) : '',
      duracion:    parseInt(s.duracion),
      precio:      parseFloat(s.precio),
      objetivos:   (s.objetivos || []).map(o => o.objetivo ?? o),
      actividades: s.actividades || [],
      materiales:  s.materiales  || [],
    }
    // Cargar info del paciente para el panel de contexto
    if (s.paciente_id) {
      loadingInfo.value = true
      try {
        const { data: pi } = await getInfoPaciente(s.paciente_id)
        infoPaciente.value = pi.data
      } finally {
        loadingInfo.value = false
      }
    }
  }
})

// Al seleccionar paciente en modo creación → pre-cargar info y objetivos
watch(() => form.value.paciente_id, async (id) => {
  if (esEditar || !id) { if (!id) { infoPaciente.value = null; form.value.objetivos = [] }; return }
  loadingInfo.value = true
  try {
    const { data } = await getInfoPaciente(id)
    infoPaciente.value = data.data
    form.value.objetivos = [...(data.data.objetivos_generales || [])]
  } finally {
    loadingInfo.value = false
  }
})

function toggleItem(lista, item) {
  const idx = lista.indexOf(item)
  if (idx === -1) lista.push(item)
  else lista.splice(idx, 1)
}

async function agregarActividad() {
  const nombre = nuevaActividad.value.trim()
  if (!nombre) return
  if (actividades.value.some(i => i.toLowerCase() === nombre.toLowerCase())) {
    errorAct.value = 'Ya existe en el catálogo'; return
  }
  addingAct.value = true; errorAct.value = ''
  try {
    await addCatalogo('actividades', nombre)
    const { data } = await getCatalogo('actividades')
    actividades.value = data.data.map(i => typeof i === 'object' ? i.nombre : i)
    if (!form.value.actividades.includes(nombre)) form.value.actividades.push(nombre)
    nuevaActividad.value = ''
  } catch (e) {
    errorAct.value = e.response?.data?.message || 'Error al añadir'
  } finally {
    addingAct.value = false
  }
}

async function agregarMaterial() {
  const nombre = nuevaMaterial.value.trim()
  if (!nombre) return
  if (materiales.value.some(i => i.toLowerCase() === nombre.toLowerCase())) {
    errorMat.value = 'Ya existe en el catálogo'; return
  }
  addingMat.value = true; errorMat.value = ''
  try {
    await addCatalogo('materiales', nombre)
    const { data } = await getCatalogo('materiales')
    materiales.value = data.data.map(i => typeof i === 'object' ? i.nombre : i)
    if (!form.value.materiales.includes(nombre)) form.value.materiales.push(nombre)
    nuevaMaterial.value = ''
  } catch (e) {
    errorMat.value = e.response?.data?.message || 'Error al añadir'
  } finally {
    addingMat.value = false
  }
}

async function guardar() {
  if (!form.value.paciente_id) { error.value = 'Selecciona un paciente'; return }
  if (!form.value.fecha)       { error.value = 'La fecha es obligatoria'; return }
  loading.value = true; error.value = ''
  try {
    if (esEditar) {
      await store.editar(route.params.id, form.value)
      router.push(`/sesiones/${route.params.id}`)
    } else {
      await store.crear(form.value)
      // Volver a la agenda en la fecha de la sesión creada
      router.push(`/agenda?fecha=${form.value.fecha}`)
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
    <h1 class="text-2xl font-bold text-gray-900 mb-6">{{ titulo }}</h1>

    <form @submit.prevent="guardar" class="space-y-6">

      <!-- PACIENTE + INFO PANEL -->
      <section class="bg-white shadow-sm rounded-xl p-6 space-y-4">
        <h2 class="text-sm font-semibold text-gray-500 uppercase tracking-wide">Paciente</h2>

        <div>
          <label class="block text-sm font-medium text-gray-700 mb-1">Paciente *</label>
          <select v-model="form.paciente_id" required :disabled="esEditar"
            class="block w-full border border-gray-300 rounded-lg py-2 px-3 text-sm focus:outline-none focus:ring-2 focus:ring-teal-500 disabled:bg-gray-50 disabled:text-gray-500">
            <option value="">— Selecciona paciente —</option>
            <option v-for="p in pacientes" :key="p.id" :value="p.id">{{ p.nombre }}</option>
          </select>
          <p v-if="esEditar" class="text-sm text-gray-400 mt-1">El paciente no se puede cambiar al editar.</p>
        </div>

        <!-- Panel info paciente -->
        <div v-if="loadingInfo" class="text-sm text-gray-400 italic">Cargando datos del paciente...</div>
        <div v-if="infoPaciente && !loadingInfo"
          class="bg-teal-50 border border-teal-200 rounded-xl p-4 space-y-3 text-sm">
          <div v-if="infoPaciente.patologias?.length">
            <span class="font-medium text-teal-800">Condición:</span>
            <span class="ml-1 text-teal-700">{{ infoPaciente.patologias.join(', ') }}</span>
          </div>
          <div v-if="infoPaciente.objetivos_generales?.length">
            <p class="font-medium text-teal-800 mb-1">Objetivos generales:</p>
            <ul class="list-disc list-inside text-teal-700 space-y-0.5">
              <li v-for="o in infoPaciente.objetivos_generales" :key="o">{{ o }}</li>
            </ul>
          </div>
          <div v-if="infoPaciente.ultima_sesion" class="border-t border-teal-200 pt-3">
            <p class="font-medium text-teal-800 mb-1">
              Última sesión: <span class="font-normal">{{ infoPaciente.ultima_sesion.fecha }}</span>
            </p>
            <div v-if="infoPaciente.ultima_sesion.objetivos?.length">
              <div class="flex flex-wrap gap-1 mt-1">
                <span v-for="o in infoPaciente.ultima_sesion.objetivos" :key="o.id || o.objetivo"
                  :class="['text-sm px-2 py-0.5 rounded-full',
                    o.cumplido ? 'bg-green-100 text-green-700' : 'bg-gray-100 text-gray-600']">
                  {{ o.objetivo || o }}<span v-if="o.cumplido"> ✓</span>
                </span>
              </div>
            </div>
          </div>
          <p v-else class="text-teal-600 text-sm italic">Sin sesiones anteriores registradas.</p>
        </div>
      </section>

      <!-- FECHA, HORA Y DURACIÓN -->
      <section class="bg-white shadow-sm rounded-xl p-6 space-y-4">
        <h2 class="text-sm font-semibold text-gray-500 uppercase tracking-wide">Fecha y duración</h2>
        <div v-if="festivoDia" class="flex items-center gap-2 px-4 py-2.5 bg-red-50 border border-red-200 rounded-lg text-sm text-red-700">
          <svg class="w-4 h-4 shrink-0" fill="none" stroke="currentColor" stroke-width="2" viewBox="0 0 24 24">
            <path stroke-linecap="round" stroke-linejoin="round" d="M12 9v2m0 4h.01M10.29 3.86L1.82 18a2 2 0 001.71 3h16.94a2 2 0 001.71-3L13.71 3.86a2 2 0 00-3.42 0z"/>
          </svg>
          <span><strong>Día festivo:</strong> {{ festivoDia }} — no se recomienda agendar sesiones este día.</span>
        </div>
        <div class="grid grid-cols-3 gap-4">
          <div>
            <label class="block text-sm font-medium text-gray-700 mb-1">Fecha *</label>
            <input v-model="form.fecha" type="date" required
              class="block w-full border border-gray-300 rounded-lg py-2 px-3 text-sm focus:outline-none focus:ring-2 focus:ring-teal-500"/>
          </div>
          <div>
            <label class="block text-sm font-medium text-gray-700 mb-1">Hora</label>
            <select v-model="form.hora_inicio"
              class="block w-full border border-gray-300 rounded-lg py-2 px-3 text-sm focus:outline-none focus:ring-2 focus:ring-teal-500">
              <option value="">— Hora —</option>
              <option v-for="h in horasDisponibles" :key="h" :value="h">{{ h }}</option>
            </select>
          </div>
          <div>
            <label class="block text-sm font-medium text-gray-700 mb-1">Duración</label>
            <select v-model="form.duracion"
              class="block w-full border border-gray-300 rounded-lg py-2 px-3 text-sm focus:outline-none focus:ring-2 focus:ring-teal-500">
              <option :value="30">30 min</option>
              <option :value="45">45 min</option>
              <option :value="60">60 min</option>
            </select>
          </div>
        </div>
      </section>

      <!-- OBJETIVOS -->
      <section class="bg-white shadow-sm rounded-xl p-6 space-y-3">
        <div class="flex items-center justify-between">
          <h2 class="text-sm font-semibold text-gray-500 uppercase tracking-wide">Objetivos de la sesión</h2>
          <button type="button" @click="form.objetivos.push('')"
            class="text-sm text-teal-600 hover:text-teal-700 font-medium">+ Añadir</button>
        </div>
        <p class="text-sm text-gray-400">Se marcarán como conseguidos al completar la sesión.</p>
        <div class="space-y-2">
          <div v-for="(_, i) in form.objetivos" :key="i" class="flex gap-2">
            <input v-model="form.objetivos[i]" type="text" placeholder="Objetivo..."
              class="flex-1 border border-gray-300 rounded-lg py-2 px-3 text-sm focus:outline-none focus:ring-2 focus:ring-teal-500"/>
            <button type="button" @click="form.objetivos.splice(i, 1)"
              class="px-3 py-2 text-red-500 hover:bg-red-50 rounded-lg transition-colors">✕</button>
          </div>
        </div>
        <p v-if="!form.objetivos.length" class="text-sm text-gray-400 italic">Sin objetivos definidos todavía.</p>
      </section>

      <!-- ACTIVIDADES -->
      <section class="bg-white shadow-sm rounded-xl p-6 space-y-4">
        <h2 class="text-sm font-semibold text-gray-500 uppercase tracking-wide">Actividades a realizar</h2>
        <div v-if="actividades.length" class="flex flex-wrap gap-2">
          <button v-for="a in actividades" :key="a" type="button"
            @click="toggleItem(form.actividades, a)"
            :class="['px-3 py-1.5 rounded-full text-sm border transition-colors',
              form.actividades.includes(a)
                ? 'bg-teal-600 text-white border-teal-600'
                : 'bg-white text-gray-700 border-gray-300 hover:border-teal-400']">
            {{ a }}
          </button>
        </div>
        <p v-else class="text-sm text-gray-400 italic">No hay actividades en el catálogo todavía.</p>
        <div class="pt-2 border-t border-gray-100">
          <label class="block text-sm text-gray-500 mb-1">Nueva actividad al catálogo</label>
          <div class="flex gap-2">
            <input v-model="nuevaActividad" type="text" placeholder="Ej: Lectura guiada..."
              @keydown.enter.prevent="agregarActividad()"
              class="flex-1 border border-gray-300 rounded-lg py-2 px-3 text-sm focus:outline-none focus:ring-2 focus:ring-teal-500"/>
            <button type="button" @click="agregarActividad()"
              :disabled="!nuevaActividad.trim() || addingAct"
              class="px-4 py-2 bg-teal-600 text-white text-sm rounded-lg hover:bg-teal-700 disabled:opacity-50">
              {{ addingAct ? '...' : '+ Añadir' }}
            </button>
          </div>
          <p v-if="errorAct" class="text-sm text-red-600 mt-1">{{ errorAct }}</p>
        </div>
      </section>

      <!-- MATERIALES -->
      <section class="bg-white shadow-sm rounded-xl p-6 space-y-4">
        <h2 class="text-sm font-semibold text-gray-500 uppercase tracking-wide">Materiales</h2>
        <div v-if="materiales.length" class="flex flex-wrap gap-2">
          <button v-for="m in materiales" :key="m" type="button"
            @click="toggleItem(form.materiales, m)"
            :class="['px-3 py-1.5 rounded-full text-sm border transition-colors',
              form.materiales.includes(m)
                ? 'bg-indigo-600 text-white border-indigo-600'
                : 'bg-white text-gray-700 border-gray-300 hover:border-indigo-400']">
            {{ m }}
          </button>
        </div>
        <p v-else class="text-sm text-gray-400 italic">No hay materiales en el catálogo todavía.</p>
        <div class="pt-2 border-t border-gray-100">
          <label class="block text-sm text-gray-500 mb-1">Nuevo material al catálogo</label>
          <div class="flex gap-2">
            <input v-model="nuevaMaterial" type="text" placeholder="Ej: Tarjetas de vocabulario..."
              @keydown.enter.prevent="agregarMaterial()"
              class="flex-1 border border-gray-300 rounded-lg py-2 px-3 text-sm focus:outline-none focus:ring-2 focus:ring-teal-500"/>
            <button type="button" @click="agregarMaterial()"
              :disabled="!nuevaMaterial.trim() || addingMat"
              class="px-4 py-2 bg-indigo-600 text-white text-sm rounded-lg hover:bg-indigo-700 disabled:opacity-50">
              {{ addingMat ? '...' : '+ Añadir' }}
            </button>
          </div>
          <p v-if="errorMat" class="text-sm text-red-600 mt-1">{{ errorMat }}</p>
        </div>
      </section>

      <!-- ACCIONES -->
      <div v-if="error" class="text-sm text-red-600 bg-red-50 rounded-lg px-4 py-3">{{ error }}</div>
      <div class="flex gap-3 pb-6">
        <button type="submit" :disabled="loading"
          class="px-5 py-2 bg-teal-600 text-white text-sm font-medium rounded-lg hover:bg-teal-700 disabled:opacity-60">
          {{ loading ? 'Guardando...' : (esEditar ? 'Guardar cambios' : 'Programar sesión') }}
        </button>
        <RouterLink :to="esEditar ? `/sesiones/${route.params.id}` : '/sesiones'"
          class="px-5 py-2 border border-gray-300 text-sm rounded-lg hover:bg-gray-50">
          Cancelar
        </RouterLink>
      </div>

    </form>
  </div>
</template>
