import { defineStore } from 'pinia'
import { ref } from 'vue'
import { wxLogin, phoneLogin } from '@/api/auth.js'

export const useUserStore = defineStore('user', () => {
  const token = ref(uni.getStorageSync('token') || '')
  const userInfo = ref(JSON.parse(uni.getStorageSync('userInfo') || 'null'))
  const isLoggedIn = ref(!!token.value)

  function _persist(tokenVal, userVal) {
    token.value = tokenVal
    userInfo.value = userVal
    isLoggedIn.value = true
    uni.setStorageSync('token', tokenVal)
    uni.setStorageSync('userInfo', JSON.stringify(userVal))
  }

  // 微信一键登录：调用 uni.login 获取 code → 后端换 openid → JWT
  async function loginByWechat() {
    const { code } = await uni.login()
    const res = await wxLogin({ code })
    _persist(res.token, res.user)
    return res
  }

  // 手机号一键登录：由 <button open-type="getPhoneNumber"> 回调触发
  // code 是新版手机号 API 的凭证（base library 2.21.2+）
  // encryptedData/iv 是旧版解密参数（兼容备用）
  async function loginByPhone({ code, encryptedData, iv }) {
    const res = await phoneLogin({ code, encryptedData, iv })
    _persist(res.token, res.user)
    return res
  }

  // 开发模式快速登录（后端未配置微信凭据时使用）
  async function login(nickname = '测试用户', avatar = '') {
    const res = await wxLogin({ nickname, avatar })
    _persist(res.token, res.user)
    return res
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
    if (u) { try { userInfo.value = JSON.parse(u) } catch (_) {} }
  }

  return { token, userInfo, isLoggedIn, login, loginByWechat, loginByPhone, logout, getToken, initFromStorage }
})
