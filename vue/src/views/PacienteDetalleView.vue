<script setup>
import { onMounted } from 'vue'
import { useRoute, RouterLink } from 'vue-router'
import { usePacientesStore } from '@/stores/pacientes'

const store = usePacientesStore()
const route = useRoute()
onMounted(() => store.cargarUno(route.params.id))
</script>

<template>
  <div class="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
    <div v-if="store.loading" class="animate-pulse space-y-4">
      <div class="h-8 bg-gray-200 rounded w-48"></div>
    </div>
    <div v-else-if="store.actual">
      <div class="flex items-center gap-4 mb-6">
        <RouterLink to="/pacientes" class="text-gray-400 hover:text-gray-600">
          <svg class="w-5 h-5" fill="none" stroke="currentColor" stroke-width="2" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" d="M15 19l-7-7 7-7"/></svg>
        </RouterLink>
        <h1 class="text-2xl font-bold text-gray-900">{{ store.actual.nombre }}</h1>
        <RouterLink :to="`/pacientes/${store.actual.id}/editar`" class="ml-auto inline-flex items-center px-3 py-1.5 border border-gray-300 rounded-lg text-sm hover:bg-gray-50">
          Editar
        </RouterLink>
      </div>
      <!-- Info básica -->
      <div class="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <div class="bg-white shadow-sm rounded-xl p-5 space-y-3">
          <div v-if="store.actual.tutor"><span class="text-xs text-gray-400">Tutor</span><p class="text-sm">{{ store.actual.tutor }}</p></div>
          <div v-if="store.actual.telefono"><span class="text-xs text-gray-400">Teléfono</span><p class="text-sm">{{ store.actual.telefono }}</p></div>
          <div v-if="store.actual.email"><span class="text-xs text-gray-400">Email</span><p class="text-sm">{{ store.actual.email }}</p></div>
          <div v-if="store.actual.patologias?.length">
            <span class="text-xs text-gray-400">Patologías</span>
            <div class="flex flex-wrap gap-1 mt-1">
              <span v-for="p in store.actual.patologias" :key="p" class="text-xs bg-teal-50 text-teal-700 px-2 py-0.5 rounded-full">{{ p }}</span>
            </div>
          </div>
        </div>
        <div class="lg:col-span-2 bg-white shadow-sm rounded-xl overflow-hidden">
          <div class="px-5 py-3 border-b bg-gray-50"><h2 class="font-semibold text-sm text-gray-700">Historial de sesiones</h2></div>
          <ul class="divide-y divide-gray-100">
            <li v-for="s in store.actual.historial" :key="s.id">
              <RouterLink :to="`/sesiones/${s.id}`" class="flex items-center gap-3 px-5 py-3 hover:bg-gray-50">
                <div class="flex-1"><p class="text-sm font-medium text-gray-900">{{ s.fecha }}</p></div>
                <span class="text-sm text-teal-600">{{ Number(s.precio).toFixed(2) }}€</span>
              </RouterLink>
            </li>
            <li v-if="!store.actual.historial?.length" class="px-5 py-8 text-center text-gray-400 text-sm">Sin sesiones</li>
          </ul>
        </div>
      </div>
    </div>
  </div>
</template>
