<script setup>
import { ref, computed, watch } from 'vue'
import { getFestivos, syncFestivos, deleteFestivo } from '@/api/festivos'

const año       = ref(new Date().getFullYear())
const festivos  = ref([])
const loading   = ref(false)
const syncing   = ref(false)
const msgSync   = ref('')

async function cargar() {
  loading.value = true
  msgSync.value = ''
  try {
    const { data } = await getFestivos(año.value)
    festivos.value = data.data.festivos
  } finally {
    loading.value = false
  }
}

async function sincronizar() {
  syncing.value = true
  msgSync.value = ''
  try {
    const { data } = await syncFestivos(año.value)
    msgSync.value = data.data.mensaje
    festivos.value = (await getFestivos(año.value)).data.data.festivos
  } catch (e) {
    msgSync.value = e.response?.data?.message || 'Error al sincronizar'
  } finally {
    syncing.value = false
  }
}

async function eliminar(id) {
  await deleteFestivo(id)
  festivos.value = festivos.value.filter(f => f.id !== id)
}

// Agrupar por mes
const porMes = computed(() => {
  const grupos = {}
  for (const f of festivos.value) {
    const mes = f.fecha.slice(0, 7)
    if (!grupos[mes]) grupos[mes] = []
    grupos[mes].push(f)
  }
  return Object.entries(grupos).sort(([a], [b]) => a.localeCompare(b)).map(([mes, lista]) => {
    const [y, m] = mes.split('-')
    return {
      label: new Date(y, m - 1).toLocaleString('es', { month: 'long' }),
      lista,
    }
  })
})

const formatFecha = (fecha) => {
  const [y, m, d] = fecha.split('-')
  const dias = ['domingo','lunes','martes','miércoles','jueves','viernes','sábado']
  const diaSem = dias[new Date(y, m - 1, d).getDay()]
  return `${diaSem} ${parseInt(d)}`
}

watch(año, cargar, { immediate: true })
</script>

<template>
  <div class="max-w-3xl mx-auto px-4 sm:px-6 lg:px-8 py-6 space-y-5">

    <div class="flex items-center justify-between flex-wrap gap-3">
      <div>
        <h1 class="text-2xl font-bold text-gray-900">Festivos</h1>
        <p class="text-sm text-gray-500 mt-0.5">Comunidad de Madrid · no se agendan sesiones en estos días</p>
      </div>
      <button @click="sincronizar" :disabled="syncing"
        class="flex items-center gap-2 px-4 py-2 bg-teal-600 text-white text-sm font-medium rounded-lg hover:bg-teal-700 disabled:opacity-60 transition-colors">
        <svg class="w-4 h-4" :class="syncing ? 'animate-spin' : ''" fill="none" stroke="currentColor" stroke-width="2" viewBox="0 0 24 24">
          <path stroke-linecap="round" stroke-linejoin="round" d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15"/>
        </svg>
        {{ syncing ? 'Sincronizando...' : 'Sincronizar ' + año }}
      </button>
    </div>

    <!-- Selector de año -->
    <div class="flex items-center gap-3">
      <button @click="año--" class="p-1.5 rounded-lg hover:bg-gray-100 transition-colors">
        <svg class="w-4 h-4 text-gray-500" fill="none" stroke="currentColor" stroke-width="2" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" d="M15 19l-7-7 7-7"/></svg>
      </button>
      <span class="text-lg font-semibold text-gray-700 w-16 text-center">{{ año }}</span>
      <button @click="año++" class="p-1.5 rounded-lg hover:bg-gray-100 transition-colors">
        <svg class="w-4 h-4 text-gray-500" fill="none" stroke="currentColor" stroke-width="2" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" d="M9 5l7 7-7 7"/></svg>
      </button>
      <span v-if="festivos.length" class="text-sm text-gray-400">{{ festivos.length }} festivos</span>
    </div>

    <p v-if="msgSync" class="text-sm text-teal-700 bg-teal-50 border border-teal-200 rounded-lg px-4 py-2">
      {{ msgSync }}
    </p>

    <!-- Skeleton -->
    <div v-if="loading" class="space-y-3">
      <div v-for="i in 4" :key="i" class="bg-white rounded-xl p-4 animate-pulse h-10"></div>
    </div>

    <!-- Lista por mes -->
    <div v-else-if="porMes.length" class="bg-white shadow-sm rounded-xl overflow-hidden divide-y divide-gray-100">
      <div v-for="grupo in porMes" :key="grupo.label">
        <div class="px-5 py-2 bg-gray-50">
          <span class="text-xs font-semibold text-gray-400 uppercase tracking-wide capitalize">{{ grupo.label }}</span>
        </div>
        <ul class="divide-y divide-gray-50">
          <li v-for="f in grupo.lista" :key="f.id"
            class="flex items-center justify-between px-5 py-2.5 hover:bg-gray-50 transition-colors group">
            <div>
              <span class="text-sm font-medium text-gray-700 capitalize">{{ formatFecha(f.fecha) }}</span>
              <span class="ml-3 text-sm text-gray-500">{{ f.nombre }}</span>
            </div>
            <button @click="eliminar(f.id)"
              class="opacity-0 group-hover:opacity-100 text-gray-300 hover:text-red-500 transition-all p-1 rounded"
              title="Eliminar este festivo">
              <svg class="w-4 h-4" fill="none" stroke="currentColor" stroke-width="2" viewBox="0 0 24 24">
                <path stroke-linecap="round" stroke-linejoin="round" d="M6 18L18 6M6 6l12 12"/>
              </svg>
            </button>
          </li>
        </ul>
      </div>
    </div>

    <div v-else class="text-center py-12 text-gray-400 text-sm">
      No hay festivos cargados para {{ año }}.
      <button @click="sincronizar" class="ml-1 text-teal-600 hover:underline">Sincronizar ahora</button>
    </div>

  </div>
</template>
