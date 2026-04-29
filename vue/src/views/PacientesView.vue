<script setup>
import { ref, computed, onMounted, watch } from 'vue'
import { RouterLink, useRoute } from 'vue-router'
import { usePacientesStore } from '@/stores/pacientes'

const store    = usePacientesStore()
const route    = useRoute()
const busqueda = ref('')
const activo   = ref('1')

const vistaInactivos = computed(() => route.name === 'pacientes-inactivos')

onMounted(() => cargar())

watch(() => route.name, () => {
  busqueda.value = ''
  activo.value = '1'
  cargar()
})

async function cargar() {
  if (vistaInactivos.value) {
    await store.cargarInactivos({ q: busqueda.value })
  } else {
    await store.cargar({ q: busqueda.value, activo: activo.value })
  }
}

async function reactivar(id, e) {
  e.preventDefault()
  e.stopPropagation()
  await store.reactivar(id)
}
</script>

<template>
  <div class="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6 space-y-5">

    <!-- Cabecera -->
    <div class="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
      <h1 class="text-2xl font-bold text-gray-900">
        {{ vistaInactivos ? 'Pacientes inactivos' : 'Pacientes' }}
      </h1>
      <RouterLink
        v-if="!vistaInactivos"
        to="/pacientes/nuevo"
        class="inline-flex items-center gap-1.5 px-4 py-2 bg-teal-600 text-white text-sm rounded-lg hover:bg-teal-700 transition-colors"
      >
        <svg class="w-4 h-4" fill="none" stroke="currentColor" stroke-width="2" viewBox="0 0 24 24">
          <path stroke-linecap="round" stroke-linejoin="round" d="M12 4v16m8-8H4"/>
        </svg>
        Nuevo paciente
      </RouterLink>
    </div>

    <!-- Filtros -->
    <div class="flex flex-col sm:flex-row gap-3">
      <input
        v-model="busqueda"
        @input="cargar"
        type="search"
        placeholder="Buscar por nombre o patología..."
        class="flex-1 border border-gray-300 rounded-lg py-2 px-3 text-sm focus:outline-none focus:ring-2 focus:ring-teal-500"
      />
      <select
        v-if="!vistaInactivos"
        v-model="activo"
        @change="cargar"
        class="border border-gray-300 rounded-lg py-2 px-3 text-sm focus:outline-none focus:ring-2 focus:ring-teal-500"
      >
        <option value="1">Solo activos</option>
        <option value="0">Todos</option>
      </select>
    </div>

    <!-- Loading -->
    <div v-if="store.loading" class="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
      <div v-for="i in 6" :key="i" class="bg-white rounded-xl p-5 animate-pulse">
        <div class="flex gap-3 items-center mb-3">
          <div class="w-10 h-10 bg-gray-200 rounded-full"></div>
          <div class="flex-1 space-y-2">
            <div class="h-4 bg-gray-200 rounded w-2/3"></div>
            <div class="h-3 bg-gray-200 rounded w-1/3"></div>
          </div>
        </div>
      </div>
    </div>

    <!-- Grid de pacientes -->
    <div v-else class="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
      <RouterLink
        v-for="p in store.lista" :key="p.id"
        :to="`/pacientes/${p.id}`"
        class="bg-white shadow-sm rounded-xl p-5 hover:shadow-md transition-shadow group flex flex-col"
      >
        <div class="flex items-center gap-3 mb-3">
          <div class="w-10 h-10 rounded-full flex items-center justify-center text-white font-semibold text-sm flex-shrink-0"
               :class="vistaInactivos ? 'bg-gray-400' : 'bg-teal-600'">
            {{ p.nombre.charAt(0).toUpperCase() }}
          </div>
          <div class="min-w-0">
            <p class="font-semibold text-gray-900 truncate group-hover:text-teal-600">{{ p.nombre }}</p>
            <p class="text-sm text-gray-400">{{ p.total_sesiones }} sesiones</p>
          </div>
          <span v-if="!p.activo && !vistaInactivos" class="ml-auto text-sm bg-gray-100 text-gray-500 px-2 py-0.5 rounded-full">Inactivo</span>
        </div>
        <div v-if="p.patologias.length" class="flex flex-wrap gap-1">
          <span
            v-for="pat in p.patologias.slice(0, 3)" :key="pat"
            class="text-sm bg-teal-50 text-teal-700 px-2 py-0.5 rounded-full"
          >{{ pat }}</span>
          <span v-if="p.patologias.length > 3" class="text-sm text-gray-400">+{{ p.patologias.length - 3 }}</span>
        </div>
        <button
          v-if="vistaInactivos"
          @click="reactivar(p.id, $event)"
          class="mt-4 inline-flex justify-center items-center px-3 py-1.5 bg-teal-600 text-white text-sm rounded-lg hover:bg-teal-700 transition-colors"
        >
          Reactivar
        </button>
      </RouterLink>

      <div v-if="!store.lista.length" class="col-span-full text-center py-12 text-gray-400">
        {{ vistaInactivos ? 'No hay pacientes inactivos' : 'No se encontraron pacientes' }}
      </div>
    </div>

  </div>
</template>
