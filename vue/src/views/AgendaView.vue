<script setup>
import { ref, computed, onMounted, watch } from 'vue'
import { RouterLink, useRoute, useRouter } from 'vue-router'
import { useCitasStore } from '@/stores/citas'

const store  = useCitasStore()
const route  = useRoute()
const router = useRouter()

const hoy   = new Date().toISOString().slice(0, 10)
const fecha = ref(route.query.fecha || hoy)
const mes   = computed(() => fecha.value.slice(0, 7))

onMounted(() => cargar())
watch(fecha, () => {
  router.replace({ query: { fecha: fecha.value } })
  cargar()
})

async function cargar() {
  await store.cargarAgenda({ fecha: fecha.value, mes: mes.value })
}

const agenda = computed(() => store.agenda)

// slots llega como array plano ordenado por _hora; agrupa por hora para mostrar juntas
const sesionesDelDia = computed(() => {
  const slots = agenda.value?.slots
  if (!slots) return []
  let items
  if (!Array.isArray(slots)) {
    items = Object.entries(slots)
      .filter(([, c]) => c && c.paciente_nombre)
      .sort(([a], [b]) => a.localeCompare(b))
      .map(([hora, cita]) => ({ hora, cita }))
  } else {
    items = slots
      .filter(s => s && s.paciente_nombre)
      .map(s => ({ hora: s._hora, cita: s }))
  }
  // Agrupar por hora
  const grupos = []
  const idx = {}
  for (const { hora, cita } of items) {
    if (idx[hora] === undefined) {
      idx[hora] = grupos.length
      grupos.push({ hora, citas: [] })
    }
    grupos[idx[hora]].citas.push(cita)
  }
  return grupos
})

function cardColor(cita) {
  // Si es recuperación pero no completada → amber; completada recuperación → verde
  if (cita._recuperacion && cita.estado !== 'completada') return 'border-l-4 border-amber-400 bg-amber-50'
  const map = {
    programada:   'border-l-4 border-blue-500 bg-blue-50',
    completada:   'border-l-4 border-green-500 bg-green-50',
    cancelada:    'border-l-4 border-red-400 bg-red-50',
    reprogramada: 'border-l-4 border-amber-400 bg-amber-50',
    no_asistio:   'border-l-4 border-gray-400 bg-gray-50',
  }
  return map[cita.estado] || 'border-l-4 border-gray-300 bg-gray-50'
}

function badgeColor(cita) {
  const map = {
    programada:   'bg-blue-100 text-blue-700',
    completada:   'bg-green-100 text-green-700',
    cancelada:    'bg-red-100 text-red-700',
    reprogramada: 'bg-amber-100 text-amber-700',
    no_asistio:   'bg-gray-100 text-gray-600',
  }
  return map[cita.estado] || 'bg-gray-100 text-gray-600'
}

function labelCita(cita) {
  return { programada: 'Programada', completada: 'Completada', cancelada: 'No asiste', reprogramada: 'Reprogramada', no_asistio: 'No asistió' }[cita.estado] || cita.estado
}

function formatFechaCorta(fecha) {
  if (!fecha) return ''
  const [, m, d] = fecha.split('-')
  const meses = ['ene','feb','mar','abr','may','jun','jul','ago','sep','oct','nov','dic']
  return `${parseInt(d)} ${meses[parseInt(m) - 1]}`
}

const diasSemana  = ['Lun', 'Mar', 'Mié', 'Jue', 'Vie', 'Sáb', 'Dom']
// En desktop el calendario siempre es visible; en móvil empieza oculto
const esMovil    = () => window.innerWidth < 1024
const calVisible = ref(!esMovil())


function prevMes() {
  const d = new Date(mes.value + '-01')
  d.setMonth(d.getMonth() - 1)
  fecha.value = d.toISOString().slice(0, 10)
}
function nextMes() {
  const d = new Date(mes.value + '-01')
  d.setMonth(d.getMonth() + 1)
  fecha.value = d.toISOString().slice(0, 10)
}

const mesNombre = computed(() => {
  if (!agenda.value) return ''
  const [y, m] = agenda.value.mes.split('-')
  return new Date(y, m - 1).toLocaleString('es', { month: 'long', year: 'numeric' })
})
</script>

<template>
  <div class="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6">

    <div class="grid grid-cols-1 lg:grid-cols-3 gap-6">

      <!-- Columna izquierda: calendario -->
      <!-- En móvil: oculto por defecto, se despliega con transición -->
      <Transition
        enter-active-class="transition-all duration-300 ease-out overflow-hidden"
        enter-from-class="max-h-0 opacity-0"
        enter-to-class="max-h-[600px] opacity-100"
        leave-active-class="transition-all duration-200 ease-in overflow-hidden"
        leave-from-class="max-h-[600px] opacity-100"
        leave-to-class="max-h-0 opacity-0"
      >
        <div v-show="calVisible" class="bg-white shadow-sm rounded-xl p-4">

        <!-- Cabecera mes -->
        <div class="flex items-center justify-between mb-4">
          <button @click="prevMes" class="p-1.5 rounded-lg hover:bg-gray-100">
            <svg class="w-4 h-4" fill="none" stroke="currentColor" stroke-width="2" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" d="M15 19l-7-7 7-7"/></svg>
          </button>
          <span class="text-sm font-semibold capitalize">{{ mesNombre }}</span>
          <button @click="nextMes" class="p-1.5 rounded-lg hover:bg-gray-100">
            <svg class="w-4 h-4" fill="none" stroke="currentColor" stroke-width="2" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" d="M9 5l7 7-7 7"/></svg>
          </button>
        </div>

        <!-- Cabecera días -->
        <div class="grid grid-cols-7 mb-1">
          <div v-for="d in diasSemana" :key="d" class="text-center text-sm text-gray-400 font-medium py-1">{{ d }}</div>
        </div>

        <!-- Días -->
        <div v-if="agenda" class="grid grid-cols-7 gap-0.5">
          <button
            v-for="dia in agenda.cal_dias" :key="dia"
            @click="fecha = dia"
            class="relative aspect-square flex flex-col items-center justify-center text-sm rounded-lg transition-colors"
            :class="[
              dia === fecha ? 'bg-teal-600 text-white font-bold' :
              dia === hoy   ? 'bg-teal-50 text-teal-700 font-semibold' :
              agenda.festivos_mes?.[dia] && dia.slice(0,7) === mes ? 'bg-red-50 text-red-400' :
              dia.slice(0,7) !== mes ? 'text-gray-300' : 'text-gray-700 hover:bg-gray-100'
            ]"
            :title="agenda.festivos_mes?.[dia] || undefined"
          >
            {{ dia.slice(8) }}
            <span
              v-if="agenda.citas_por_dia[dia]?.length && dia !== fecha"
              class="absolute bottom-0.5 w-1 h-1 rounded-full bg-teal-400"
            />
            <span
              v-else-if="agenda.festivos_mes?.[dia] && dia !== fecha && dia.slice(0,7) === mes"
              class="absolute bottom-0.5 w-1 h-1 rounded-full bg-red-300"
            />
          </button>
        </div>

        <!-- Botón nueva cita -->
        <RouterLink
          :to="`/sesiones/nueva?fecha=${fecha}`"
          class="mt-4 w-full flex items-center justify-center gap-1.5 px-3 py-2 bg-teal-600 text-white text-sm rounded-lg hover:bg-teal-700 transition-colors"
        >
          <svg class="w-4 h-4" fill="none" stroke="currentColor" stroke-width="2" viewBox="0 0 24 24">
            <path stroke-linecap="round" stroke-linejoin="round" d="M12 4v16m8-8H4"/>
          </svg>
          Nueva sesión
        </RouterLink>
        </div>
      </Transition>

      <!-- Columna derecha: timeline -->
      <div class="lg:col-span-2 bg-white shadow-sm rounded-xl overflow-hidden">
        <div class="px-5 py-3 border-b bg-gray-50 flex items-center justify-between gap-2">
          <div class="flex items-center gap-2 min-w-0">
            <!-- Botón calendario: solo en móvil -->
            <button @click="calVisible = !calVisible"
              class="lg:hidden flex items-center gap-1 px-2 py-1 rounded-lg border text-xs font-medium transition-colors shrink-0"
              :class="calVisible ? 'bg-teal-50 border-teal-300 text-teal-700' : 'bg-white border-gray-300 text-gray-500 hover:border-teal-300'">
              <svg class="w-3.5 h-3.5" fill="none" stroke="currentColor" stroke-width="2" viewBox="0 0 24 24">
                <path stroke-linecap="round" stroke-linejoin="round" d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z"/>
              </svg>
              {{ calVisible ? 'Ocultar' : 'Calendario' }}
            </button>
            <h2 class="font-semibold text-gray-700 text-sm truncate">
              {{ new Date(fecha + 'T12:00:00').toLocaleDateString('es', { weekday: 'long', day: 'numeric', month: 'long' }) }}
            </h2>
          </div>
          <input type="date" v-model="fecha" class="text-sm border border-gray-200 rounded-lg px-2 py-1 focus:outline-none focus:ring-1 focus:ring-teal-500 shrink-0" />
        </div>

        <!-- Aviso día festivo -->
        <div v-if="agenda?.festivos_mes?.[fecha]"
          class="mx-4 mt-3 flex items-center gap-2 px-4 py-2.5 bg-red-50 border border-red-200 rounded-lg text-sm text-red-700">
          <svg class="w-4 h-4 shrink-0" fill="none" stroke="currentColor" stroke-width="2" viewBox="0 0 24 24">
            <path stroke-linecap="round" stroke-linejoin="round" d="M12 9v2m0 4h.01M10.29 3.86L1.82 18a2 2 0 001.71 3h16.94a2 2 0 001.71-3L13.71 3.86a2 2 0 00-3.42 0z"/>
          </svg>
          <span><strong>Día festivo:</strong> {{ agenda.festivos_mes[fecha] }}</span>
        </div>

        <div v-if="store.loading" class="p-5 space-y-3">
          <div v-for="i in 4" :key="i" class="flex gap-3 animate-pulse">
            <div class="w-12 h-8 bg-gray-200 rounded"></div>
            <div class="flex-1 h-16 bg-gray-100 rounded-lg"></div>
          </div>
        </div>

        <div v-else-if="sesionesDelDia.length" class="divide-y divide-gray-100 max-h-[600px] overflow-y-auto">
          <div v-for="{ hora, citas } in sesionesDelDia" :key="hora" class="flex gap-3 px-5 py-2 items-start">
            <span class="text-sm text-gray-400 font-mono w-11 flex-shrink-0 pt-3">{{ hora }}</span>
            <div class="flex-1 flex flex-col gap-2">
              <RouterLink
                v-for="cita in citas" :key="cita.id"
                :to="cita._tipo === 'sesion' ? `/sesiones/${cita.id}` : `/citas/${cita.id}`"
                class="block rounded-lg px-4 text-sm transition-colors hover:opacity-90"
                :class="[cardColor(cita), parseInt(cita.duracion) >= 60 ? 'py-5' : 'py-2.5']"
              >
                <div class="flex items-center justify-between">
                  <p class="font-semibold text-gray-900">{{ cita.paciente_nombre }}</p>
                  <div class="flex flex-col items-end gap-0.5 ml-2 shrink-0">
                    <span class="text-sm px-2 py-0.5 rounded-full font-medium" :class="badgeColor(cita)">
                      {{ labelCita(cita) }}
                    </span>
                    <span v-if="cita._recuperacion || cita.recuperacion" class="text-sm px-2 py-0.5 rounded-full font-medium bg-amber-100 text-amber-700">
                      Recuperación{{ cita._recuperacion_fecha ? ` · ${formatFechaCorta(cita._recuperacion_fecha)}` : '' }}
                    </span>
                  </div>
                </div>
                <p v-if="cita.patologias" class="text-sm text-gray-500 mt-0.5 truncate">{{ cita.patologias }}</p>
                <p class="text-sm text-gray-400 mt-0.5">{{ cita.duracion }} min</p>
                <p v-if="cita.estado === 'cancelada'" class="text-xs mt-0.5 font-medium"
                  :class="cita.reprogramar ? 'text-amber-600' : 'text-gray-400'">
                  {{ cita.reprogramar ? 'Reprogramar' : 'No reprogramar' }}
                </p>
              </RouterLink>
            </div>
          </div>
        </div>

        <div v-else-if="agenda" class="py-12 text-center text-gray-400 text-sm">
          Sin sesiones programadas para este día
        </div>
      </div>

    </div>
  </div>
</template>
