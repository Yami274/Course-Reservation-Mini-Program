import http from '@/utils/request.js'

export const getStudents = () => http.get('/students', {}, { showLoad: false })
export const createStudent = (data) => http.post('/students', data)
export const updateStudent = (id, data) => http.put(`/students/${id}`, data)
export const deleteStudent = (id) => http.delete(`/students/${id}`)
