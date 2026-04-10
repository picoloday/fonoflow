<script setup>
import { ref, onMounted, computed } from 'vue'
import { RouterLink } from 'vue-router'
import { getPendientesReprogramar } from '@/api/sesiones'

const loading  = ref(true)
const resumen  = ref({ pacientes: [], total_pacientes: 0, total_sesiones: 0, total_precio: 0 })
const abiertos = ref(new Set())

onMounted(cargar)

async function cargar() {
  loading.value = true
  try {
    const { data } = await getPendientesReprogramar()
    resumen.value = data
  } finally {
    loading.value = false
  }
}

function togglePaciente(id) {
  if (abiertos.value.has(id)) {
    abiertos.value.delete(id)
  } else {
    abiertos.value.add(id)
  }
}

function formatFecha(fecha) {
  if (!fecha) return '—'
  const [y, m, d] = fecha.split('-')
  return `${d}/${m}/${y}`
}

function formatPrecio(precio) {
  return new Intl.NumberFormat('es-ES', { style: 'currency', currency: 'EUR' }).format(precio)
}
</script>

<template>
  <div class="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-6 space-y-5">

    <!-- Cabecera -->
    <div class="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
      <div>
        <h1 class="text-2xl font-bold text-gray-900">Pendientes de reprogramar</h1>
        <p class="text-sm text-gray-500 mt-0.5">Pacientes con sesiones canceladas marcadas para reprogramar</p>
      </div>
      <button
        @click="cargar"
        class="inline-flex items-center gap-1.5 px-3 py-2 text-sm border border-gray-300 rounded-lg text-gray-600 hover:bg-gray-50 transition-colors"
      >
        <svg class="w-4 h-4" fill="none" stroke="currentColor" stroke-width="2" viewBox="0 0 24 24">
          <path stroke-linecap="round" stroke-linejoin="round" d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15"/>
        </svg>
        Actualizar
      </button>
    </div>

    <!-- Tarjetas de resumen -->
    <div v-if="!loading" class="grid grid-cols-3 gap-3">
      <div class="bg-white rounded-xl p-4 shadow-sm text-center">
        <p class="text-2xl font-bold text-gray-900">{{ resumen.total_pacientes }}</p>
        <p class="text-xs text-gray-500 mt-0.5">Pacientes</p>
      </div>
      <div class="bg-white rounded-xl p-4 shadow-sm text-center">
        <p class="text-2xl font-bold text-amber-600">{{ resumen.total_sesiones }}</p>
        <p class="text-xs text-gray-500 mt-0.5">Sesiones pendientes</p>
      </div>
      <div class="bg-white rounded-xl p-4 shadow-sm text-center">
        <p class="text-2xl font-bold text-teal-600">{{ formatPrecio(resumen.total_precio) }}</p>
        <p class="text-xs text-gray-500 mt-0.5">Precio a recuperar</p>
      </div>
    </div>

    <!-- Loading skeleton -->
    <div v-if="loading" class="space-y-3">
      <div v-for="i in 4" :key="i" class="bg-white rounded-xl p-4 animate-pulse">
        <div class="flex items-center gap-3">
          <div class="w-9 h-9 bg-gray-200 rounded-full"></div>
          <div class="flex-1 space-y-2">
            <div class="h-4 bg-gray-200 rounded w-1/3"></div>
            <div class="h-3 bg-gray-200 rounded w-1/5"></div>
          </div>
        </div>
      </div>
    </div>

    <!-- Lista de pacientes -->
    <div v-else-if="resumen.pacientes.length" class="space-y-3">
      <div
        v-for="p in resumen.pacientes"
        :key="p.paciente_id"
        class="bg-white shadow-sm rounded-xl overflow-hidden"
      >
        <!-- Fila del paciente (clickable para expandir) -->
        <button
          @click="togglePaciente(p.paciente_id)"
          class="w-full flex items-center gap-3 px-4 py-3 hover:bg-gray-50 transition-colors text-left"
        >
          <!-- Avatar -->
          <div class="w-9 h-9 rounded-full bg-amber-500 flex items-center justify-center text-white font-semibold text-sm flex-shrink-0">
            {{ p.paciente_nombre.charAt(0).toUpperCase() }}
          </div>

          <!-- Nombre y contador -->
          <div class="flex-1 min-w-0">
            <p class="font-semibold text-gray-900 truncate">{{ p.paciente_nombre }}</p>
            <p class="text-xs text-gray-500">
              {{ p.total_pendientes === 1 ? '1 sesión pendiente' : `${p.total_pendientes} sesiones pendientes` }}
            </p>
          </div>

          <!-- Precio y badge -->
          <div class="flex items-center gap-3 flex-shrink-0">
            <span class="text-sm font-medium text-teal-700">{{ formatPrecio(p.precio_pendiente) }}</span>
            <span class="inline-flex items-center justify-center w-6 h-6 rounded-full bg-amber-100 text-amber-700 text-xs font-bold">
              {{ p.total_pendientes }}
            </span>
            <!-- Flecha -->
            <svg
              class="w-4 h-4 text-gray-400 transition-transform"
              :class="{ 'rotate-180': abiertos.has(p.paciente_id) }"
              fill="none" stroke="currentColor" stroke-width="2" viewBox="0 0 24 24"
            >
              <path stroke-linecap="round" stroke-linejoin="round" d="M19 9l-7 7-7-7"/>
            </svg>
          </div>
        </button>

        <!-- Detalle de sesiones (expandible) -->
        <div v-if="abiertos.has(p.paciente_id)" class="border-t border-gray-100">
          <!-- Sesiones -->
          <div class="divide-y divide-gray-50">
            <RouterLink
              v-for="s in p.sesiones"
              :key="s.id"
              :to="`/sesiones/${s.id}`"
              class="flex items-center gap-3 px-4 py-2.5 hover:bg-teal-50 transition-colors"
            >
              <svg class="w-4 h-4 text-amber-400 flex-shrink-0" fill="none" stroke="currentColor" stroke-width="2" viewBox="0 0 24 24">
                <path stroke-linecap="round" stroke-linejoin="round" d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z"/>
              </svg>
              <span class="text-sm text-gray-700 font-medium w-24">{{ formatFecha(s.fecha) }}</span>
              <span v-if="s.hora_inicio" class="text-xs text-gray-400 w-12">{{ s.hora_inicio.slice(0,5) }}</span>
              <span v-else class="w-12"></span>
              <span class="flex-1 text-sm text-gray-500 truncate">{{ s.motivo_ausencia || '—' }}</span>
              <span class="text-sm text-teal-700 font-medium">{{ formatPrecio(s.precio) }}</span>
              <svg class="w-3.5 h-3.5 text-gray-300 flex-shrink-0" fill="none" stroke="currentColor" stroke-width="2" viewBox="0 0 24 24">
                <path stroke-linecap="round" stroke-linejoin="round" d="M9 5l7 7-7 7"/>
              </svg>
            </RouterLink>
          </div>

          <!-- Acción: ir al paciente para crear nueva sesión -->
          <div class="px-4 py-3 bg-gray-50 flex justify-end">
            <RouterLink
              :to="`/pacientes/${p.paciente_id}`"
              class="inline-flex items-center gap-1.5 text-sm text-teal-600 hover:text-teal-700 font-medium"
            >
              Ver paciente
              <svg class="w-4 h-4" fill="none" stroke="currentColor" stroke-width="2" viewBox="0 0 24 24">
                <path stroke-linecap="round" stroke-linejoin="round" d="M9 5l7 7-7 7"/>
              </svg>
            </RouterLink>
          </div>
        </div>
      </div>
    </div>

    <!-- Estado vacío -->
    <div v-else class="text-center py-16 text-gray-400">
      <svg class="w-12 h-12 mx-auto mb-3 text-gray-300" fill="none" stroke="currentColor" stroke-width="1.5" viewBox="0 0 24 24">
        <path stroke-linecap="round" stroke-linejoin="round" d="M9 12.75L11.25 15 15 9.75M21 12a9 9 0 11-18 0 9 9 0 0118 0z"/>
      </svg>
      <p class="font-medium">No hay sesiones pendientes de reprogramar</p>
      <p class="text-sm mt-1">Todos los pacientes están al día</p>
    </div>

  </div>
</template>
