import api from './index'

export const getFestivos  = (año)  => api.get('/festivos', { params: { año } })
export const syncFestivos = (año)  => api.post('/festivos/sync', null, { params: { año } })
export const deleteFestivo = (id)  => api.delete(`/festivos/${id}`)
