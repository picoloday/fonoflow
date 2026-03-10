<script setup>
import { ref } from 'vue'
import { useRouter } from 'vue-router'
import { useAuthStore } from '@/stores/auth'

const auth     = useAuthStore()
const router   = useRouter()
const username = ref('')
const password = ref('')
const error    = ref('')
const loading  = ref(false)

async function submit() {
  error.value   = ''
  loading.value = true
  try {
    await auth.login(username.value, password.value)
    router.push('/')
  } catch (e) {
    error.value = e.response?.data?.message ?? 'Error al iniciar sesión'
  } finally {
    loading.value = false
  }
}
</script>

<template>
  <div class="min-h-screen bg-gray-50 flex items-center justify-center px-4">
    <div class="w-full max-w-sm">

      <!-- Logo -->
      <div class="text-center mb-8">
        <div class="inline-flex items-center justify-center w-16 h-16 bg-teal-600 rounded-2xl mb-4">
          <svg class="w-8 h-8 text-white" fill="none" stroke="currentColor" stroke-width="2" viewBox="0 0 24 24">
            <path stroke-linecap="round" stroke-linejoin="round" d="M9 19V6l12-3v13M9 19c0 1.105-1.343 2-3 2s-3-.895-3-2 1.343-2 3-2 3 .895 3 2zm12-3c0 1.105-1.343 2-3 2s-3-.895-3-2 1.343-2 3-2 3 .895 3 2zM9 10l12-3"/>
          </svg>
        </div>
        <h1 class="text-2xl font-bold text-gray-900">FonoFlow</h1>
        <p class="text-gray-500 text-sm mt-1">Gestión de sesiones de logopedia</p>
      </div>

      <!-- Card -->
      <div class="bg-white rounded-2xl shadow-sm p-8">
        <form @submit.prevent="submit" class="space-y-5">

          <div>
            <label class="block text-sm font-medium text-gray-700 mb-1">Usuario</label>
            <input
              v-model="username"
              type="text"
              required
              autocomplete="username"
              class="block w-full border border-gray-300 rounded-lg py-2.5 px-3 text-sm shadow-sm focus:outline-none focus:ring-2 focus:ring-teal-500 focus:border-transparent"
              placeholder="admin"
            />
          </div>

          <div>
            <label class="block text-sm font-medium text-gray-700 mb-1">Contraseña</label>
            <input
              v-model="password"
              type="password"
              required
              autocomplete="current-password"
              class="block w-full border border-gray-300 rounded-lg py-2.5 px-3 text-sm shadow-sm focus:outline-none focus:ring-2 focus:ring-teal-500 focus:border-transparent"
            />
          </div>

          <div v-if="error" class="text-sm text-red-600 bg-red-50 rounded-lg px-3 py-2">
            {{ error }}
          </div>

          <button
            type="submit"
            :disabled="loading"
            class="w-full flex justify-center items-center gap-2 px-4 py-2.5 bg-teal-600 hover:bg-teal-700 text-white text-sm font-medium rounded-lg transition-colors disabled:opacity-60"
          >
            <svg v-if="loading" class="animate-spin w-4 h-4" fill="none" viewBox="0 0 24 24">
              <circle class="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" stroke-width="4"/>
              <path class="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8v8z"/>
            </svg>
            {{ loading ? 'Entrando...' : 'Iniciar sesión' }}
          </button>

        </form>
      </div>

    </div>
  </div>
</template>
