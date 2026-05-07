<template>
  <view class="page">
    <view class="status-bar" :style="{ height: statusBarHeight + 'px' }"></view>

    <view class="nav-bar">
      <view class="back-btn" @tap="goBack">
        <SvgIcon name="chevron-left" :color="'var(--ink)'" :size="28" />
      </view>
      <text class="nav-title">我的收藏</text>
      <view style="width: 64rpx;"></view>
    </view>

    <scroll-view scroll-y class="scroll-content" :style="{ height: scrollHeight + 'px' }">

      <view v-if="loading" class="loading-state">
        <text class="loading-text">加载中…</text>
      </view>

      <view v-else-if="favorites.length === 0" class="empty-state">
        <text class="empty-emoji">🌟</text>
        <text class="empty-title">还没有收藏</text>
        <text class="empty-sub">浏览课程时点击收藏，方便下次查找</text>
        <view class="go-btn" @tap="toCourseList">浏览课程</view>
      </view>

      <view v-else class="course-list">
        <view
          v-for="item in favorites"
          :key="item.id"
          class="course-card"
          @tap="toCourseDetail(item)"
        >
          <view class="thumb" :style="{ background: item.thumbBg || '#F2C9B5' }">
            <image
              v-if="item.cover"
              class="thumb-img"
              :src="item.cover"
              mode="aspectFill"
            />
            <view v-if="item.isHot" class="hot-badge">HOT</view>
          </view>

          <view class="card-info">
            <view class="info-top">
              <text class="course-name">{{ item.name || item.course_name }}</text>
              <view class="fav-btn" @tap.stop="removeFavorite(item)">
                <text class="fav-icon">♥</text>
              </view>
            </view>

            <view class="tags-row">
              <view class="cat-tag" v-if="item.category">{{ item.category }}</view>
              <text class="teacher-name" v-if="item.teacherName || item.teacher_name">
                {{ item.teacherName || item.teacher_name }}
              </text>
            </view>

            <view class="info-bottom">
              <text class="age-range" v-if="item.ageRange || item.age_range">
                {{ item.ageRange || item.age_range }}
              </text>
              <text class="price-text">{{ item.priceText || formatPrice(item.price) }}</text>
            </view>
          </view>
        </view>
      </view>

      <view class="bottom-space"></view>
    </scroll-view>
  </view>
</template>

<script setup>
import { ref, onMounted } from 'vue'
import { onShow } from '@dcloudio/uni-app'
import http from '@/utils/request.js'
import SvgIcon from '@/components/SvgIcon.vue'

const statusBarHeight = ref(44)
const scrollHeight = ref(600)
const loading = ref(false)
const favorites = ref([])

const thumbColors = ['#F2C9B5', '#C7D1B6', '#B5D4E2', '#F9E0A2', '#D4B5E8']

onMounted(() => {
  const info = uni.getSystemInfoSync()
  statusBarHeight.value = info.statusBarHeight || 44
  scrollHeight.value = info.windowHeight - statusBarHeight.value - 44
})

onShow(() => {
  loadFavorites()
})

async function loadFavorites() {
  loading.value = true
  try {
    // Try API first (reserved endpoint), fall back to localStorage
    try {
      const res = await http.get('/favorites', null, { showLoad: false, showError: false })
      const list = res?.list || res || []
      if (list.length > 0) {
        favorites.value = list.map((item, i) => ({
          ...item,
          thumbBg: item.thumbBg || thumbColors[i % thumbColors.length],
        }))
        loading.value = false
        return
      }
    } catch(e) { /* fallback to localStorage */ }

    // Load from localStorage
    const stored = JSON.parse(uni.getStorageSync('favorites') || '[]')
    favorites.value = stored.map((item, i) => ({
      ...item,
      thumbBg: item.thumbBg || thumbColors[i % thumbColors.length],
    }))
  } catch(e) {
    console.error('favorites error:', e)
    favorites.value = []
  } finally {
    loading.value = false
  }
}

function formatPrice(price) {
  if (!price) return ''
  return `¥${price}`
}

async function removeFavorite(item) {
  uni.showModal({
    title: '取消收藏',
    content: `确定取消收藏"${item.name || item.course_name}"吗？`,
    confirmText: '确认',
    confirmColor: '#D97757',
    success: async (res) => {
      if (res.confirm) {
        // Remove from localStorage
        const stored = JSON.parse(uni.getStorageSync('favorites') || '[]')
        const updated = stored.filter(f => String(f.id) !== String(item.id))
        uni.setStorageSync('favorites', JSON.stringify(updated))
        favorites.value = favorites.value.filter(f => f.id !== item.id)
        uni.showToast({ title: '已取消收藏', icon: 'success' })
      }
    },
  })
}

function toCourseDetail(item) {
  const courseId = item.courseId || item.course_id || item.id
  uni.navigateTo({ url: `/pages/course/detail?id=${courseId}` })
}

function toCourseList() {
  uni.reLaunch({ url: '/pages/index/index?tab=1' })
}

function goBack() {
  uni.navigateBack()
}
</script>

<style lang="scss" scoped>
.page {
  min-height: 100vh;
  background: var(--paper);
  overflow-x: hidden;
}

.status-bar {
  background: var(--paper-2);
}

.nav-bar {
  display: flex;
  align-items: center;
  justify-content: space-between;
  padding: 12rpx 32rpx 16rpx;
  background: var(--paper-2);
}

.back-btn {
  width: 64rpx;
  height: 64rpx;
  display: flex;
  align-items: center;
  justify-content: center;
}

.back-icon {
  font-size: 48rpx;
  color: var(--ink);
  font-weight: 300;
}

.nav-title {
  font-size: 34rpx;
  font-weight: 800;
  color: var(--ink);
}

.scroll-content {
  width: 100%;
  overflow-y: scroll;
  overflow-x: hidden;
}

/* Loading */
.loading-state {
  display: flex;
  align-items: center;
  justify-content: center;
  padding: 120rpx 32rpx;
}

.loading-text {
  font-size: 28rpx;
  color: var(--ink-3);
}

/* Empty */
.empty-state {
  display: flex;
  flex-direction: column;
  align-items: center;
  padding: 120rpx 32rpx;
  gap: 16rpx;
}

.empty-emoji {
  font-size: 80rpx;
}

.empty-title {
  font-size: 32rpx;
  font-weight: 700;
  color: var(--ink);
}

.empty-sub {
  font-size: 26rpx;
  color: var(--ink-3);
  text-align: center;
  line-height: 1.6;
}

.go-btn {
  margin-top: 16rpx;
  background: var(--primary);
  color: #fff;
  font-size: 28rpx;
  font-weight: 600;
  padding: 20rpx 48rpx;
  border-radius: 20rpx;
  box-shadow: 0 4rpx 16rpx rgba(217, 119, 87, 0.3);
}

/* Course List */
.course-list {
  padding: 24rpx 32rpx;
  display: flex;
  flex-direction: column;
  gap: 16rpx;
}

.course-card {
  background: var(--card);
  border-radius: 24rpx;
  overflow: hidden;
  box-shadow: 0 2rpx 16rpx rgba(42, 37, 32, 0.06);
  display: flex;
  transition: transform 0.15s;

  &:active {
    transform: scale(0.99);
  }
}

.thumb {
  width: 180rpx;
  flex-shrink: 0;
  position: relative;
  min-height: 180rpx;
  overflow: hidden;
}

.thumb-img {
  position: absolute;
  top: 0; right: 0; bottom: 0; left: 0;
  width: 100%;
  height: 100%;
}

.hot-badge {
  position: absolute;
  top: 12rpx;
  left: 12rpx;
  background: var(--primary);
  color: #fff;
  font-size: 18rpx;
  font-weight: 700;
  padding: 4rpx 12rpx;
  border-radius: 8rpx;
}

.card-info {
  flex: 1;
  padding: 20rpx 24rpx;
  display: flex;
  flex-direction: column;
  gap: 10rpx;
  min-width: 0;
}

.info-top {
  display: flex;
  align-items: flex-start;
  justify-content: space-between;
  gap: 8rpx;
}

.course-name {
  flex: 1;
  font-size: 28rpx;
  font-weight: 700;
  color: var(--ink);
  line-height: 1.4;
}

.fav-btn {
  width: 52rpx;
  height: 52rpx;
  display: flex;
  align-items: center;
  justify-content: center;
  background: rgba(160, 71, 63, 0.08);
  border-radius: 50%;
  flex-shrink: 0;
}

.fav-icon {
  font-size: 28rpx;
  color: var(--berry);
}

.tags-row {
  display: flex;
  align-items: center;
  gap: 12rpx;
}

.cat-tag {
  background: var(--primary-soft);
  color: var(--primary-deep);
  font-size: 20rpx;
  font-weight: 600;
  padding: 4rpx 14rpx;
  border-radius: 10rpx;
}

.teacher-name {
  font-size: 22rpx;
  color: var(--ink-3);
}

.info-bottom {
  display: flex;
  align-items: center;
  justify-content: space-between;
  margin-top: auto;
}

.age-range {
  font-size: 22rpx;
  color: var(--ink-3);
}

.price-text {
  font-size: 28rpx;
  font-weight: 700;
  color: var(--primary);
}

.bottom-space {
  height: 40rpx;
}
</style>
