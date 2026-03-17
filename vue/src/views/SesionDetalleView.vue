<script setup>
import { ref, computed, onMounted, watch } from 'vue'
import { useRoute, RouterLink } from 'vue-router'
import { useSesionesStore } from '@/stores/sesiones'

const store = useSesionesStore()
const route = useRoute()

// ── estado local del panel de completar ──────────────────────
const modo           = ref(null)   // 'asistio' | 'ausente' | null
const evolutivo      = ref('')
const observaciones  = ref('')
const motivoAusencia = ref('')
const reprogramar    = ref(false)
const guardando      = ref(false)
const errorMsg       = ref('')

onMounted(() => store.cargarUna(route.params.id))
watch(() => route.params.id, (id) => { if (id) store.cargarUna(id) })

const sesion = computed(() => store.actual)

const progreso = computed(() => {
  const objs = sesion.value?.objetivos
  if (!objs?.length) return 0
  return Math.round(objs.filter(o => o.cumplido).length / objs.length * 100)
})

const estadoBadge = computed(() => {
  const e = sesion.value?.estado
  if (e === 'completada')   return { text: 'Completada',   cls: 'bg-green-100 text-green-700' }
  if (e === 'cancelada')    return { text: 'No asiste',    cls: 'bg-red-100 text-red-700' }
  if (e === 'reprogramada') return { text: 'Reprogramada', cls: 'bg-amber-100 text-amber-700' }
  return { text: 'Programada', cls: 'bg-teal-100 text-teal-700' }
})

async function toggle(objId) {
  await store.toggleObjetivo(route.params.id, objId)
}

async function guardarCompletar() {
  errorMsg.value = ''
  guardando.value = true
  try {
    if (modo.value === 'asistio') {
      await store.completar(route.params.id, {
        asistio:       true,
        evolutivo:     evolutivo.value,
        observaciones: observaciones.value,
      })
    } else {
      if (!motivoAusencia.value.trim()) {
        errorMsg.value = 'Indica el motivo de la ausencia'
        return
      }
      await store.completar(route.params.id, {
        asistio:         false,
        motivo_ausencia: motivoAusencia.value.trim(),
        reprogramar:     reprogramar.value,
      })
    }
    modo.value = null
  } catch(e) {
    errorMsg.value = e.response?.data?.message || 'Error al guardar'
  } finally {
    guardando.value = false
  }
}
</script>

<template>
  <div class="max-w-3xl mx-auto px-4 sm:px-6 py-6">

    <!-- Skeleton -->
    <div v-if="store.loading" class="animate-pulse space-y-4">
      <div class="h-8 bg-gray-200 rounded w-64"></div>
      <div class="h-40 bg-gray-100 rounded-xl"></div>
    </div>

    <div v-else-if="sesion">

      <!-- Cabecera -->
      <div class="flex items-start gap-3 mb-6">
        <RouterLink to="/sesiones" class="mt-1 text-gray-400 hover:text-gray-600 flex-shrink-0">
          <svg class="w-5 h-5" fill="none" stroke="currentColor" stroke-width="2" viewBox="0 0 24 24">
            <path stroke-linecap="round" stroke-linejoin="round" d="M15 19l-7-7 7-7"/>
          </svg>
        </RouterLink>
        <div class="flex-1 min-w-0">
          <div class="flex items-center gap-2 flex-wrap">
            <RouterLink
              :to="`/pacientes/${sesion.paciente_real_id || sesion.paciente_id}`"
              class="text-xl font-bold text-gray-900 hover:text-teal-600 transition-colors"
            >{{ sesion.paciente?.nombre || sesion.paciente_nombre }}</RouterLink>
            <span :class="['text-xs font-medium px-2.5 py-0.5 rounded-full', estadoBadge.cls]">
              {{ estadoBadge.text }}
            </span>
            <RouterLink v-if="sesion.estado === 'programada'"
              :to="`/sesiones/${sesion.id}/editar`"
              class="ml-auto text-xs px-3 py-1 border border-gray-300 rounded-lg text-gray-600 hover:bg-gray-50 flex items-center gap-1">
              <svg class="w-3.5 h-3.5" fill="none" stroke="currentColor" stroke-width="2" viewBox="0 0 24 24">
                <path stroke-linecap="round" stroke-linejoin="round" d="M15.232 5.232l3.536 3.536M9 13l6.586-6.586a2 2 0 112.828 2.828L11.828 15.828a2 2 0 01-1.414.586H9v-2a2 2 0 01.586-1.414z"/>
              </svg>
              Editar
            </RouterLink>
          </div>
          <p class="text-sm text-gray-500 mt-0.5">
            {{ sesion.fecha }}
            <span v-if="sesion.hora_inicio"> · {{ sesion.hora_inicio?.slice(0,5) }}</span>
            · {{ sesion.duracion }} min
            <span v-if="sesion.precio"> · {{ sesion.precio }}€</span>
          </p>
        </div>
      </div>

      <div class="space-y-5">

        <!-- ── Objetivos planificados (solo lectura cuando está programada) ── -->
        <div v-if="sesion.objetivos?.length && sesion.estado === 'programada'"
          class="bg-white shadow-sm rounded-xl overflow-hidden">
          <div class="px-5 py-3 border-b bg-gray-50">
            <h2 class="font-semibold text-sm text-gray-700">Objetivos planificados</h2>
            <p class="text-xs text-gray-400 mt-0.5">Se marcarán como conseguidos al completar la sesión</p>
          </div>
          <ul class="divide-y divide-gray-100">
            <li v-for="obj in sesion.objetivos" :key="obj.id"
              class="flex items-center gap-3 px-5 py-3">
              <span class="flex-shrink-0 w-5 h-5 rounded-full border-2 border-gray-200 bg-gray-50"></span>
              <span class="text-sm text-gray-600">{{ obj.objetivo }}</span>
            </li>
          </ul>
        </div>

        <!-- ── Objetivos con resultados (cuando ya está completada) ── -->
        <div v-if="sesion.objetivos?.length && sesion.estado === 'completada'"
          class="bg-white shadow-sm rounded-xl overflow-hidden">
          <div class="px-5 py-3 border-b bg-gray-50 flex items-center justify-between">
            <h2 class="font-semibold text-sm text-gray-700">Objetivos</h2>
            <span class="text-xs text-teal-600 font-medium">{{ progreso }}%</span>
          </div>
          <div class="px-5 pt-3 pb-1">
            <div class="w-full bg-gray-200 rounded-full h-1.5">
              <div class="bg-teal-500 h-1.5 rounded-full transition-all" :style="`width:${progreso}%`"></div>
            </div>
          </div>
          <ul class="divide-y divide-gray-100">
            <li v-for="obj in sesion.objetivos" :key="obj.id"
              class="flex items-center gap-3 px-5 py-3">
              <span class="flex-shrink-0 w-5 h-5 rounded-full border-2 flex items-center justify-center"
                :class="obj.cumplido ? 'bg-teal-500 border-teal-500' : 'border-gray-300 bg-white'">
                <svg v-if="obj.cumplido" class="w-3 h-3 text-white" fill="none" stroke="currentColor" stroke-width="3" viewBox="0 0 24 24">
                  <path stroke-linecap="round" stroke-linejoin="round" d="M5 13l4 4L19 7"/>
                </svg>
              </span>
              <span class="text-sm" :class="obj.cumplido ? 'text-gray-500 line-through' : 'text-gray-700'">
                {{ obj.objetivo }}
              </span>
              <span v-if="!obj.cumplido" class="ml-auto text-xs text-gray-400">No conseguido</span>
            </li>
          </ul>
        </div>

        <!-- ── Actividades y materiales ── -->
        <div class="grid grid-cols-2 gap-4">
          <div v-if="sesion.actividades?.length" class="bg-white shadow-sm rounded-xl p-5">
            <h2 class="font-semibold text-sm text-gray-700 mb-2">Actividades</h2>
            <div class="flex flex-wrap gap-1.5">
              <span v-for="a in sesion.actividades" :key="a"
                class="text-xs px-2.5 py-1 bg-teal-50 text-teal-700 rounded-full border border-teal-200">{{ a }}</span>
            </div>
          </div>
          <div v-if="sesion.materiales?.length" class="bg-white shadow-sm rounded-xl p-5">
            <h2 class="font-semibold text-sm text-gray-700 mb-2">Materiales</h2>
            <div class="flex flex-wrap gap-1.5">
              <span v-for="m in sesion.materiales" :key="m"
                class="text-xs px-2.5 py-1 bg-indigo-50 text-indigo-700 rounded-full border border-indigo-200">{{ m }}</span>
            </div>
          </div>
        </div>

        <!-- ── COMPLETADA: notas clínicas ── -->
        <div v-if="sesion.estado === 'completada'" class="bg-white shadow-sm rounded-xl p-5 space-y-3">
          <h2 class="font-semibold text-sm text-gray-700">Notas clínicas</h2>
          <div v-if="sesion.evolutivo">
            <p class="text-xs text-gray-500 mb-1">Evolutivo</p>
            <p class="text-sm text-gray-700 whitespace-pre-line">{{ sesion.evolutivo }}</p>
          </div>
          <div v-if="sesion.observaciones">
            <p class="text-xs text-gray-500 mb-1">Observaciones</p>
            <p class="text-sm text-gray-700 whitespace-pre-line">{{ sesion.observaciones }}</p>
          </div>
          <p v-if="!sesion.evolutivo && !sesion.observaciones" class="text-sm text-gray-400 italic">
            Sin notas registradas.
          </p>
        </div>

        <!-- ── NO ASISTE: info ausencia ── -->
        <div v-if="sesion.estado === 'cancelada'"
          class="bg-red-50 border border-red-200 rounded-xl p-5 space-y-2">
          <h2 class="font-semibold text-sm text-red-700">No asistió · Ausencia registrada</h2>
          <p v-if="sesion.motivo_ausencia" class="text-sm text-red-600">
            <span class="font-medium">Motivo:</span> {{ sesion.motivo_ausencia }}
          </p>
          <span v-if="sesion.reprogramar"
            class="inline-flex items-center gap-1 text-xs px-2.5 py-1 bg-amber-100 text-amber-700 rounded-full border border-amber-300">
            <svg class="w-3 h-3" fill="none" stroke="currentColor" stroke-width="2" viewBox="0 0 24 24">
              <path stroke-linecap="round" stroke-linejoin="round" d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15"/>
            </svg>
            Pendiente de reprogramar
          </span>
          <span v-else class="text-xs text-gray-500 italic">No se reprogramará</span>
        </div>

        <!-- ── REPROGRAMADA: link a la nueva sesión ── -->
        <div v-if="sesion.estado === 'reprogramada'"
          class="bg-amber-50 border border-amber-200 rounded-xl p-5 space-y-2">
          <h2 class="font-semibold text-sm text-amber-700">Sesión reprogramada · Ausencia registrada</h2>
          <p v-if="sesion.motivo_ausencia" class="text-sm text-amber-600">
            <span class="font-medium">Motivo:</span> {{ sesion.motivo_ausencia }}
          </p>
          <RouterLink v-if="sesion.sesion_reprogramada"
            :to="`/sesiones/${sesion.sesion_reprogramada.id}`"
            class="inline-flex items-center gap-1.5 text-xs px-2.5 py-1 bg-white text-teal-700 rounded-full border border-teal-300 hover:bg-teal-50 transition-colors">
            <svg class="w-3 h-3" fill="none" stroke="currentColor" stroke-width="2" viewBox="0 0 24 24">
              <path stroke-linecap="round" stroke-linejoin="round" d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z"/>
            </svg>
            Nueva sesión: {{ sesion.sesion_reprogramada.fecha }}<span v-if="sesion.sesion_reprogramada.hora_inicio"> a las {{ sesion.sesion_reprogramada.hora_inicio.slice(0,5) }}</span>
          </RouterLink>
        </div>

        <!-- ── PROGRAMADA: panel completar ── -->
        <div v-if="sesion.estado === 'programada'"
          class="bg-white shadow-sm rounded-xl overflow-hidden">
          <div class="px-5 py-3 bg-blue-50 border-b border-blue-100">
            <h2 class="font-semibold text-sm text-blue-800">Completar sesión</h2>
            <p class="text-xs text-blue-600 mt-0.5">¿Cómo fue la sesión?</p>
          </div>

          <!-- Selector -->
          <div v-if="!modo" class="p-5 flex gap-3">
            <button @click="modo = 'asistio'"
              class="flex-1 flex flex-col items-center gap-2 py-4 border-2 border-teal-300 bg-teal-50 text-teal-700 rounded-xl hover:bg-teal-100 transition-colors">
              <svg class="w-8 h-8" fill="none" stroke="currentColor" stroke-width="1.5" viewBox="0 0 24 24">
                <path stroke-linecap="round" stroke-linejoin="round" d="M9 12.75L11.25 15 15 9.75M21 12a9 9 0 11-18 0 9 9 0 0118 0z"/>
              </svg>
              <span class="text-sm font-medium">El paciente asistió</span>
            </button>
            <button @click="modo = 'ausente'"
              class="flex-1 flex flex-col items-center gap-2 py-4 border-2 border-red-200 bg-red-50 text-red-600 rounded-xl hover:bg-red-100 transition-colors">
              <svg class="w-8 h-8" fill="none" stroke="currentColor" stroke-width="1.5" viewBox="0 0 24 24">
                <path stroke-linecap="round" stroke-linejoin="round" d="M9.75 9.75l4.5 4.5m0-4.5l-4.5 4.5M21 12a9 9 0 11-18 0 9 9 0 0118 0z"/>
              </svg>
              <span class="text-sm font-medium">No asistió</span>
            </button>
          </div>

          <!-- Formulario asistió: objetivos + notas -->
          <div v-if="modo === 'asistio'" class="p-5 space-y-5">
            <div class="flex items-center gap-2">
              <button @click="modo = null" class="text-gray-400 hover:text-gray-600">
                <svg class="w-4 h-4" fill="none" stroke="currentColor" stroke-width="2" viewBox="0 0 24 24">
                  <path stroke-linecap="round" stroke-linejoin="round" d="M15 19l-7-7 7-7"/>
                </svg>
              </button>
              <span class="text-sm font-medium text-teal-700">El paciente asistió</span>
            </div>

            <!-- Objetivos con toggle -->
            <div v-if="sesion.objetivos?.length">
              <p class="text-sm font-medium text-gray-700 mb-2">¿Qué objetivos se consiguieron?</p>
              <ul class="space-y-1 rounded-xl border border-gray-200 divide-y divide-gray-100 overflow-hidden">
                <li v-for="obj in sesion.objetivos" :key="obj.id"
                  class="flex items-center gap-3 px-4 py-3 cursor-pointer hover:bg-gray-50 transition-colors"
                  @click="toggle(obj.id)">
                  <span class="flex-shrink-0 w-5 h-5 rounded-full border-2 flex items-center justify-center transition-colors"
                    :class="obj.cumplido ? 'bg-teal-500 border-teal-500' : 'border-gray-300'">
                    <svg v-if="obj.cumplido" class="w-3 h-3 text-white" fill="none" stroke="currentColor" stroke-width="3" viewBox="0 0 24 24">
                      <path stroke-linecap="round" stroke-linejoin="round" d="M5 13l4 4L19 7"/>
                    </svg>
                  </span>
                  <span class="text-sm flex-1"
                    :class="obj.cumplido ? 'text-gray-400 line-through' : 'text-gray-700'">
                    {{ obj.objetivo }}
                  </span>
                  <span class="text-xs" :class="obj.cumplido ? 'text-teal-600 font-medium' : 'text-gray-400'">
                    {{ obj.cumplido ? '✓ Conseguido' : 'Pulsa para marcar' }}
                  </span>
                </li>
              </ul>
            </div>

            <!-- Notas clínicas -->
            <div>
              <label class="block text-sm font-medium text-gray-700 mb-1">Evolutivo / observaciones clínicas</label>
              <textarea v-model="evolutivo" rows="4"
                placeholder="Evolución observada, comportamiento, aspectos a destacar..."
                class="block w-full border border-gray-300 rounded-lg py-2 px-3 text-sm focus:outline-none focus:ring-2 focus:ring-teal-500 resize-none"/>
            </div>
            <div>
              <label class="block text-sm font-medium text-gray-700 mb-1">Notas adicionales</label>
              <textarea v-model="observaciones" rows="2"
                placeholder="Comunicaciones con la familia, notas internas..."
                class="block w-full border border-gray-300 rounded-lg py-2 px-3 text-sm focus:outline-none focus:ring-2 focus:ring-teal-500 resize-none"/>
            </div>

            <div v-if="errorMsg" class="text-sm text-red-600 bg-red-50 rounded-lg px-3 py-2">{{ errorMsg }}</div>
            <button @click="guardarCompletar" :disabled="guardando"
              class="px-5 py-2 bg-teal-600 text-white text-sm font-medium rounded-lg hover:bg-teal-700 disabled:opacity-60">
              {{ guardando ? 'Guardando...' : 'Guardar sesión completada' }}
            </button>
          </div>

          <!-- Formulario no asistió -->
          <div v-if="modo === 'ausente'" class="p-5 space-y-4">
            <div class="flex items-center gap-2">
              <button @click="modo = null" class="text-gray-400 hover:text-gray-600">
                <svg class="w-4 h-4" fill="none" stroke="currentColor" stroke-width="2" viewBox="0 0 24 24">
                  <path stroke-linecap="round" stroke-linejoin="round" d="M15 19l-7-7 7-7"/>
                </svg>
              </button>
              <span class="text-sm font-medium text-red-600">El paciente no asistió</span>
            </div>
            <div>
              <label class="block text-sm font-medium text-gray-700 mb-1">Motivo de la ausencia *</label>
              <input v-model="motivoAusencia" type="text"
                placeholder="Enfermedad, tráfico, se olvidó..."
                class="block w-full border border-gray-300 rounded-lg py-2 px-3 text-sm focus:outline-none focus:ring-2 focus:ring-red-400"/>
            </div>
            <label class="flex items-center gap-3 cursor-pointer select-none">
              <input v-model="reprogramar" type="checkbox"
                class="w-4 h-4 rounded border-gray-300 text-amber-500 focus:ring-amber-400"/>
              <span class="text-sm text-gray-700">Reprogramar esta sesión</span>
            </label>
            <div v-if="errorMsg" class="text-sm text-red-600 bg-red-50 rounded-lg px-3 py-2">{{ errorMsg }}</div>
            <button @click="guardarCompletar" :disabled="guardando"
              class="px-5 py-2 bg-red-600 text-white text-sm font-medium rounded-lg hover:bg-red-700 disabled:opacity-60">
              {{ guardando ? 'Guardando...' : 'Registrar ausencia' }}
            </button>
          </div>
        </div>

      </div><!-- /space-y-5 -->
    </div>

  </div>
</template>
