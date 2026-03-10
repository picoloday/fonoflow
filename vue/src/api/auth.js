import api from './index'

export const login = (username, password) =>
  api.post('/auth/login', { username, password })
