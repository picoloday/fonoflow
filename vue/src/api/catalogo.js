import api from './index'

export const getCatalogo  = (tipo)        => api.get(`/catalogo/${tipo}`)
export const addCatalogo  = (tipo, nombre) => api.post(`/catalogo/${tipo}`, { nombre })
export const delCatalogo  = (tipo, id)    => api.delete(`/catalogo/${tipo}/${id}`)
