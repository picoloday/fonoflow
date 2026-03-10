import { defineStore } from 'pinia'
import { ref } from 'vue'
import * as api from '@/api/sesiones'

export const useSesionesStore = defineStore('sesiones', () => {
  const lista   = ref({ por_mes: {}, total_sesiones: 0, total_ingresos: 0 })
  const actual  = ref(null)
  const loading = ref(false)

  async function cargar(params) {
    loading.value = true
    const { data } = await api.getSesiones(params)
    lista.value = data.data
    loading.value = false
  }

  async function cargarUna(id) {
    const { data } = await api.getSesion(id)
    actual.value = data.data
  }

  async function crear(datos) {
    const { data } = await api.crearSesion(datos)
    return data.data
  }

  async function editar(id, datos) {
    const { data } = await api.editarSesion(id, datos)
    actual.value = data.data
  }

  async function toggleObjetivo(sesionId, objetivoId) {
    const { data } = await api.toggleObjetivo(sesionId, objetivoId)
    if (actual.value) actual.value.objetivos = data.data.objetivos
    return data.data
  }

  return { lista, actual, loading, cargar, cargarUna, crear, editar, toggleObjetivo }
})
