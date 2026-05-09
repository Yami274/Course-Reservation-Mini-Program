/**
 * 安然画室 - HTTP 请求封装
 * 基于 uni.request 的统一请求工具，支持 JWT 认证、拦截器、加载状态
 */

// 基础配置
const BASE_URL = 'http://localhost:3000/api'
const TIMEOUT = 15000

// 加载状态管理
let loadingCount = 0

function showLoading(msg = '加载中...') {
  loadingCount++
  if (loadingCount === 1) {
    uni.showLoading({ title: msg, mask: true })
  }
}

function hideLoading() {
  loadingCount--
  if (loadingCount <= 0) {
    loadingCount = 0
    uni.hideLoading()
  }
}

// 获取存储的 token
function getToken() {
  return uni.getStorageSync('token') || ''
}

// 统一错误处理
function handleError(statusCode, data) {
  switch (statusCode) {
    case 401:
      uni.removeStorageSync('token')
      uni.removeStorageSync('userInfo')
      uni.showToast({ title: '登录已过期，请重新登录', icon: 'none' })
      setTimeout(() => {
        uni.navigateTo({ url: '/pages/login/index' })
      }, 1500)
      break
    case 403:
      uni.showToast({ title: '没有权限访问', icon: 'none' })
      break
    case 404:
      uni.showToast({ title: '请求的资源不存在', icon: 'none' })
      break
    case 500:
      uni.showToast({ title: '服务器错误，请稍后重试', icon: 'none' })
      break
    default:
      uni.showToast({ title: data?.message || '网络异常，请稍后重试', icon: 'none' })
  }
}

/**
 * 核心请求函数
 * @param {Object} options - 请求配置
 * @param {string} options.url - 请求路径（自动拼接 BASE_URL）
 * @param {string} [options.method='GET'] - 请求方法
 * @param {Object} [options.data] - 请求数据
 * @param {Object} [options.header] - 自定义请求头
 * @param {boolean} [options.showLoad=true] - 是否显示加载动画
 * @param {string} [options.loadingText] - 加载文字
 * @param {boolean} [options.showError=true] - 是否自动弹出错误提示
 */
function request(options = {}) {
  const {
    url,
    method = 'GET',
    data,
    header = {},
    showLoad = true,
    loadingText,
    showError = true,
  } = options

  const token = getToken()

  // 请求拦截：添加公共请求头
  const requestHeader = {
    'Content-Type': 'application/json',
    ...(token ? { 'Authorization': `Bearer ${token}` } : {}),
    ...header,
  }

  if (showLoad) {
    showLoading(loadingText)
  }

  return new Promise((resolve, reject) => {
    uni.request({
      url: BASE_URL + url,
      method,
      data,
      header: requestHeader,
      timeout: TIMEOUT,
      success: (res) => {
        const { statusCode, data: resData } = res

        if (statusCode >= 200 && statusCode < 300) {
          // 业务成功
          if (resData?.code === 0 || resData?.success) {
            resolve(resData?.data ?? resData)
          } else {
            // 业务层错误
            if (showError) {
              uni.showToast({ title: resData?.message || '操作失败', icon: 'none' })
            }
            reject(resData)
          }
        } else {
          // HTTP 错误
          if (showError) {
            handleError(statusCode, resData)
          }
          reject(resData)
        }
      },
      fail: (err) => {
        if (showError) {
          uni.showToast({ title: '网络连接失败，请检查网络', icon: 'none' })
        }
        reject(err)
      },
      complete: () => {
        if (showLoad) {
          hideLoading()
        }
      },
    })
  })
}

// 便捷方法
export const http = {
  get: (url, data, options = {}) =>
    request({ url, method: 'GET', data, ...options }),

  post: (url, data, options = {}) =>
    request({ url, method: 'POST', data, ...options }),

  put: (url, data, options = {}) =>
    request({ url, method: 'PUT', data, ...options }),

  delete: (url, data, options = {}) =>
    request({ url, method: 'DELETE', data, ...options }),

  upload: (url, filePath, formData = {}) => {
    const token = getToken()
    return new Promise((resolve, reject) => {
      showLoading('上传中...')
      uni.uploadFile({
        url: BASE_URL + url,
        filePath,
        name: 'file',
        formData,
        header: token ? { 'Authorization': `Bearer ${token}` } : {},
        success: (res) => {
          try {
            const data = JSON.parse(res.data)
            resolve(data)
          } catch (e) {
            resolve(res.data)
          }
        },
        fail: (err) => {
          uni.showToast({ title: '上传失败', icon: 'none' })
          reject(err)
        },
        complete: () => hideLoading(),
      })
    })
  },
}

export default http
