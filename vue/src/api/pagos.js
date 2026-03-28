import api from './index'

export const getPagos = (mes)                      => api.get('/pagos', { params: { mes } })
export const setPago  = (pacienteId, mes, importe) => api.put(`/pagos/${pacienteId}/${mes}`, { importe })
