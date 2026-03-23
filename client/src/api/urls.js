import api from './axios'

export const createUrl = (data) => api.post('/urls', data)
export const getUserUrls = () => api.get('/urls')
export const deleteUrl = (id) => api.delete(`/urls/${id}`)
export const getAnalytics = (id) => api.get(`/analytics/${id}`)