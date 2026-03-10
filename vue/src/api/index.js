import axios from 'axios'

const api = axios.create({
  baseURL: 'http://fonoflow.test/api/v1',
  headers: { 'Content-Type': 'application/json' },
})

// Añadir token JWT a cada petición
api.interceptors.request.use((config) => {
  const token = localStorage.getItem('token')
  if (token) config.headers.Authorization = `Bearer ${token}`
  return config
})

// Redirigir a login si el token expira (401)
api.interceptors.response.use(
  (res) => res,
  (err) => {
    if (err.response?.status === 401) {
      localStorage.removeItem('token')
      window.location.href = '/login'
    }
    return Promise.reject(err)
  }
)

export default api
