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
          <svg class="w-10 h-10" viewBox="0 0 28 28" fill="none" xmlns="http://www.w3.org/2000/svg">
            <path d="M4 8.5A2.5 2.5 0 016.5 6h15A2.5 2.5 0 0124 8.5v8a2.5 2.5 0 01-2.5 2.5H17l-3 2.5-3-2.5H6.5A2.5 2.5 0 014 16.5v-8z" fill="white"/>
            <rect x="9" y="11.5" width="1.8" height="3.5" rx="0.9" fill="#0d9488"/>
            <rect x="13" y="9.5" width="1.8" height="7.5" rx="0.9" fill="#0d9488"/>
            <rect x="17" y="11.5" width="1.8" height="3.5" rx="0.9" fill="#0d9488"/>
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
