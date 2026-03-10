import { defineStore } from 'pinia'
import { ref } from 'vue'
import * as api from '@/api/citas'

export const useCitasStore = defineStore('citas', () => {
  const agenda  = ref(null)   // { today, fecha, mes, cal_dias, citas_por_dia, slots, ... }
  const actual  = ref(null)
  const loading = ref(false)

  async function cargarAgenda(params) {
    loading.value = true
    const { data } = await api.getAgenda(params)
    agenda.value = data.data
    loading.value = false
  }

  async function cargarUna(id) {
    const { data } = await api.getCita(id)
    actual.value = data.data
  }

  async function crear(datos) {
    const { data } = await api.crearCita(datos)
    return data.data
  }

  async function editar(id, datos) {
    const { data } = await api.editarCita(id, datos)
    actual.value = data.data
  }

  async function asistencia(id, datos) {
    const { data } = await api.marcarAsistencia(id, datos)
    return data.data
  }

  async function cancelar(id) {
    const { data } = await api.cancelarCita(id)
    actual.value = data.data
  }

  return { agenda, actual, loading, cargarAgenda, cargarUna, crear, editar, asistencia, cancelar }
})
