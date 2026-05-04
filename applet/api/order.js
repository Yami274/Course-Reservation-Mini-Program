import http from '@/utils/request.js'

export const createOrder = (data) => http.post('/orders', data)
export const getOrders = (params) => http.get('/orders', params)
export const getOrderDetail = (id) => http.get(`/orders/${id}`)
export const cancelOrder = (id) => http.put(`/orders/${id}/cancel`, {})
