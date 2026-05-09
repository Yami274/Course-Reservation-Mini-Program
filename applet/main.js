import App from './App'

// #ifndef VUE3
import Vue from 'vue'
import './uni.promisify.adaptor'
Vue.config.productionTip = false
App.mpType = 'app'
const app = new Vue({
  ...App
})
app.$mount()
// #endif

// #ifdef VUE3
import { createSSRApp } from 'vue'
import { createPinia } from 'pinia'

// 需要登录才能访问的页面前缀
const AUTH_PAGES = [
  '/pages/order/list',
  '/pages/order/create',
  '/pages/order/detail',
  '/pages/order/success',
  '/pages/mine/students',
  '/pages/mine/notifications',
  '/pages/mine/favorites',
  '/pages/admin/dashboard',
  '/pages/admin/orders',
]

function isProtected(url) {
  const path = url.split('?')[0]
  return AUTH_PAGES.some(p => path.startsWith(p))
}

function isLoggedIn() {
  return !!uni.getStorageSync('token')
}

// 跳转到登录页，保存来源 URL 以便登录后返回
function redirectToLogin(url) {
  uni.setStorageSync('loginRedirect', url)
  uni.navigateTo({ url: '/pages/login/index' })
}

// 拦截所有导航，对受保护页面做鉴权
const navInterceptor = {
  invoke(args) {
    if (isProtected(args.url) && !isLoggedIn()) {
      redirectToLogin(args.url)
      return false
    }
  },
}

uni.addInterceptor('navigateTo', navInterceptor)
uni.addInterceptor('redirectTo', navInterceptor)

// switchTab 的 mine 标签需要单独处理（tabBar 页面无法用 navigateTo）
uni.addInterceptor('switchTab', {
  invoke(args) {
    const path = args.url.split('?')[0]
    // mine 标签页本身可以访问（内部组件按需鉴权），不在此拦截
    return true
  },
})

export function createApp() {
  const app = createSSRApp(App)
  const pinia = createPinia()
  app.use(pinia)
  return {
    app,
    pinia
  }
}
// #endif
