<script setup>
import { ref, onMounted } from 'vue'
import { RouterLink } from 'vue-router'
import { useSesionesStore } from '@/stores/sesiones'
import { formatFecha } from '@/utils/fecha'

const store = useSesionesStore()
const mesActual = new Date().toISOString().slice(0, 7)

onMounted(async () => {
  await store.cargar()
  mesesAbiertos.value.add(mesActual)
  mesesAbiertos.value = new Set(mesesAbiertos.value)
  await store.cargarMes(mesActual)
})

const mesesAbiertos = ref(new Set())
const diasAbiertos  = ref({}) // { 'YYYY-MM-DD': true }

const nombreMes = (ym) => {
  const [y, m] = ym.split('-')
  return new Date(y, m - 1).toLocaleString('es', { month: 'long', year: 'numeric' })
}

async function toggleMes(mes) {
  if (mesesAbiertos.value.has(mes)) {
    mesesAbiertos.value.delete(mes)
  } else {
    mesesAbiertos.value.add(mes)
    await store.cargarMes(mes)
  }
  mesesAbiertos.value = new Set(mesesAbiertos.value) // trigger reactivity
}

function toggleDia(dia) {
  diasAbiertos.value[dia] = !diasAbiertos.value[dia]
}

const labelEstado = { programada: 'Programada', completada: 'Completada', cancelada: 'No asiste', reprogramada: 'Reprogramada' }

const badgeClass = {
  programada:   'bg-gray-100 text-gray-600',
  completada:   'bg-green-100 text-green-700',
  cancelada:    'bg-red-100 text-red-700',
  reprogramada: 'bg-amber-100 text-amber-700',
}
</script>

<template>
  <div class="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6 space-y-5">

    <div class="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
      <div>
        <h1 class="text-2xl font-bold text-gray-900">Facturación</h1>
        <p class="text-sm text-gray-500 mt-0.5">
          {{ store.resumen.total_sesiones }} sesiones · {{ Number(store.resumen.total_ingresos).toFixed(2) }}€ total
        </p>
      </div>
    </div>

    <!-- Skeleton -->
    <div v-if="store.loading" class="space-y-3">
      <div v-for="i in 4" :key="i" class="bg-white rounded-xl p-4 animate-pulse flex justify-between">
        <div class="h-4 bg-gray-200 rounded w-32"></div>
        <div class="h-4 bg-gray-100 rounded w-20"></div>
      </div>
    </div>

    <!-- Lista de meses -->
    <div v-else class="space-y-2">
      <div v-for="m in store.resumen.meses" :key="m.mes" class="bg-white shadow-sm rounded-xl overflow-hidden">

        <!-- Cabecera mes (acordeón nivel 1) -->
        <button @click="toggleMes(m.mes)"
          class="w-full flex items-center justify-between px-5 py-3.5 hover:bg-gray-50 transition-colors">
          <div class="flex items-center gap-3">
            <svg class="w-4 h-4 text-gray-400 transition-transform"
              :class="mesesAbiertos.has(m.mes) ? 'rotate-90' : ''"
              fill="none" stroke="currentColor" stroke-width="2" viewBox="0 0 24 24">
              <path stroke-linecap="round" stroke-linejoin="round" d="M9 5l7 7-7 7"/>
            </svg>
            <span class="font-semibold text-gray-700 capitalize">{{ nombreMes(m.mes) }}</span>
            <span class="text-xs text-gray-400">{{ m.total }} sesiones</span>
          </div>
          <span class="text-sm font-semibold text-teal-600">{{ Number(m.ingresos).toFixed(2) }}€</span>
        </button>

        <!-- Contenido del mes -->
        <div v-if="mesesAbiertos.has(m.mes)" class="border-t border-gray-100">

          <!-- Cargando mes -->
          <div v-if="store.cargandoMes[m.mes]" class="p-4 space-y-2">
            <div v-for="i in 3" :key="i" class="h-10 bg-gray-100 rounded-lg animate-pulse"></div>
          </div>

          <div v-else-if="store.detallesMes[m.mes]">
            <!-- Acordeón por día -->
            <div v-for="(sesiones, dia) in store.detallesMes[m.mes].por_dia" :key="dia"
              class="border-b border-gray-50 last:border-none">

              <!-- Cabecera día (acordeón nivel 2) -->
              <button @click="toggleDia(dia)"
                class="w-full flex items-center justify-between px-5 py-2.5 bg-gray-50 hover:bg-gray-100 transition-colors">
                <div class="flex items-center gap-2">
                  <svg class="w-3.5 h-3.5 text-gray-400 transition-transform"
                    :class="diasAbiertos[dia] ? 'rotate-90' : ''"
                    fill="none" stroke="currentColor" stroke-width="2" viewBox="0 0 24 24">
                    <path stroke-linecap="round" stroke-linejoin="round" d="M9 5l7 7-7 7"/>
                  </svg>
                  <span class="text-sm font-medium text-gray-600">{{ formatFecha(dia) }}</span>
                  <span class="text-xs text-gray-400">{{ sesiones.length }} sesión{{ sesiones.length > 1 ? 'es' : '' }}</span>
                </div>
                <span class="text-xs text-teal-600 font-medium">
                  {{ sesiones.filter(s => s.estado === 'completada').reduce((a, s) => a + Number(s.precio), 0).toFixed(2) }}€
                </span>
              </button>

              <!-- Sesiones del día -->
              <ul v-if="diasAbiertos[dia]" class="divide-y divide-gray-100">
                <li v-for="s in sesiones" :key="s.id" class="flex items-stretch">
                  <RouterLink :to="`/sesiones/${s.id}`"
                    class="flex flex-1 items-center gap-3 px-5 py-3 hover:bg-gray-50 min-w-0">
                    <div class="flex-1 min-w-0">
                      <p class="text-sm font-medium text-gray-900 truncate">{{ s.paciente_nombre }}</p>
                      <p class="text-sm text-gray-400">{{ s.hora_inicio ? s.hora_inicio.slice(0,5) : '—' }} · {{ s.duracion }} min</p>
                      <p v-if="s.estado === 'cancelada'" class="text-xs mt-0.5 font-medium"
                        :class="s.reprogramar ? 'text-amber-600' : 'text-gray-400'">
                        {{ s.reprogramar ? 'Reprogramar' : 'No reprogramar' }}
                      </p>
                    </div>
                    <span class="text-xs px-2 py-0.5 rounded-full font-medium shrink-0"
                      :class="badgeClass[s.estado] || 'bg-gray-100 text-gray-600'">
                      {{ labelEstado[s.estado] || s.estado }}
                    </span>
                    <span class="text-sm font-medium text-teal-600 shrink-0">{{ Number(s.precio).toFixed(2) }}€</span>
                    <svg class="w-4 h-4 text-gray-300 shrink-0" fill="none" stroke="currentColor" stroke-width="2" viewBox="0 0 24 24">
                      <path stroke-linecap="round" stroke-linejoin="round" d="M9 5l7 7-7 7"/>
                    </svg>
                  </RouterLink>
                </li>
              </ul>

            </div>
          </div>
        </div>

      </div>

      <div v-if="!store.resumen.meses.length" class="text-center py-12 text-gray-400">
        No hay sesiones registradas
      </div>
    </div>

  </div>
</template>
