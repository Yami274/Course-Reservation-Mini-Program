<template>
  <view class="login-page">
    <!-- 状态栏占位 -->
    <view :style="{ height: statusBarHeight + 'px' }" />

    <!-- 稍后登录 -->
    <view class="skip-btn" @tap="skip">稍后登录 ›</view>

    <!-- 装饰背景 blobs -->
    <view class="blob blob-orange" />
    <view class="blob blob-moss" />

    <!-- Hero 区域 -->
    <view class="hero">
      <view class="logo-wrap">
        <view class="logo-box">
          <text class="logo-char">安</text>
          <view class="logo-dot" />
        </view>
      </view>
      <view class="hero-copy">
        <text class="hero-title">你好，</text>
        <text class="hero-title">欢迎来到
          <text class="highlight">安然画室</text>
        </text>
        <text class="hero-sub">线下绘画课 · 用心做教育 · 八年陪伴</text>
      </view>
    </view>

    <!-- 数据亮点 -->
    <view class="stats-row">
      <view class="stat-item" v-for="s in stats" :key="s.label">
        <text class="stat-icon">{{ s.icon }}</text>
        <text class="stat-text">{{ s.label }}</text>
      </view>
    </view>

    <!-- 登录操作区 -->
    <view class="cta-area">

      <!-- 微信一键登录 -->
      <view
        class="btn btn-wechat btn-press"
        :class="{ loading: loadingKind === 'wechat', disabled: loadingKind && loadingKind !== 'wechat' }"
        @tap="loginByWechat"
      >
        <view v-if="loadingKind === 'wechat'" class="spinner spinner-light" />
        <view v-else class="wechat-icon">
          <!-- 微信气泡图标 -->
          <view class="wx-bubble wx-bubble-big" />
          <view class="wx-bubble wx-bubble-small" />
        </view>
        <text class="btn-text">{{ loadingKind === 'wechat' ? '登录中…' : '微信一键登录' }}</text>
      </view>

      <!-- 手机号一键登录（必须用 button open-type） -->
      <button
        class="btn btn-phone btn-press"
        :class="{ loading: loadingKind === 'phone', disabled: loadingKind && loadingKind !== 'phone' }"
        open-type="getPhoneNumber"
        @getphonenumber="onGetPhoneNumber"
        :disabled="!!loadingKind"
      >
        <view v-if="loadingKind === 'phone'" class="spinner spinner-dark" />
        <view v-else class="phone-icon">
          <view class="phone-body" />
          <view class="phone-home" />
        </view>
        <text class="btn-text btn-text-dark">{{ loadingKind === 'phone' ? '获取手机号中…' : '本机号码一键登录' }}</text>
      </button>

      <!-- 分隔线 -->
      <view class="divider">
        <view class="divider-line" />
        <text class="divider-text">其他方式</text>
        <view class="divider-line" />
      </view>

      <!-- 协议勾选 -->
      <view class="terms-row" @tap="toggleAgreed">
        <view class="checkbox" :class="{ checked: agreed }">
          <text v-if="agreed" class="check-mark">✓</text>
        </view>
        <text class="terms-text">
          登录即代表已阅读并同意
          <text class="terms-link">《用户协议》</text>
          和
          <text class="terms-link">《隐私政策》</text>
        </text>
      </view>
    </view>
  </view>
</template>

<script setup>
import { ref, onMounted } from 'vue'
import { useUserStore } from '@/stores/user.js'

const userStore = useUserStore()

const statusBarHeight = ref(0)
const agreed = ref(false)
const loadingKind = ref(null) // 'wechat' | 'phone' | null

const stats = [
  { icon: '🎨', label: '9 门课程' },
  { icon: '📍', label: '3 个场馆' },
  { icon: '👩‍🎨', label: '4 位讲师' },
]

onMounted(() => {
  const info = uni.getSystemInfoSync()
  statusBarHeight.value = info.statusBarHeight || 44
})

function toggleAgreed() {
  agreed.value = !agreed.value
}

function checkAgreed() {
  if (!agreed.value) {
    uni.showToast({ title: '请先勾选用户协议', icon: 'none' })
    return false
  }
  return true
}

async function loginByWechat() {
  if (!checkAgreed() || loadingKind.value) return
  loadingKind.value = 'wechat'
  try {
    await userStore.loginByWechat()
    navigateBack()
  } catch (e) {
    uni.showToast({ title: e?.message || '微信登录失败，请重试', icon: 'none' })
  } finally {
    loadingKind.value = null
  }
}

async function onGetPhoneNumber(e) {
  if (!checkAgreed()) return
  // 用户拒绝授权
  if (e.detail.errMsg && !e.detail.errMsg.includes('ok')) {
    uni.showToast({ title: '已取消手机号授权', icon: 'none' })
    return
  }
  const { code, encryptedData, iv } = e.detail
  if (!code && !encryptedData) {
    uni.showToast({ title: '获取手机号失败', icon: 'none' })
    return
  }
  loadingKind.value = 'phone'
  try {
    await userStore.loginByPhone({ code, encryptedData, iv })
    navigateBack()
  } catch (err) {
    uni.showToast({ title: err?.message || '手机号登录失败，请重试', icon: 'none' })
  } finally {
    loadingKind.value = null
  }
}

function skip() {
  navigateBack()
}

function navigateBack() {
  // 优先返回来源页，若无则回首页
  const pages = getCurrentPages()
  if (pages.length > 1) {
    uni.navigateBack()
  } else {
    const redirect = uni.getStorageSync('loginRedirect')
    uni.removeStorageSync('loginRedirect')
    if (redirect) {
      uni.navigateTo({ url: redirect })
    } else {
      uni.reLaunch({ url: '/pages/index/index' })
    }
  }
}
</script>

<style scoped>
.login-page {
  position: relative;
  min-height: 100vh;
  background-color: #F5EDE0;
  background-image:
    radial-gradient(circle at 20% 30%, rgba(217,119,87,0.08), transparent 40%),
    radial-gradient(circle at 80% 70%, rgba(107,127,90,0.06), transparent 40%);
  overflow: hidden;
  display: flex;
  flex-direction: column;
}

/* 装饰 blobs */
.blob {
  position: absolute;
  border-radius: 50%;
  pointer-events: none;
}
.blob-orange {
  width: 320rpx;
  height: 320rpx;
  background: rgba(217,119,87,0.14);
  top: -60rpx;
  right: -80rpx;
}
.blob-moss {
  width: 280rpx;
  height: 280rpx;
  background: rgba(107,127,90,0.12);
  bottom: 200rpx;
  left: -80rpx;
}

/* 稍后登录 */
.skip-btn {
  position: absolute;
  top: 100rpx;
  right: 36rpx;
  z-index: 10;
  font-size: 24rpx;
  color: #8A7E70;
  padding: 12rpx 24rpx;
  border-radius: 999rpx;
  background: rgba(255,252,245,0.7);
}

/* Hero */
.hero {
  flex: 1;
  padding: 120rpx 48rpx 48rpx;
  display: flex;
  flex-direction: column;
  gap: 28rpx;
  position: relative;
  z-index: 2;
}

.logo-wrap {
  display: flex;
}

.logo-box {
  position: relative;
  width: 156rpx;
  height: 156rpx;
  border-radius: 48rpx;
  background: #D97757;
  display: flex;
  align-items: center;
  justify-content: center;
  box-shadow: 0 24rpx 56rpx rgba(217,119,87,0.35), inset 0 4rpx 0 rgba(255,255,255,0.25);
  transform: rotate(-4deg);
}

.logo-char {
  font-size: 76rpx;
  font-weight: 700;
  color: #FFFCF5;
  font-family: serif;
}

.logo-dot {
  position: absolute;
  top: -12rpx;
  right: -12rpx;
  width: 28rpx;
  height: 28rpx;
  border-radius: 50%;
  background: #6B7F5A;
  border: 4rpx solid #F5EDE0;
}

.hero-copy {
  display: flex;
  flex-direction: column;
  gap: 8rpx;
}

.hero-title {
  font-size: 60rpx;
  font-weight: 700;
  color: #2A2520;
  line-height: 1.2;
  font-family: 'Noto Serif SC', serif;
}

.highlight {
  color: #B5573A;
}

.hero-sub {
  font-size: 28rpx;
  color: #8A7E70;
  margin-top: 20rpx;
}

/* 数据统计 */
.stats-row {
  display: flex;
  gap: 44rpx;
  padding: 0 48rpx 32rpx;
  position: relative;
  z-index: 2;
}

.stat-item {
  display: flex;
  align-items: center;
  gap: 10rpx;
}

.stat-icon {
  font-size: 28rpx;
}

.stat-text {
  font-size: 24rpx;
  color: #5A4F44;
}

/* CTA 区域 */
.cta-area {
  padding: 40rpx 48rpx 64rpx;
  display: flex;
  flex-direction: column;
  gap: 0;
  position: relative;
  z-index: 2;
}

/* 通用按钮 */
.btn {
  width: 100%;
  height: 104rpx;
  border-radius: 32rpx;
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 20rpx;
  font-size: 30rpx;
  font-weight: 600;
  transition: transform 0.12s ease, opacity 0.15s ease;
  border: none;
  margin: 0;
  padding: 0;
}

.btn-press:active {
  transform: scale(0.96);
}

.btn.disabled {
  opacity: 0.45;
}

/* 微信登录按钮 */
.btn-wechat {
  background: #6B7F5A;
  box-shadow: 0 16rpx 40rpx rgba(107,127,90,0.32);
  margin-bottom: 24rpx;
}

/* 微信图标（两个气泡） */
.wechat-icon {
  position: relative;
  width: 44rpx;
  height: 36rpx;
}

.wx-bubble {
  position: absolute;
  border-radius: 50%;
  background: rgba(255,252,245,0.9);
}

.wx-bubble-big {
  width: 32rpx;
  height: 28rpx;
  top: 0;
  left: 0;
  border-radius: 16rpx;
}

.wx-bubble-small {
  width: 24rpx;
  height: 22rpx;
  bottom: 0;
  right: 0;
  border-radius: 12rpx;
}

/* 手机号登录按钮 */
.btn-phone {
  background: #FFFCF5;
  border: 2rpx solid rgba(42,37,32,0.12);
  color: #2A2520;
  margin-bottom: 32rpx;
  line-height: 1;
}

/* 手机图标 */
.phone-icon {
  position: relative;
  width: 36rpx;
  height: 44rpx;
}

.phone-body {
  width: 36rpx;
  height: 44rpx;
  border: 3rpx solid #5A4F44;
  border-radius: 8rpx;
  position: absolute;
  top: 0;
  left: 0;
}

.phone-home {
  width: 14rpx;
  height: 4rpx;
  background: #5A4F44;
  border-radius: 2rpx;
  position: absolute;
  bottom: 8rpx;
  left: 50%;
  transform: translateX(-50%);
}

.btn-text {
  color: #FFFCF5;
}

.btn-text-dark {
  color: #2A2520;
}

/* Loading spinner */
.spinner {
  width: 32rpx;
  height: 32rpx;
  border-radius: 50%;
  animation: spin 0.9s linear infinite;
}

.spinner-light {
  border: 4rpx solid rgba(255,252,245,0.35);
  border-top-color: #FFFCF5;
}

.spinner-dark {
  border: 4rpx solid rgba(42,37,32,0.18);
  border-top-color: #2A2520;
}

@keyframes spin {
  to { transform: rotate(360deg); }
}

/* 分隔线 */
.divider {
  display: flex;
  align-items: center;
  gap: 24rpx;
  margin-bottom: 32rpx;
}

.divider-line {
  flex: 1;
  height: 1rpx;
  background: rgba(42,37,32,0.10);
}

.divider-text {
  font-size: 22rpx;
  color: #8A7E70;
  white-space: nowrap;
}

/* 协议勾选 */
.terms-row {
  display: flex;
  align-items: flex-start;
  gap: 16rpx;
}

.checkbox {
  flex-shrink: 0;
  width: 32rpx;
  height: 32rpx;
  border-radius: 50%;
  border: 3rpx solid #8A7E70;
  background: transparent;
  display: flex;
  align-items: center;
  justify-content: center;
  margin-top: 4rpx;
  transition: all 0.15s ease;
}

.checkbox.checked {
  background: #D97757;
  border-color: #D97757;
}

.check-mark {
  font-size: 20rpx;
  color: #FFFCF5;
  font-weight: 700;
}

.terms-text {
  font-size: 22rpx;
  color: #8A7E70;
  line-height: 1.6;
  flex: 1;
}

.terms-link {
  color: #B5573A;
}
</style>
