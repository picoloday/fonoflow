<script setup>
import { onMounted, computed, ref, watch } from 'vue'
import { useRoute, useRouter, RouterLink } from 'vue-router'
import { usePacientesStore } from '@/stores/pacientes'
import { agendarSesiones } from '@/api/pacientes'
import { formatFecha } from '@/utils/fecha'

const store  = usePacientesStore()
const route  = useRoute()
const router = useRouter()
const confirmandoBorrar = ref(false)
const borrando          = ref(false)

// Agendar mes
const mesAgendar      = ref(new Date().toISOString().slice(0, 7))
const agendando       = ref(false)
const resultadoAgendar = ref(null)

async function agendar() {
  agendando.value = true
  resultadoAgendar.value = null
  try {
    const { data } = await agendarSesiones(store.actual.id, mesAgendar.value)
    resultadoAgendar.value = data.data
    // Recargar historial
    await store.cargarUno(store.actual.id)
  } catch(e) {
    resultadoAgendar.value = { error: e.response?.data?.message || 'Error al agendar' }
  } finally {
    agendando.value = false
  }
}

onMounted(() => store.cargarUno(route.params.id))

async function borrarPaciente() {
  borrando.value = true
  try {
    await store.borrar(store.actual.id)
    router.push('/pacientes')
  } finally {
    borrando.value = false
    confirmandoBorrar.value = false
  }
}

const estadoBadge = {
  programada:   'bg-gray-100 text-gray-600',
  completada:   'bg-green-100 text-green-700',
  cancelada:    'bg-red-100 text-red-700',
  reprogramada: 'bg-amber-100 text-amber-700',
}

const labelEstado = { programada: 'Programada', completada: 'Completada', cancelada: 'No asiste', reprogramada: 'Reprogramada' }

// IDs de sesiones que fueron creadas para recuperar otra cancelada
const idsRecuperacion = computed(() => {
  const ids = new Set()
  for (const s of store.actual?.historial || [])
    if (s.sesion_reprogramada_id) ids.add(Number(s.sesion_reprogramada_id))
  return ids
})

// Agrupar historial por mes
const mesActual = new Date().toISOString().slice(0, 7)
const mesesAbiertos = ref(new Set([mesActual]))

const historialPorMes = computed(() => {
  const grupos = {}
  for (const s of store.actual?.historial || []) {
    const mes = s.fecha.slice(0, 7)
    if (!grupos[mes]) grupos[mes] = []
    grupos[mes].push(s)
  }
  return Object.entries(grupos)
    .sort(([a], [b]) => b.localeCompare(a))
    .map(([mes, sesiones]) => {
      const [y, m] = mes.split('-')
      const label = new Date(y, m - 1).toLocaleString('es', { month: 'long', year: 'numeric' })
      return { mes, label, sesiones }
    })
})

// Abrir el mes más reciente automáticamente cuando carga el historial
watch(historialPorMes, (grupos) => {
  if (grupos.length && !mesesAbiertos.value.size) {
    mesesAbiertos.value = new Set([grupos[0].mes])
  }
}, { immediate: true })

function toggleMes(mes) {
  if (mesesAbiertos.value.has(mes)) {
    mesesAbiertos.value.delete(mes)
  } else {
    mesesAbiertos.value.add(mes)
  }
  mesesAbiertos.value = new Set(mesesAbiertos.value)
}

const nombreMes = (ym) => {
  const [y, m] = ym.split('-')
  return new Date(y, m - 1).toLocaleString('es', { month: 'long', year: 'numeric' })
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
          <!-- Botón borrar con confirmación -->
          <template v-if="!confirmandoBorrar">
            <button @click="confirmandoBorrar = true"
              class="inline-flex items-center px-3 py-1.5 border border-red-300 text-red-600 text-sm rounded-lg hover:bg-red-50 transition-colors">
              Borrar paciente
            </button>
          </template>
          <template v-else>
            <span class="text-sm text-red-600 font-medium">¿Confirmar borrado?</span>
            <button @click="borrarPaciente" :disabled="borrando"
              class="inline-flex items-center px-3 py-1.5 bg-red-600 text-white text-sm rounded-lg hover:bg-red-700 disabled:opacity-60 transition-colors">
              {{ borrando ? 'Borrando...' : 'Sí, borrar' }}
            </button>
            <button @click="confirmandoBorrar = false"
              class="inline-flex items-center px-3 py-1.5 border border-gray-300 text-sm rounded-lg hover:bg-gray-50 transition-colors">
              Cancelar
            </button>
          </template>
        </div>
      </div>

      <div class="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <!-- Info básica -->
        <div class="bg-white shadow-sm rounded-xl p-5 space-y-3">
          <div v-if="store.actual.tutor"><span class="text-sm text-gray-400">Tutor</span><p class="text-sm">{{ store.actual.tutor }}</p></div>
          <div v-if="store.actual.telefono"><span class="text-sm text-gray-400">Teléfono</span><p class="text-sm">{{ store.actual.telefono }}</p></div>
          <div v-if="store.actual.email"><span class="text-sm text-gray-400">Email</span><p class="text-sm">{{ store.actual.email }}</p></div>
          <div v-if="store.actual.patologias?.length">
            <span class="text-sm text-gray-400">Patologías</span>
            <div class="flex flex-wrap gap-1 mt-1">
              <span v-for="p in store.actual.patologias" :key="p" class="text-sm bg-teal-50 text-teal-700 px-2 py-0.5 rounded-full">{{ p }}</span>
            </div>
          </div>

          <!-- Horario habitual -->
          <div v-if="store.actual.dias_semana" class="border-t border-gray-100 pt-3">
            <span class="text-sm text-gray-400">Horario habitual</span>
            <div class="mt-1 space-y-0.5">
              <p v-for="e in JSON.parse(store.actual.dias_semana)" :key="e.dia" class="text-sm">
                {{ ['','Lun','Mar','Mié','Jue','Vie','Sáb'][e.dia] }} · {{ e.hora }} · {{ e.duracion }} min
              </p>
            </div>
          </div>

          <!-- Panel agendar mes -->
          <div class="border-t border-gray-100 pt-3 space-y-2">
            <p class="text-sm font-medium text-gray-500 uppercase tracking-wide">Agendar sesiones</p>
            <div class="flex gap-2 items-center">
              <input type="month" v-model="mesAgendar"
                class="flex-1 border border-gray-300 rounded-lg py-1.5 px-2 text-sm focus:outline-none focus:ring-2 focus:ring-teal-500"/>
              <button @click="agendar" :disabled="agendando || !store.actual.dias_semana"
                class="px-3 py-1.5 bg-teal-600 text-white text-sm font-medium rounded-lg hover:bg-teal-700 disabled:opacity-50 transition-colors whitespace-nowrap">
                {{ agendando ? '...' : 'Agendar' }}
              </button>
            </div>
            <p v-if="!store.actual.dias_semana" class="text-sm text-amber-600">
              Configura el horario habitual editando el paciente.
            </p>
            <!-- Resultado -->
            <div v-if="resultadoAgendar">
              <div v-if="resultadoAgendar.error" class="text-sm text-red-600 bg-red-50 rounded-lg px-3 py-2">
                {{ resultadoAgendar.error }}
              </div>
              <div v-else class="text-sm bg-teal-50 border border-teal-200 rounded-lg px-3 py-2 space-y-1">
                <p class="text-teal-700 font-medium">✓ {{ resultadoAgendar.creadas }} sesiones creadas</p>
                <div v-if="resultadoAgendar.omitidas?.length" class="text-gray-500">
                  <p class="font-medium text-gray-600">Omitidas ({{ resultadoAgendar.omitidas.length }}):</p>
                  <p v-for="o in resultadoAgendar.omitidas" :key="o.fecha">{{ o.fecha }} — {{ o.motivo }}</p>
                </div>
              </div>
            </div>
          </div>
        </div>

        <!-- Historial -->
        <div class="lg:col-span-2 bg-white shadow-sm rounded-xl overflow-hidden">
          <div class="px-5 py-3 border-b bg-gray-50 flex items-center justify-between">
            <h2 class="font-semibold text-sm text-gray-700">Historial de sesiones</h2>
            <span class="text-xs text-gray-400">{{ store.actual.historial?.length || 0 }} sesiones</span>
          </div>

          <div v-if="historialPorMes.length" class="divide-y divide-gray-100">
            <div v-for="grupo in historialPorMes" :key="grupo.mes">

              <!-- Cabecera mes -->
              <button @click="toggleMes(grupo.mes)"
                class="w-full flex items-center justify-between px-5 py-3 hover:bg-gray-50 transition-colors">
                <div class="flex items-center gap-2">
                  <svg class="w-3.5 h-3.5 text-gray-400 transition-transform"
                    :class="mesesAbiertos.has(grupo.mes) ? 'rotate-90' : ''"
                    fill="none" stroke="currentColor" stroke-width="2" viewBox="0 0 24 24">
                    <path stroke-linecap="round" stroke-linejoin="round" d="M9 5l7 7-7 7"/>
                  </svg>
                  <span class="text-sm font-semibold text-gray-700 capitalize">{{ grupo.label }}</span>
                  <span class="text-xs text-gray-400">{{ grupo.sesiones.length }} sesión{{ grupo.sesiones.length !== 1 ? 'es' : '' }}</span>
                </div>
                <span class="text-xs text-gray-400">
                  {{ grupo.sesiones.filter(s => s.estado === 'completada').length }} completadas
                </span>
              </button>

              <!-- Sesiones del mes -->
              <ul v-if="mesesAbiertos.has(grupo.mes)" class="divide-y divide-gray-50 bg-gray-50/30">
                <li v-for="s in grupo.sesiones" :key="s.id">
                  <RouterLink :to="`/sesiones/${s.id}`" class="flex items-start gap-3 px-5 py-3 hover:bg-gray-50 transition-colors">
                    <div class="flex-1 min-w-0">
                      <p class="text-sm font-medium text-gray-900">
                        {{ formatFecha(s.fecha) }}<span v-if="s.hora_inicio" class="text-gray-400 font-normal"> · {{ s.hora_inicio.slice(0,5) }}</span>
                      </p>
                      <p v-if="s.motivo_ausencia" class="text-sm text-red-500 mt-0.5">{{ s.motivo_ausencia }}</p>
                      <div class="flex gap-1.5 mt-1 flex-wrap">
                        <span v-if="s.reprogramar == 1 && s.estado !== 'reprogramada'"
                          class="text-xs px-1.5 py-0.5 bg-amber-50 text-amber-600 rounded border border-amber-200">
                          Pendiente reprogramar
                        </span>
                      </div>
                    </div>
                    <div class="flex items-center gap-2 shrink-0 mt-0.5">
                      <span class="text-sm px-2 py-0.5 rounded-full font-medium"
                        :class="idsRecuperacion.has(s.id)
                          ? 'bg-amber-100 text-amber-700'
                          : estadoBadge[s.estado] || 'bg-gray-100 text-gray-600'">
                        {{ idsRecuperacion.has(s.id) ? 'Recuperada' : (labelEstado[s.estado] || s.estado) }}
                      </span>
                      <svg class="w-4 h-4 text-gray-300" fill="none" stroke="currentColor" stroke-width="2" viewBox="0 0 24 24">
                        <path stroke-linecap="round" stroke-linejoin="round" d="M9 5l7 7-7 7"/>
                      </svg>
                    </div>
                  </RouterLink>
                </li>
              </ul>

            </div>
          </div>

          <div v-else class="px-5 py-8 text-center text-gray-400 text-sm">Sin sesiones</div>
        </div>
      </div>
    </div>
  </div>
</template>
