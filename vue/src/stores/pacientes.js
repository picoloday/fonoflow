import { defineStore } from 'pinia'
import { ref } from 'vue'
import * as api from '@/api/pacientes'

export const usePacientesStore = defineStore('pacientes', () => {
  const lista    = ref([])
  const actual   = ref(null)
  const loading  = ref(false)

  async function cargar(params) {
    loading.value = true
    const { data } = await api.getPacientes(params)
    lista.value = data.data
    loading.value = false
  }

  async function cargarInactivos(params) {
    loading.value = true
    const { data } = await api.getInactivos(params)
    lista.value = data.data
    loading.value = false
  }

  async function cargarUno(id) {
    loading.value = true
    const { data } = await api.getPaciente(id)
    actual.value = data.data
    loading.value = false
  }

  async function crear(datos) {
    const { data } = await api.crearPaciente(datos)
    return data.data
  }

  async function editar(id, datos) {
    const { data } = await api.editarPaciente(id, datos)
    actual.value = data.data
  }

  async function borrar(id) {
    await api.borrarPaciente(id)
    lista.value = lista.value.filter(p => p.id !== id)
  }

  async function inactivar(id) {
    const { data } = await api.inactivarPaciente(id)
    if (actual.value?.id === id) actual.value = { ...actual.value, ...data.data }
    lista.value = lista.value.filter(p => p.id !== id)
  }

  async function reactivar(id) {
    const { data } = await api.reactivarPaciente(id)
    if (actual.value?.id === id) actual.value = { ...actual.value, ...data.data }
    lista.value = lista.value.filter(p => p.id !== id)
  }

  return { lista, actual, loading, cargar, cargarInactivos, cargarUno, crear, editar, borrar, inactivar, reactivar }
})
