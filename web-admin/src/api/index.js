import axios from 'axios'

const request = axios.create({
  baseURL: '/api',
  timeout: 15000,
})

request.interceptors.request.use((config) => {
  const token = localStorage.getItem('admin_token')
  if (token) {
    config.headers['Authorization'] = `Bearer ${token}`
  }
  return config
})

request.interceptors.response.use(
  (res) => {
    const data = res.data
    if (data.code !== 0) {
      const err = new Error(data.message || '请求失败')
      err.code = data.code
      return Promise.reject(err)
    }
    return data.data
  },
  (err) => {
    if (err.response?.status === 401) {
      localStorage.removeItem('admin_token')
      localStorage.removeItem('admin_user')
      window.location.href = '/#/login'
    }
    return Promise.reject(err.response?.data ? new Error(err.response.data.message || '网络错误') : err)
  }
)

export default request

// 认证
export const adminLogin = (data) => request.post('/admin/login', data)

// 仪表盘
export const getDashboard = () => request.get('/admin/dashboard')

// 课程
export const getCourses = (params) => request.get('/admin/courses', { params })
export const getCourse = (id) => request.get(`/admin/courses/${id}`)
export const createCourse = (data) => request.post('/admin/courses', data)
export const updateCourse = (id, data) => request.put(`/admin/courses/${id}`, data)
export const deleteCourse = (id) => request.delete(`/admin/courses/${id}`)
export const updateCourseStatus = (id, status) => request.put(`/admin/courses/${id}/status`, { status })

// 班型
export const addCourseType = (courseId, data) => request.post(`/admin/courses/${courseId}/types`, data)
export const updateCourseType = (id, data) => request.put(`/admin/courses/types/${id}`, data)
export const deleteCourseType = (id) => request.delete(`/admin/courses/types/${id}`)

// 时段
export const addSchedule = (typeId, data) => request.post(`/admin/courses/types/${typeId}/schedules`, data)
export const updateSchedule = (id, data) => request.put(`/admin/courses/schedules/${id}`, data)
export const deleteSchedule = (id) => request.delete(`/admin/courses/schedules/${id}`)

// 订单
export const getOrders = (params) => request.get('/admin/orders', { params })
export const getOrder = (id) => request.get(`/admin/orders/${id}`)
export const auditOrder = (id, data) => request.put(`/admin/orders/${id}/audit`, data)
export const cancelOrder = (id) => request.put(`/admin/orders/${id}/cancel`)

// 分类
export const getCategories = () => request.get('/admin/categories')
export const createCategory = (data) => request.post('/admin/categories', data)
export const updateCategory = (id, data) => request.put(`/admin/categories/${id}`, data)
export const deleteCategory = (id) => request.delete(`/admin/categories/${id}`)

// 讲师
export const getTeachers = () => request.get('/admin/teachers')
export const createTeacher = (data) => request.post('/admin/teachers', data)
export const updateTeacher = (id, data) => request.put(`/admin/teachers/${id}`, data)
export const deleteTeacher = (id) => request.delete(`/admin/teachers/${id}`)

// 地点
export const getLocations = () => request.get('/admin/locations')
export const createLocation = (data) => request.post('/admin/locations', data)
export const updateLocation = (id, data) => request.put(`/admin/locations/${id}`, data)
export const deleteLocation = (id) => request.delete(`/admin/locations/${id}`)

// 轮播图
export const getBanners = () => request.get('/admin/banners')
export const createBanner = (data) => request.post('/admin/banners', data)
export const updateBanner = (id, data) => request.put(`/admin/banners/${id}`, data)
export const deleteBanner = (id) => request.delete(`/admin/banners/${id}`)

// 公告
export const getNotices = () => request.get('/admin/notices')
export const createNotice = (data) => request.post('/admin/notices', data)
export const updateNotice = (id, data) => request.put(`/admin/notices/${id}`, data)
export const deleteNotice = (id) => request.delete(`/admin/notices/${id}`)

// 消息推送
export const sendMessage = (data) => request.post('/admin/messages', data)
export const getMessages = (params) => request.get('/admin/messages', { params })

// 学员（管理端）
export const getStudents = (params) => request.get('/admin/students', { params })
export const getStudent = (id) => request.get(`/admin/students/${id}`)

// 文件上传
export const uploadFile = (file) => {
  const formData = new FormData()
  formData.append('file', file)
  return request.post('/admin/upload', formData, {
    headers: { 'Content-Type': 'multipart/form-data' }
  })
}
