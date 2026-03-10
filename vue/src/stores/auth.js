import { defineStore } from 'pinia'
import { ref, computed } from 'vue'
import { login as apiLogin } from '@/api/auth'

export const useAuthStore = defineStore('auth', () => {
  const token = ref(localStorage.getItem('token') || null)

  const isAuthenticated = computed(() => !!token.value)

  async function login(username, password) {
    const { data } = await apiLogin(username, password)
    token.value = data.data.token
    localStorage.setItem('token', token.value)
  }

  function logout() {
    token.value = null
    localStorage.removeItem('token')
  }

  return { token, isAuthenticated, login, logout }
})
