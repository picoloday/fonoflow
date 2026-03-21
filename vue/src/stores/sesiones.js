import { defineStore } from 'pinia'
import { ref } from 'vue'
import * as api from '@/api/sesiones'

export const useSesionesStore = defineStore('sesiones', () => {
  const resumen       = ref({ meses: [], total_sesiones: 0, total_ingresos: 0 })
  const detallesMes   = ref({}) // { 'YYYY-MM': { por_dia, ingresos } }
  const cargandoMes   = ref({}) // { 'YYYY-MM': true }
  const actual        = ref(null)
  const loading       = ref(false)

  async function cargar() {
    loading.value = true
    const { data } = await api.getSesiones()
    resumen.value = data.data
    loading.value = false
  }

  async function cargarMes(mes) {
    if (detallesMes.value[mes] || cargandoMes.value[mes]) return
    cargandoMes.value[mes] = true
    try {
      const { data } = await api.getSesiones({ mes })
      detallesMes.value[mes] = data.data
    } finally {
      cargandoMes.value[mes] = false
    }
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

  async function completar(id, datos) {
    const { data } = await api.completarSesion(id, datos)
    actual.value = data.data
    return data.data
  }

  async function borrar(id) {
    await api.borrarSesion(id)
    actual.value = null
  }

  async function toggleReprogramar(id) {
    const { data } = await api.toggleReprogramar(id)
    actual.value = data.data
    return data.data
  }

  return { resumen, detallesMes, cargandoMes, actual, loading, cargar, cargarMes, cargarUna, crear, editar, toggleObjetivo, completar, borrar, toggleReprogramar }
})
