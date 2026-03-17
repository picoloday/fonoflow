<script setup>
import { ref, computed, onMounted } from 'vue'
import { useRoute, useRouter } from 'vue-router'
import { usePacientesStore } from '@/stores/pacientes'
import { getCatalogo, addCatalogo } from '@/api/catalogo'

const store    = usePacientesStore()
const route    = useRoute()
const router   = useRouter()
const esEditar = !!route.params.id

const PARENTESCOS = ['Madre', 'Padre', 'Abuelo/a', 'Tutor legal', 'Hermano/a', 'Otro']

const DIAS = [
  { n: 1, label: 'L' }, { n: 2, label: 'M' }, { n: 3, label: 'X' },
  { n: 4, label: 'J' }, { n: 5, label: 'V' }, { n: 6, label: 'S' },
]

const horasDisponibles = (() => {
  const slots = []
  for (let h = 15; h < 21; h++)
    for (let m = 0; m < 60; m += 15)
      slots.push(`${String(h).padStart(2,'0')}:${String(m).padStart(2,'0')}`)
  return slots
})()

const form = ref({
  nombre: '', fecha_nacimiento: '',
  tutor: '', parentesco: '', telefono: '', email: '',
  notas: '', activo: true,
  patologias: [], objetivos_generales: [],
  horario: [],  // [{dia:1, hora:'15:00', duracion:30}, ...]
})

function horarioDia(n) {
  return form.value.horario.find(e => e.dia === n) || null
}

function toggleDia(n) {
  const idx = form.value.horario.findIndex(e => e.dia === n)
  if (idx === -1) {
    form.value.horario.push({ dia: n, hora: '', duracion: 30 })
    form.value.horario.sort((a, b) => a.dia - b.dia)
  } else {
    form.value.horario.splice(idx, 1)
  }
}

// Errores de campo individuales
const errores = ref({})
const loading         = ref(false)
const patologiasDisp  = ref([])
const nuevaPatologia  = ref('')
const addingPat       = ref(false)
const errorPat        = ref('')
const submitted       = ref(false)  // sólo mostramos errores tras intentar guardar

// ── Validación ──────────────────────────────────────────────
const reglasEmail    = /^[^\s@]+@[^\s@]+\.[^\s@]{2,}$/
const reglasTelefono = /^[+\d\s\-().]{7,20}$/

function validar() {
  const e = {}
  const f = form.value

  if (!f.nombre.trim())
    e.nombre = 'El nombre completo es obligatorio.'

  if (f.fecha_nacimiento) {
    const hoy = new Date(); hoy.setHours(0,0,0,0)
    const nac = new Date(f.fecha_nacimiento)
    if (nac > hoy)
      e.fecha_nacimiento = 'La fecha de nacimiento no puede ser futura.'
  }

  if (f.email && !reglasEmail.test(f.email.trim()))
    e.email = 'El email no tiene un formato válido.'

  if (f.telefono && !reglasTelefono.test(f.telefono.trim()))
    e.telefono = 'El teléfono solo puede contener dígitos, espacios, +, -, (, ).'

  errores.value = e
  return Object.keys(e).length === 0
}

// Revalidar en tiempo real sólo después del primer intento de guardar
function revalidarCampo() {
  if (submitted.value) validar()
}

// ── Edad calculada ───────────────────────────────────────────
const edad = computed(() => {
  if (!form.value.fecha_nacimiento) return null
  const hoy  = new Date()
  const nac  = new Date(form.value.fecha_nacimiento)
  let años   = hoy.getFullYear() - nac.getFullYear()
  const m    = hoy.getMonth() - nac.getMonth()
  if (m < 0 || (m === 0 && hoy.getDate() < nac.getDate())) años--
  return años >= 0 ? años : null
})

// ── Carga inicial ────────────────────────────────────────────
onMounted(async () => {
  await cargarPatologias()
  if (esEditar) {
    await store.cargarUno(route.params.id)
    const p = store.actual
    form.value = {
      ...p,
      activo:              !!p.activo,
      patologias:          [...(p.patologias || [])],
      objetivos_generales: [...(p.objetivos_generales || [])],
      parentesco:          p.parentesco || '',
      horario:             p.dias_semana ? JSON.parse(p.dias_semana) : [],
    }
  }
})

// ── Patologías ───────────────────────────────────────────────
async function cargarPatologias() {
  const { data } = await getCatalogo('patologias')
  patologiasDisp.value = data.data.map(item =>
    typeof item === 'object' ? item.nombre : item
  )
}

function togglePatologia(p) {
  const idx = form.value.patologias.indexOf(p)
  if (idx === -1) form.value.patologias.push(p)
  else form.value.patologias.splice(idx, 1)
}

async function agregarNuevaPatologia() {
  const nombre = nuevaPatologia.value.trim()
  if (!nombre) return
  if (patologiasDisp.value.some(p => p.toLowerCase() === nombre.toLowerCase())) {
    errorPat.value = 'Esa patología ya existe en el catálogo'
    return
  }
  addingPat.value = true
  errorPat.value  = ''
  try {
    await addCatalogo('patologias', nombre)
    await cargarPatologias()
    if (!form.value.patologias.includes(nombre)) form.value.patologias.push(nombre)
    nuevaPatologia.value = ''
  } catch (e) {
    errorPat.value = e.response?.data?.message || 'Error al añadir'
  } finally {
    addingPat.value = false
  }
}

// ── Objetivos ────────────────────────────────────────────────
function addObj()     { form.value.objetivos_generales.push('') }
function removeObj(i) { form.value.objetivos_generales.splice(i, 1) }

// ── Guardar ──────────────────────────────────────────────────
async function guardar() {
  submitted.value = true
  if (!validar()) return

  loading.value = true
  try {
    const datos = {
      ...form.value,
      objetivos_generales: form.value.objetivos_generales.filter(o => o.trim()),
      horario: form.value.horario.filter(e => e.hora),
    }
    if (esEditar) {
      await store.editar(route.params.id, datos)
      router.push(`/pacientes/${route.params.id}`)
    } else {
      const nuevo = await store.crear(datos)
      router.push(`/pacientes/${nuevo.id}`)
    }
  } catch(e) {
    errores.value.global = e.response?.data?.message || 'Error al guardar'
  } finally {
    loading.value = false
  }
}

// Clases de input según si hay error en ese campo
function inputClass(campo) {
  return errores.value[campo]
    ? 'block w-full border border-red-400 rounded-lg py-2 px-3 text-sm focus:outline-none focus:ring-2 focus:ring-red-400 bg-red-50'
    : 'block w-full border border-gray-300 rounded-lg py-2 px-3 text-sm focus:outline-none focus:ring-2 focus:ring-teal-500'
}
</script>

<template>
  <div class="max-w-2xl mx-auto px-4 sm:px-6 py-6">
    <h1 class="text-2xl font-bold text-gray-900 mb-6">
      {{ esEditar ? 'Editar paciente' : 'Nuevo paciente' }}
    </h1>

    <form @submit.prevent="guardar" novalidate class="space-y-6">

      <!-- DATOS DEL PACIENTE -->
      <section class="bg-white shadow-sm rounded-xl p-6 space-y-4">
        <h2 class="text-sm font-semibold text-gray-500 uppercase tracking-wide">Datos del paciente</h2>

        <div>
          <label class="block text-sm font-medium text-gray-700 mb-1">Nombre completo *</label>
          <input v-model="form.nombre" type="text" @input="revalidarCampo" :class="inputClass('nombre')"/>
          <p v-if="errores.nombre" class="text-xs text-red-600 mt-1">{{ errores.nombre }}</p>
        </div>

        <div class="grid grid-cols-2 gap-4">
          <div>
            <label class="block text-sm font-medium text-gray-700 mb-1">Fecha de nacimiento</label>
            <input v-model="form.fecha_nacimiento" type="date" @change="revalidarCampo"
              :class="inputClass('fecha_nacimiento')"/>
            <p v-if="errores.fecha_nacimiento" class="text-xs text-red-600 mt-1">{{ errores.fecha_nacimiento }}</p>
          </div>
          <div class="flex items-end">
            <div v-if="edad !== null"
              class="w-full flex items-center gap-2 bg-teal-50 border border-teal-200 rounded-lg px-4 py-2">
              <span class="text-2xl font-bold text-teal-600">{{ edad }}</span>
              <span class="text-sm text-teal-700">años</span>
            </div>
            <div v-else class="w-full flex items-center bg-gray-50 border border-dashed border-gray-300 rounded-lg px-4 py-2">
              <span class="text-sm text-gray-400">Edad (automática)</span>
            </div>
          </div>
        </div>
      </section>

      <!-- PATOLOGÍAS -->
      <section class="bg-white shadow-sm rounded-xl p-6 space-y-4">
        <h2 class="text-sm font-semibold text-gray-500 uppercase tracking-wide">Patologías / Condición</h2>

        <div v-if="patologiasDisp.length" class="flex flex-wrap gap-2">
          <button v-for="p in patologiasDisp" :key="p" type="button" @click="togglePatologia(p)"
            :class="[
              'px-3 py-1.5 rounded-full text-sm border transition-colors',
              form.patologias.includes(p)
                ? 'bg-teal-600 text-white border-teal-600'
                : 'bg-white text-gray-700 border-gray-300 hover:border-teal-400'
            ]">
            {{ p }}
          </button>
        </div>
        <p v-else class="text-sm text-gray-400 italic">No hay patologías en el catálogo todavía.</p>

        <div class="pt-2 border-t border-gray-100">
          <label class="block text-xs text-gray-500 mb-1">Nueva patología al catálogo</label>
          <div class="flex gap-2">
            <input v-model="nuevaPatologia" type="text" placeholder="Ej: Dislexia, TEA, Disfemia..."
              @keydown.enter.prevent="agregarNuevaPatologia"
              class="flex-1 border border-gray-300 rounded-lg py-2 px-3 text-sm focus:outline-none focus:ring-2 focus:ring-teal-500"/>
            <button type="button" @click="agregarNuevaPatologia"
              :disabled="!nuevaPatologia.trim() || addingPat"
              class="px-4 py-2 bg-teal-600 text-white text-sm rounded-lg hover:bg-teal-700 disabled:opacity-50">
              {{ addingPat ? '...' : '+ Añadir' }}
            </button>
          </div>
          <p v-if="errorPat" class="text-xs text-red-600 mt-1">{{ errorPat }}</p>
        </div>
      </section>

      <!-- OBJETIVOS GENERALES -->
      <section class="bg-white shadow-sm rounded-xl p-6 space-y-3">
        <div class="flex items-center justify-between">
          <h2 class="text-sm font-semibold text-gray-500 uppercase tracking-wide">Objetivos generales</h2>
          <button type="button" @click="addObj" class="text-xs text-teal-600 hover:text-teal-700 font-medium">
            + Añadir objetivo
          </button>
        </div>
        <div v-for="(_, i) in form.objetivos_generales" :key="i" class="flex gap-2">
          <input v-model="form.objetivos_generales[i]" type="text" placeholder="Objetivo..."
            class="flex-1 border border-gray-300 rounded-lg py-2 px-3 text-sm focus:outline-none focus:ring-2 focus:ring-teal-500"/>
          <button type="button" @click="removeObj(i)"
            class="px-3 py-2 text-red-500 hover:text-red-600 hover:bg-red-50 rounded-lg transition-colors">✕</button>
        </div>
        <p v-if="!form.objetivos_generales.length" class="text-sm text-gray-400 italic">
          Pulsa "Añadir objetivo" para empezar.
        </p>
      </section>

      <!-- DATOS DEL TUTOR -->
      <section class="bg-white shadow-sm rounded-xl p-6 space-y-4">
        <h2 class="text-sm font-semibold text-gray-500 uppercase tracking-wide">Datos del tutor / familiar</h2>

        <div class="grid grid-cols-2 gap-4">
          <div>
            <label class="block text-sm font-medium text-gray-700 mb-1">Nombre del tutor</label>
            <input v-model="form.tutor" type="text" :class="inputClass('tutor')"/>
          </div>
          <div>
            <label class="block text-sm font-medium text-gray-700 mb-1">Parentesco</label>
            <select v-model="form.parentesco"
              class="block w-full border border-gray-300 rounded-lg py-2 px-3 text-sm focus:outline-none focus:ring-2 focus:ring-teal-500">
              <option value="">— Seleccionar —</option>
              <option v-for="p in PARENTESCOS" :key="p" :value="p">{{ p }}</option>
            </select>
          </div>
        </div>

        <div class="grid grid-cols-2 gap-4">
          <div>
            <label class="block text-sm font-medium text-gray-700 mb-1">Email</label>
            <input v-model="form.email" type="text" @input="revalidarCampo" :class="inputClass('email')"
              placeholder="ejemplo@correo.com"/>
            <p v-if="errores.email" class="text-xs text-red-600 mt-1">{{ errores.email }}</p>
          </div>
          <div>
            <label class="block text-sm font-medium text-gray-700 mb-1">Teléfono</label>
            <input v-model="form.telefono" type="text" @input="revalidarCampo" :class="inputClass('telefono')"
              placeholder="+34 600 000 000"/>
            <p v-if="errores.telefono" class="text-xs text-red-600 mt-1">{{ errores.telefono }}</p>
          </div>
        </div>
      </section>

      <!-- HORARIO HABITUAL -->
      <section class="bg-white shadow-sm rounded-xl p-6 space-y-4">
        <div>
          <h2 class="text-sm font-semibold text-gray-500 uppercase tracking-wide">Horario habitual</h2>
          <p class="text-xs text-gray-400 mt-0.5">Cada día puede tener su propia hora y duración.</p>
        </div>

        <!-- Círculos de días -->
        <div class="flex gap-2">
          <button v-for="dia in DIAS" :key="dia.n" type="button" @click="toggleDia(dia.n)"
            :class="['w-10 h-10 rounded-full text-sm font-semibold border-2 transition-colors',
              horarioDia(dia.n)
                ? 'bg-teal-600 text-white border-teal-600'
                : 'bg-white text-gray-600 border-gray-300 hover:border-teal-400']">
            {{ dia.label }}
          </button>
        </div>

        <!-- Hora y duración por día seleccionado -->
        <div v-if="form.horario.length" class="space-y-2">
          <div v-for="entrada in form.horario" :key="entrada.dia"
            class="flex items-center gap-3 bg-gray-50 rounded-lg px-3 py-2">
            <span class="text-sm font-semibold text-teal-700 w-6">
              {{ DIAS.find(d => d.n === entrada.dia)?.label }}
            </span>
            <select v-model="entrada.hora"
              class="border border-gray-300 rounded-lg py-1.5 px-2 text-sm focus:outline-none focus:ring-2 focus:ring-teal-500">
              <option value="">— Hora —</option>
              <option v-for="h in horasDisponibles" :key="h" :value="h">{{ h }}</option>
            </select>
            <select v-model="entrada.duracion"
              class="border border-gray-300 rounded-lg py-1.5 px-2 text-sm focus:outline-none focus:ring-2 focus:ring-teal-500">
              <option :value="30">30 min</option>
              <option :value="45">45 min</option>
              <option :value="60">60 min</option>
            </select>
          </div>
        </div>
        <p v-else class="text-sm text-gray-400 italic">Selecciona uno o varios días.</p>
      </section>

      <!-- NOTAS -->
      <section class="bg-white shadow-sm rounded-xl p-6 space-y-3">
        <h2 class="text-sm font-semibold text-gray-500 uppercase tracking-wide">Notas adicionales</h2>
        <textarea v-model="form.notas" rows="3"
          placeholder="Observaciones, contexto familiar, indicaciones especiales..."
          class="block w-full border border-gray-300 rounded-lg py-2 px-3 text-sm focus:outline-none focus:ring-2 focus:ring-teal-500 resize-none"/>
      </section>

      <!-- ACCIONES -->
      <div v-if="errores.global" class="text-sm text-red-600 bg-red-50 rounded-lg px-4 py-3">
        {{ errores.global }}
      </div>
      <div v-if="submitted && Object.keys(errores).filter(k => k !== 'global').length"
        class="text-sm text-red-600 bg-red-50 rounded-lg px-4 py-3">
        Hay errores en el formulario. Revisa los campos marcados en rojo.
      </div>

      <div class="flex gap-3 pb-6">
        <button type="submit" :disabled="loading"
          class="px-5 py-2 bg-teal-600 text-white text-sm font-medium rounded-lg hover:bg-teal-700 disabled:opacity-60">
          {{ loading ? 'Guardando...' : 'Guardar paciente' }}
        </button>
        <RouterLink :to="esEditar ? `/pacientes/${route.params.id}` : '/pacientes'"
          class="px-5 py-2 border border-gray-300 text-sm rounded-lg hover:bg-gray-50">
          Cancelar
        </RouterLink>
      </div>

    </form>
  </div>
</template>
