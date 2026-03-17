import api from './index'

export const getPacientes  = (params) => api.get('/pacientes', { params })
export const getPaciente   = (id)     => api.get(`/pacientes/${id}`)
export const crearPaciente = (data)   => api.post('/pacientes', data)
export const editarPaciente= (id, data) => api.put(`/pacientes/${id}`, data)
export const borrarPaciente= (id)     => api.delete(`/pacientes/${id}`)
export const getPatologias   = ()           => api.get('/pacientes/patologias')
export const agendarSesiones = (id, mes)   => api.post(`/pacientes/${id}/agendar`, {}, { params: { mes } })
