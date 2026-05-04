import { defineStore } from 'pinia'
import { ref, computed } from 'vue'
import { adminLogin as loginApi, getDashboard } from '@/api/index.js'
import router from '@/router/index.js'

export const useAdminStore = defineStore('admin', () => {
  const token = ref(localStorage.getItem('admin_token') || '')
  const user = ref(JSON.parse(localStorage.getItem('admin_user') || 'null'))

  const isLoggedIn = computed(() => !!token.value)

  const currentRoute = ref('/dashboard')

  // 数据总览统计（供侧边栏和顶栏使用）
  const dashboardStats = ref({ pendingCount: 0, warningCount: 0 })

  const pageTitles = {
    '/dashboard': '数据总览',
    '/courses': '课程管理',
    '/orders': '预约审核',
    '/students': '学员管理',
    '/teachers': '讲师管理',
    '/locations': '上课地点',
    '/categories': '分类管理',
    '/settings/banners': '轮播图配置',
    '/settings/notices': '公告管理',
    '/settings': '系统设置',
    '/push': '消息推送',
  }

  function setRoute(path) {
    currentRoute.value = path
  }

  function getTitle(path) {
    return pageTitles[path] || '数据总览'
  }

  async function fetchDashboardStats() {
    try {
      const data = await getDashboard()
      dashboardStats.value = {
        pendingCount: data?.pendingCount ?? 0,
        warningCount: data?.warningCount ?? 0,
      }
    } catch(e) {
      // silently fail
    }
  }

  async function login(username, password) {
    const res = await loginApi({ username, password })
    token.value = res.token
    user.value = res.user
    localStorage.setItem('admin_token', res.token)
    localStorage.setItem('admin_user', JSON.stringify(res.user))
    await fetchDashboardStats()
    return res
  }

  function logout() {
    token.value = ''
    user.value = null
    localStorage.removeItem('admin_token')
    localStorage.removeItem('admin_user')
    router.push('/login')
  }

  return { token, user, isLoggedIn, currentRoute, dashboardStats, setRoute, getTitle, fetchDashboardStats, login, logout }
})
