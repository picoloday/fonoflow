import api from './index'

export const getAgenda     = (params) => api.get('/agenda', { params })
export const getCitas      = (params) => api.get('/citas', { params })
export const getCita       = (id)     => api.get(`/citas/${id}`)
export const crearCita     = (data)   => api.post('/citas', data)
export const editarCita    = (id, data) => api.put(`/citas/${id}`, data)
export const borrarCita    = (id)     => api.delete(`/citas/${id}`)
export const marcarAsistencia = (id, data) => api.post(`/citas/${id}/asistencia`, data)
export const cancelarCita  = (id)     => api.post(`/citas/${id}/cancelar`)
export const getHuecos     = (fecha)  => api.get(`/citas/huecos/${fecha}`)
