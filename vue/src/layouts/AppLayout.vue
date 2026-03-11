<script setup>
import { ref, computed } from 'vue'
import { RouterLink, RouterView, useRoute, useRouter } from 'vue-router'
import { useAuthStore } from '@/stores/auth'

const auth   = useAuthStore()
const route  = useRoute()
const router = useRouter()
const menuOpen = ref(false)

const nav = [
  { name: 'dashboard', label: 'Inicio',    path: '/' },
  { name: 'agenda',    label: 'Agenda',    path: '/agenda' },
  { name: 'pacientes', label: 'Pacientes', path: '/pacientes' },
  { name: 'sesiones',  label: 'Sesiones',  path: '/sesiones' },
]

const isActive = (path) =>
  path === '/' ? route.path === '/' : route.path.startsWith(path)

function logout() {
  auth.logout()
  router.push('/login')
}
</script>

<template>
  <div class="min-h-screen bg-gray-50 flex flex-col">

    <!-- Nav -->
    <nav class="bg-white border-b border-gray-200 sticky top-0 z-40">
      <div class="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div class="flex items-center justify-between h-14">

          <!-- Logo: burbuja de voz con onda sonora — logopedia -->
          <RouterLink to="/" class="flex items-center gap-2 font-bold text-teal-600 text-lg tracking-tight">
            <svg class="w-7 h-7" viewBox="0 0 28 28" fill="none" xmlns="http://www.w3.org/2000/svg">
              <rect width="28" height="28" rx="7" fill="#0d9488"/>
              <path d="M4 8.5A2.5 2.5 0 016.5 6h15A2.5 2.5 0 0124 8.5v8a2.5 2.5 0 01-2.5 2.5H17l-3 2.5-3-2.5H6.5A2.5 2.5 0 014 16.5v-8z" fill="white"/>
              <rect x="9" y="11.5" width="1.8" height="3.5" rx="0.9" fill="#0d9488"/>
              <rect x="13" y="9.5" width="1.8" height="7.5" rx="0.9" fill="#0d9488"/>
              <rect x="17" y="11.5" width="1.8" height="3.5" rx="0.9" fill="#0d9488"/>
            </svg>
            FonoFlow
          </RouterLink>

          <!-- Desktop nav links -->
          <div class="hidden sm:flex items-center gap-1">
            <RouterLink
              v-for="item in nav" :key="item.name"
              :to="item.path"
              class="px-3 py-4 text-sm font-medium border-b-2 transition-colors"
              :class="isActive(item.path)
                ? 'border-teal-600 text-teal-600'
                : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'"
            >
              {{ item.label }}
            </RouterLink>
          </div>

          <!-- Logout desktop -->
          <button
            @click="logout"
            class="hidden sm:flex items-center gap-1 text-sm text-gray-500 hover:text-gray-700"
          >
            <svg class="w-4 h-4" fill="none" stroke="currentColor" stroke-width="2" viewBox="0 0 24 24">
              <path stroke-linecap="round" stroke-linejoin="round" d="M17 16l4-4m0 0l-4-4m4 4H7m6 4v1a3 3 0 01-3 3H6a3 3 0 01-3-3V7a3 3 0 013-3h4a3 3 0 013 3v1"/>
            </svg>
            Salir
          </button>

          <!-- Hamburger mobile -->
          <button @click="menuOpen = !menuOpen" class="sm:hidden p-2 rounded-md text-gray-500">
            <svg class="w-6 h-6" fill="none" stroke="currentColor" stroke-width="2" viewBox="0 0 24 24">
              <path v-if="!menuOpen" stroke-linecap="round" stroke-linejoin="round" d="M4 6h16M4 12h16M4 18h16"/>
              <path v-else stroke-linecap="round" stroke-linejoin="round" d="M6 18L18 6M6 6l12 12"/>
            </svg>
          </button>
        </div>

        <!-- Mobile menu -->
        <div v-if="menuOpen" class="sm:hidden pb-3 space-y-1">
          <RouterLink
            v-for="item in nav" :key="item.name"
            :to="item.path"
            @click="menuOpen = false"
            class="block px-3 py-2 rounded-lg text-sm font-medium"
            :class="isActive(item.path)
              ? 'bg-teal-50 text-teal-600'
              : 'text-gray-600 hover:bg-gray-100'"
          >
            {{ item.label }}
          </RouterLink>
          <button @click="logout" class="block w-full text-left px-3 py-2 text-sm text-gray-600 hover:bg-gray-100 rounded-lg">
            Cerrar sesión
          </button>
        </div>
      </div>
    </nav>

    <!-- Flash toasts (slot para mensajes globales) -->
    <div id="toasts" class="fixed top-16 right-4 z-50 space-y-2 pointer-events-none" />

    <!-- Content -->
    <main class="flex-1">
      <RouterView />
    </main>

  </div>
</template>
