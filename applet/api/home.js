import http from '@/utils/request.js'

export const getBanners = () => http.get('/banners', {}, { showLoad: false })
export const getNotices = () => http.get('/notices', {}, { showLoad: false })
export const getCategories = () => http.get('/categories', {}, { showLoad: false })
export const getHotCourses = (limit = 6) => http.get('/courses/hot', { limit }, { showLoad: false })
