import http from '@/utils/request.js'

// 微信小程序登录（生产：传 code；开发：可传 nickname/avatar）
export const wxLogin = (data = {}) => http.post('/auth/login', data)

// 手机号一键登录
// code: 新版 getPhoneNumber 返回的凭证（2.21.2+）
// encryptedData/iv: 旧版解密参数（兼容备用）
export const phoneLogin = (data = {}) => http.post('/auth/phone-login', data)
