import http from '@/utils/request.js'

// 微信小程序登录
// 开发模式：不传 code，后端会创建测试账号
export const wxLogin = (data = {}) => http.post('/auth/login', data)
