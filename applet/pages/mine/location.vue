<template>
  <view class="page paper-bg">
    <!-- 状态栏占位 -->
    <view :style="{ height: statusBarHeight + 'px' }" />

    <!-- Nav -->
    <view class="nav-bar">
      <view class="back-btn" @tap="uni.navigateBack()">
        <SvgIcon name="chevron-left" :color="'var(--ink)'" :size="28" />
      </view>
      <text class="nav-title">地址导航</text>
      <view style="width: 72rpx;" />
    </view>

    <!-- Map placeholder -->
    <view class="map-area">
      <!-- 装饰线条用 CSS 伪元素实现 -->
      <view class="map-road map-road-1" />
      <view class="map-road map-road-2" />
      <view class="map-road map-road-3" />
      <!-- 图钉标记 -->
      <view class="map-pin-wrap">
        <view class="map-pin-outer">
          <view class="map-pin-inner" />
        </view>
        <view class="map-pin-tail" />
      </view>
      <!-- 标签 -->
      <view class="map-label">
        <SvgIcon name="pin" color="#5A4F44" :size="28" />
        <text class="map-label-text">安然画室 · 立即导航</text>
      </view>
    </view>

    <!-- Location cards -->
    <scroll-view scroll-y class="scroll-content">
      <view style="padding: 32rpx;">
        <view
          v-for="(loc, i) in locations"
          :key="i"
          class="loc-card card"
          :class="{ active: loc.active }"
        >
          <view class="loc-header">
            <view class="loc-icon-wrap" :style="{ background: loc.color + '22' }">
              <SvgIcon name="pin" :color="loc.color" :size="36" />
            </view>
            <view style="flex:1; min-width:0;">
              <text class="loc-name">{{ loc.name }}</text>
              <text
                class="loc-status"
                :style="loc.status === '营业中'
                  ? 'background:#C7D1B6;color:#4F5F42;'
                  : 'background:rgba(232,184,96,0.2);color:#8A6520;'"
              >{{ loc.status }}</text>
            </view>
            <text v-if="loc.active" class="active-label">当前校区</text>
          </view>

          <text class="loc-address">{{ loc.address }}</text>
          <text class="loc-tel">{{ loc.tel }}</text>

          <view class="loc-actions">
            <view class="nav-btn" @tap="navigate(loc)">
              <SvgIcon name="pin" color="#FFFCF5" :size="28" />
              <text class="nav-btn-text">立即导航</text>
            </view>
            <view class="call-btn" @tap="callPhone(loc)">
              <SvgIcon name="phone" color="#5A4F44" :size="28" />
            </view>
          </view>
        </view>
      </view>
    </scroll-view>
  </view>
</template>

<script setup>
import { ref, onMounted } from 'vue'
import { getLocations } from '@/api/course.js'
import SvgIcon from '@/components/SvgIcon.vue'

const statusBarHeight = ref(44)

const locations = ref([])

onMounted(async () => {
  const info = uni.getSystemInfoSync()
  statusBarHeight.value = info.statusBarHeight || 44

  try {
    const res = await getLocations()
    if (res?.length > 0) {
      locations.value = res.map((loc, i) => ({
        name:      loc.name,
        status:    loc.status || '营业中',
        address:   loc.address,
        tel:       loc.contact || loc.phone || loc.tel || '',
        color:     ['#D97757', '#6B7F5A', '#E8B860'][i % 3],
        active:    i === 0,
        longitude: loc.longitude,
        latitude:  loc.latitude,
      }))
      return
    }
  } catch(e) {
    console.error('locations error:', e)
  }
  // 默认数据
  locations.value = [{
    name: '安然画室', status: '营业中',
    address: '杭州市西湖区文化路388号3楼',
    tel: '0571-8888-2026',
    color: '#D97757', active: true,
    longitude: 120.1551, latitude: 30.2741,
  }]
})

function navigate(loc) {
  uni.openLocation({
    longitude: loc.longitude || 120.1551,
    latitude:  loc.latitude  || 30.2741,
    name:      `安然画室·${loc.name}`,
    address:   loc.address,
  })
}

function callPhone(loc) {
  if (loc.tel) {
    uni.makePhoneCall({ phoneNumber: loc.tel.replace(/-/g, '') })
  }
}
</script>

<style lang="scss" scoped>
.page {
  min-height: 100vh;
  display: flex;
  flex-direction: column;
  overflow-x: hidden;
}

.nav-bar {
  height: 88rpx;
  display: flex;
  align-items: center;
  justify-content: space-between;
  padding: 0 16rpx;
}

.back-btn {
  width: 72rpx;
  height: 72rpx;
  display: flex;
  align-items: center;
  justify-content: center;
}

.back-icon {
  font-size: 52rpx;
  color: var(--ink);
  font-weight: 300;
  line-height: 1;
  margin-top: -4rpx;
}

.nav-title {
  font-size: 32rpx;
  font-weight: 600;
  color: var(--ink);
}

/* 地图区域 */
.map-area {
  height: 400rpx;
  position: relative;
  overflow: hidden;
  background:
    linear-gradient(rgba(255,255,255,0.4) 1px, transparent 1px),
    linear-gradient(90deg, rgba(255,255,255,0.4) 1px, transparent 1px),
    linear-gradient(135deg, #E8DFC8 0%, #DDD0B0 100%);
  background-size: 24px 24px, 24px 24px, 100% 100%;
}

/* CSS 装饰道路（替代 SVG path） */
.map-road {
  position: absolute;
  background: rgba(255,255,255,0.55);
  border-radius: 99rpx;
}
.map-road-1 {
  width: 130%;
  height: 20rpx;
  top: 48%;
  left: -15%;
  transform: rotate(-2deg);
}
.map-road-2 {
  width: 16rpx;
  height: 120%;
  left: 46%;
  top: -10%;
  transform: rotate(3deg);
  background: rgba(255,255,255,0.45);
}
.map-road-3 {
  width: 130%;
  height: 12rpx;
  top: 68%;
  left: -15%;
  transform: rotate(-1deg);
  background: rgba(255,255,255,0.35);
}

/* 图钉 */
.map-pin-wrap {
  position: absolute;
  left: 50%;
  top: 50%;
  transform: translate(-50%, -100%);
  display: flex;
  flex-direction: column;
  align-items: center;
}
.map-pin-outer {
  width: 56rpx;
  height: 56rpx;
  border-radius: 50% 50% 50% 0;
  background: #D97757;
  transform: rotate(-45deg);
  box-shadow: 0 4rpx 16rpx rgba(217,119,87,0.45);
  display: flex;
  align-items: center;
  justify-content: center;
}
.map-pin-inner {
  width: 22rpx;
  height: 22rpx;
  border-radius: 50%;
  background: #FFFCF5;
  transform: rotate(45deg);
}
.map-pin-tail {
  width: 0;
  height: 0;
  border-left: 10rpx solid transparent;
  border-right: 10rpx solid transparent;
  border-top: 16rpx solid #D97757;
  margin-top: -2rpx;
}

/* 地图底部标签 */
.map-label {
  position: absolute;
  bottom: 24rpx;
  left: 50%;
  transform: translateX(-50%);
  background: rgba(255,252,245,0.92);
  padding: 12rpx 28rpx;
  border-radius: 999rpx;
  display: flex;
  align-items: center;
  gap: 10rpx;
  backdrop-filter: blur(10px);
}
.map-label-text {
  font-size: 22rpx;
  color: #5A4F44;
  white-space: nowrap;
}

.scroll-content {
  flex: 1;
  overflow-x: hidden;
}

/* 地点卡片 */
.loc-card {
  border-radius: 24rpx;
  padding: 28rpx;
  margin-bottom: 20rpx;
  transition: box-shadow 0.2s;

  &.active {
    border-color: var(--primary) !important;
    box-shadow: 0 0 0 4rpx var(--primary-soft);
  }
}

.loc-header {
  display: flex;
  align-items: center;
  gap: 16rpx;
  margin-bottom: 16rpx;
}

.loc-icon-wrap {
  width: 64rpx;
  height: 64rpx;
  border-radius: 16rpx;
  display: flex;
  align-items: center;
  justify-content: center;
  flex-shrink: 0;
}

.loc-name {
  display: block;
  font-size: 30rpx;
  font-weight: 700;
  color: var(--ink);
  margin-bottom: 6rpx;
}

.loc-status {
  font-size: 22rpx;
  padding: 3rpx 14rpx;
  border-radius: 999rpx;
}

.active-label {
  font-size: 20rpx;
  color: var(--primary);
  font-weight: 600;
  flex-shrink: 0;
}

.loc-address {
  display: block;
  font-size: 26rpx;
  color: var(--ink-2);
  line-height: 1.6;
  margin-bottom: 8rpx;
}

.loc-tel {
  display: block;
  font-size: 24rpx;
  color: var(--ink-3);
  font-family: monospace;
  margin-bottom: 24rpx;
}

.loc-actions {
  display: flex;
  gap: 16rpx;
}

.nav-btn {
  flex: 1;
  height: 72rpx;
  border-radius: 16rpx;
  background: var(--primary);
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 12rpx;
  box-shadow: 0 4rpx 16rpx rgba(217,119,87,0.28);
}

.nav-btn-text {
  font-size: 26rpx;
  color: #FFFCF5;
  font-weight: 600;
}

.call-btn {
  width: 72rpx;
  height: 72rpx;
  border-radius: 16rpx;
  border: 1rpx solid var(--line);
  background: var(--card);
  display: flex;
  align-items: center;
  justify-content: center;
}
</style>
