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

const diasSemana = ['Lun', 'Mar', 'Mié', 'Jue', 'Vie', 'Sáb', 'Dom']

const estadoColor = {
  programada:   'border-l-4 border-teal-500 bg-teal-50',
  completada:   'border-l-4 border-green-500 bg-green-50',
  cancelada:    'border-l-4 border-red-400 bg-red-50',
  reprogramada: 'border-l-4 border-amber-400 bg-amber-50',
  no_asistio:   'border-l-4 border-gray-400 bg-gray-50',
}

const estadoBadge = {
  programada:   'bg-teal-100 text-teal-700',
  completada:   'bg-green-100 text-green-700',
  cancelada:    'bg-red-100 text-red-700',
  reprogramada: 'bg-amber-100 text-amber-700',
  no_asistio:   'bg-gray-100 text-gray-600',
}

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
      <div class="bg-white shadow-sm rounded-xl p-4">

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
          <div v-for="d in diasSemana" :key="d" class="text-center text-xs text-gray-400 font-medium py-1">{{ d }}</div>
        </div>

        <!-- Días -->
        <div v-if="agenda" class="grid grid-cols-7 gap-0.5">
          <button
            v-for="dia in agenda.cal_dias" :key="dia"
            @click="fecha = dia"
            class="relative aspect-square flex flex-col items-center justify-center text-xs rounded-lg transition-colors"
            :class="[
              dia === fecha ? 'bg-teal-600 text-white font-bold' :
              dia === hoy   ? 'bg-teal-50 text-teal-700 font-semibold' :
              dia.slice(0,7) !== mes ? 'text-gray-300' : 'text-gray-700 hover:bg-gray-100'
            ]"
          >
            {{ dia.slice(8) }}
            <span
              v-if="agenda.citas_por_dia[dia]?.length && dia !== fecha"
              class="absolute bottom-0.5 w-1 h-1 rounded-full bg-teal-400"
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

      <!-- Columna derecha: timeline -->
      <div class="lg:col-span-2 bg-white shadow-sm rounded-xl overflow-hidden">
        <div class="px-5 py-3 border-b bg-gray-50 flex items-center justify-between">
          <h2 class="font-semibold text-gray-700 text-sm">
            {{ new Date(fecha + 'T12:00:00').toLocaleDateString('es', { weekday: 'long', day: 'numeric', month: 'long' }) }}
          </h2>
          <input type="date" v-model="fecha" class="text-xs border border-gray-200 rounded-lg px-2 py-1 focus:outline-none focus:ring-1 focus:ring-teal-500" />
        </div>

        <div v-if="store.loading" class="p-5 space-y-3">
          <div v-for="i in 6" :key="i" class="flex gap-3 animate-pulse">
            <div class="w-12 h-8 bg-gray-200 rounded"></div>
            <div class="flex-1 h-16 bg-gray-100 rounded-lg"></div>
          </div>
        </div>

        <div v-else-if="agenda" class="divide-y divide-gray-100 max-h-[600px] overflow-y-auto">
          <div v-for="(cita, hora) in agenda.slots" :key="hora" class="flex gap-3 px-5 py-2 items-start">
            <span class="text-xs text-gray-400 font-mono w-11 pt-1 flex-shrink-0">{{ hora }}</span>
            <!-- Slot libre -->
            <RouterLink
              v-if="!cita"
              :to="`/sesiones/nueva?fecha=${fecha}&hora=${hora}`"
              class="flex-1 border-2 border-dashed border-gray-200 rounded-lg px-3 py-2 text-xs text-gray-400 hover:border-teal-400 hover:text-teal-500 transition-colors"
            >+ Nueva sesión</RouterLink>
            <!-- Cita -->
            <RouterLink
              v-else
              :to="cita._tipo === 'sesion' ? `/sesiones/${cita.id}` : `/citas/${cita.id}`"
              class="flex-1 rounded-lg px-3 py-2 text-sm"
              :class="estadoColor[cita.estado] || 'border-l-4 border-gray-300 bg-gray-50'"
            >
              <div class="flex items-center justify-between">
                <p class="font-medium text-gray-900 text-sm">{{ cita.paciente_nombre }}</p>
                <span class="text-xs px-2 py-0.5 rounded-full font-medium ml-2" :class="estadoBadge[cita.estado]">
                  {{ cita.estado }}
                </span>
              </div>
              <p v-if="cita.patologias" class="text-xs text-teal-600 mt-0.5 truncate">{{ cita.patologias }}</p>
              <p class="text-xs text-gray-500 mt-0.5">{{ cita.duracion }} min</p>
            </RouterLink>
          </div>
        </div>
      </div>

    </div>
  </div>
</template>
