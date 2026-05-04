import { defineStore } from 'pinia'
import { ref, computed } from 'vue'
import { wxLogin } from '@/api/auth.js'

export const useUserStore = defineStore('user', () => {
  const token = ref(uni.getStorageSync('token') || '')
  const userInfo = ref(JSON.parse(uni.getStorageSync('userInfo') || 'null'))
  const isLoggedIn = ref(!!token.value)

  // 微信登录（开发环境：不传 code）
  async function login(nickname = '测试用户', avatar = '') {
    try {
      // 生产环境要先调用 wx.login 获取 code
      // const { code } = await uni.login()
      const res = await wxLogin({ nickname, avatar })
      token.value = res.token
      userInfo.value = res.user
      isLoggedIn.value = true
      uni.setStorageSync('token', res.token)
      uni.setStorageSync('userInfo', JSON.stringify(res.user))
      return res
    } catch(e) {
      console.error('Login failed:', e)
      throw e
    }
  }

  function logout() {
    token.value = ''
    userInfo.value = null
    isLoggedIn.value = false
    uni.removeStorageSync('token')
    uni.removeStorageSync('userInfo')
  }

  function getToken() {
    return token.value
  }

  function initFromStorage() {
    const t = uni.getStorageSync('token')
    const u = uni.getStorageSync('userInfo')
    if (t) { token.value = t; isLoggedIn.value = true }
    else { token.value = ''; isLoggedIn.value = false }
    if (u) { try { userInfo.value = JSON.parse(u) } catch(_) {} }
  }

  return { token, userInfo, isLoggedIn, login, logout, getToken, initFromStorage }
})
