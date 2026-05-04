import http from '@/utils/request.js'

export const getCourses = (params) => http.get('/courses', params)
export const getCourseDetail = (id) => http.get(`/courses/${id}`)
export const getScheduleDetail = (id) => http.get(`/schedules/${id}`, {}, { showLoad: false })
export const getLocations = () => http.get('/locations', {}, { showLoad: false })
