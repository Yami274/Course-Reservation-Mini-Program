<template>
  <view class="page paper-bg">
    <!-- 状态栏占位 -->
    <view :style="{ height: statusBarHeight + 'px' }" />

    <!-- 顶部导航 MiniNav -->
    <view class="mini-nav">
      <text class="nav-title">安然画室</text>
    </view>

    <!-- 滚动主内容 -->
    <scroll-view scroll-y :style="{ height: scrollHeight + 'px' }">

      <!-- 搜索栏 -->
      <view style="padding: 8rpx 32rpx 24rpx;" @tap="toSearch">
        <view class="search-box">
          <SvgIcon name="search" :color="iconInk" :size="30" />
          <text style="flex:1; color:var(--ink-3);">搜索课程、讲师…</text>
          <SvgIcon name="mic" :color="iconInk" :size="30" />
        </view>
      </view>

      <!-- 轮播 Banner -->
      <view style="padding: 0 32rpx 28rpx;">
        <view class="banner-wrap shadow-warm">
          <swiper
            class="banner-swiper"
            autoplay
            interval="4000"
            circular
            :current="bannerIndex"
            @change="onBannerChange"
          >
            <swiper-item v-for="(item, i) in banners" :key="i">
              <view class="banner-card" :style="{ background: item.gradient }">
                <!-- Real image from backend; hides itself on load error, gradient shows through -->
                <image
                  v-if="item.image && !item.imgError"
                  class="banner-bg-img"
                  :src="item.image"
                  mode="aspectFill"
                  @error="item.imgError = true"
                />
                <!-- Dark overlay for text readability when image loads successfully -->
                <view v-if="item.image && !item.imgError" class="banner-img-overlay" />
                <!-- 装饰 SVG -->
                <view class="banner-deco">
                  <view class="deco-ring" />
                  <view class="deco-dot" />
                </view>
                <view class="banner-content">
                  <text class="banner-season hand">SPRING · 04</text>
                  <text class="banner-title display">{{ item.title }}</text>
                  <text class="banner-sub">{{ item.subtitle }}</text>
                </view>
                <!-- 分页点 -->
                <view class="banner-dots">
                  <view v-for="(_, j) in banners" :key="j" class="bdot" :class="{ active: bannerIndex === j }" />
                </view>
              </view>
            </swiper-item>
          </swiper>
        </view>
      </view>

      <!-- 公告栏 -->
      <view v-if="noticeText" style="padding: 0 32rpx 32rpx;">
        <view class="notice-strip">
          <view class="notice-badge-text">公告</view>
          <text class="notice-content" numberOfLines="1">{{ noticeText }}</text>
        </view>
      </view>

      <!-- 分类导航 -->
      <view style="padding: 0 32rpx 44rpx;">
        <view class="category-grid">
          <view
            v-for="cat in categories"
            :key="cat.id"
            class="cat-tile"
            @tap="toCategoryList(cat)"
          >
            <view class="icon-bg" :style="{ background: cat.bg }">
              <text class="cat-emoji">{{ cat.emoji }}</text>
            </view>
            <text class="cat-name">{{ cat.name }}</text>
          </view>
        </view>
      </view>

      <!-- 本期推荐 标题 -->
      <view class="section-head" style="padding: 0 32rpx 24rpx;">
        <view>
          <view class="section-title-row">
            <text class="section-title serif">本期推荐</text>
            <view class="title-underline" />
          </view>
          <text class="section-sub hand">讲师精选 · 名额有限</text>
        </view>
        <text class="section-more" @tap="toCourseList">全部 ›</text>
      </view>

      <!-- 热门课程横向滚动 -->
      <scroll-view scroll-x class="hot-scroll" :show-scrollbar="false">
        <view class="hot-list">
          <view
            v-for="course in hotCourses"
            :key="course.id"
            class="hot-card card shadow-warm"
            @tap="toCourseDetail(course)"
          >
            <view class="hot-thumb ph" :style="{ background: course.thumbBg }">
              <image
                v-if="course.cover"
                class="thumb-img"
                :src="course.cover"
                mode="aspectFill"
                @error="course.coverError = true"
              />
              <view v-if="course.isHot" class="tag-ribbon">HOT</view>
              <view v-else-if="course.seatsLeft === 0" class="tag-ribbon" style="background:var(--ink-2);">已满</view>
            </view>
            <view class="hot-body">
              <text class="hot-name serif">{{ course.name }}</text>
              <view style="display:flex;gap:8rpx;margin-top:10rpx;">
                <view class="tag">{{ course.ageRange }}</view>
              </view>
              <view class="hot-footer">
                <text class="hot-price">{{ course.priceText }}</text>
                <text :style="{ fontSize:'22rpx', color: course.seatsLeft === 0 ? 'var(--ink-3)' : 'var(--moss)' }">
                  {{ course.seatsLeft === 0 ? '已满' : `余${course.seatsLeft}席` }}
                </text>
              </view>
            </view>
          </view>
        </view>
      </scroll-view>

      <!-- 点阵分隔 -->
      <view style="padding: 0 64rpx 36rpx;">
        <view class="dot-divider">
          <text class="hand" style="font-size:24rpx;color:var(--ink-3);">最新课程</text>
        </view>
      </view>

      <!-- 最新课程列表 -->
      <view style="padding: 0 32rpx 0; display:flex; flex-direction:column; gap:24rpx;">
        <view
          v-for="course in latestCourses"
          :key="course.id"
          class="course-row card"
          @tap="toCourseDetail(course)"
        >
          <view class="row-thumb ph" :style="{ background: course.thumbBg }">
            <image
              v-if="course.cover"
              class="thumb-img"
              :src="course.cover"
              mode="aspectFill"
              @error="course.coverError = true"
            />
          </view>
          <view class="row-info">
            <text class="row-name serif">{{ course.name }}</text>
            <view style="display:flex;gap:8rpx;margin-top:8rpx;align-items:center;">
              <SvgIcon name="user" :color="iconInk" :size="24" />
              <text style="font-size:22rpx;color:var(--ink-3);">{{ course.teacherName }}</text>
              <SvgIcon name="clock" :color="iconInk" :size="24" />
              <text style="font-size:22rpx;color:var(--ink-3);">{{ course.timeSlot }}</text>
            </view>
            <view style="display:flex;justify-content:space-between;align-items:center;margin-top:10rpx;">
              <view class="tag">{{ course.category }}</view>
              <text style="font-size:24rpx;color:var(--primary-deep);font-weight:600;">{{ course.priceText }}</text>
            </view>
          </view>
        </view>
      </view>

      <view style="height:200rpx;" />
    </scroll-view>
  </view>
</template>

<script setup>
import { ref, onMounted } from 'vue'
import { onShow } from '@dcloudio/uni-app'
import { getBanners, getNotices, getCategories, getHotCourses } from '@/api/home.js'
import { getCourses } from '@/api/course.js'
import { normalizeCourse } from '@/utils/normalize.js'
import SvgIcon from '@/components/SvgIcon.vue'
import { useTabbarStore } from '@/stores/tabbar.js'

onShow(() => { useTabbarStore().active = 'home' })

const iconInk = '#8A7E70'

const BANNER_GRADIENTS = [
  'linear-gradient(135deg, #F4D9B8 0%, #E8B383 60%, #D97757 100%)',
  'linear-gradient(135deg, #C7D1B6 0%, #8FA47C 60%, #5C6F4E 100%)',
  'linear-gradient(135deg, #E8D4B0 0%, #C8A870 60%, #A07840 100%)',
  'linear-gradient(135deg, #B8CDD8 0%, #7A9CB0 60%, #4A6C80 100%)',
]

const BANNER_TITLES = [
  { title: '春日色彩\n绘画工坊', subtitle: '4-12岁 · 周末班招募中' },
  { title: '成人速写\n夜间班', subtitle: '零基础 · 八周入门' },
  { title: '水彩花卉\n进阶班', subtitle: '国际课程体系 · 系统培养' },
  { title: '暑期艺术\n特训营', subtitle: '沉浸体验 · 激发创作灵感' },
]

const CAT_BG = [
  '#F4DFB1', '#C7D1B6', '#E5BEB9', '#C5D5DD',
  '#F2C9B5', '#DDD0B0', '#E8DFC8', '#F5EDE0',
]

function isEmojiStr(str) {
  if (!str) return false
  return /^\p{Emoji}/u.test(str.trim()) && str.trim().length <= 4
}

const statusBarHeight = ref(44)
const scrollHeight = ref(650)
const hasNotice = ref(false)
const bannerIndex = ref(0)
const noticeText = ref('欢迎来到安然画室，期待与您的小艺术家相遇')

const banners = ref([])
const notices = ref([])
const categories = ref([])
const hotCourses = ref([])
const latestCourses = ref([])

onMounted(async () => {
  const info = uni.getSystemInfoSync()
  statusBarHeight.value = info.statusBarHeight || 44
  const navH = 88 * (info.screenWidth || 375) / 750
  scrollHeight.value = info.windowHeight - statusBarHeight.value - navH

  try {
    const [bannersRes, noticesRes, catsRes, hotRes, latestRes] = await Promise.all([
      getBanners(),
      getNotices(),
      getCategories(),
      getHotCourses(4),
      getCourses({ page: 1, pageSize: 5 })
    ])

    banners.value = (bannersRes || []).map((b, i) => ({
      ...b,
      gradient: BANNER_GRADIENTS[i % BANNER_GRADIENTS.length],
      title: b.title || BANNER_TITLES[i % BANNER_TITLES.length].title,
      subtitle: b.subtitle || BANNER_TITLES[i % BANNER_TITLES.length].subtitle,
      imgError: false,
    }))

    notices.value = noticesRes || []
    if (notices.value.length > 0) {
      hasNotice.value = true
      noticeText.value = notices.value[0].content
    }

    categories.value = (catsRes || []).map((c, i) => ({
      ...c,
      emoji: isEmojiStr(c.icon) ? c.icon : '🎨',
      bg: CAT_BG[i % CAT_BG.length],
      key: String(c.id),
    }))

    hotCourses.value = (hotRes || []).map(normalizeCourse)
    latestCourses.value = (latestRes?.list || latestRes || []).map(normalizeCourse)
  } catch(e) {
    console.error('Home load error:', e)
  }
})

function onBannerChange(e) {
  bannerIndex.value = e.detail.current
}

function toSearch() {
  uni.navigateTo({ url: '/pages/course/search' })
}
function toCourseList() {
  uni.switchTab({ url: '/pages/course/list' })
}
function toCourseDetail(course) {
  uni.navigateTo({ url: `/pages/course/detail?id=${course.id}` })
}
function toCategoryList(cat) {
  uni.setStorageSync('pendingCategory', cat.key)
  uni.switchTab({ url: '/pages/course/list' })
}
function toNotifications() {
  uni.navigateTo({ url: '/pages/mine/notifications' })
}
</script>

<style lang="scss" scoped>
.page {
  min-height: 100vh;
  background: var(--paper);
  overflow-x: hidden;
}

/* 顶部导航 */
.mini-nav {
  position: relative;
  height: 88rpx;
  display: flex;
  align-items: center;
  justify-content: center;
  padding: 0 32rpx;
}
.nav-title {
  font-size: 34rpx;
  font-weight: 600;
  color: var(--ink);
}
.nav-capsule {
  position: absolute;
  right: 24rpx;
  top: 50%;
  transform: translateY(-50%);
  width: 72rpx;
  height: 60rpx;
  border-radius: 999rpx;
  background: rgba(42,37,32,0.06);
  border: 1rpx solid rgba(42,37,32,0.10);
  display: flex;
  align-items: center;
  justify-content: center;
}
.icon-view {
  flex-shrink: 0;
}

/* Banner */
.banner-wrap {
  border-radius: 44rpx;
  overflow: hidden;
}
.banner-swiper {
  width: 100%;
  height: 312rpx;
}
.banner-card {
  width: 100%;
  height: 100%;
  position: relative;
  display: flex;
  flex-direction: column;
  justify-content: space-between;
  padding: 40rpx 44rpx 36rpx;
  overflow: hidden;
}
.banner-bg-img {
  position: absolute;
  inset: 0;
  width: 100%;
  height: 100%;
  pointer-events: none;
}
.banner-img-overlay {
  position: absolute;
  inset: 0;
  background: linear-gradient(135deg, rgba(42,37,32,0.52) 0%, rgba(42,37,32,0.18) 100%);
  pointer-events: none;
}
.banner-deco {
  position: absolute;
  right: 0;
  top: 0;
  width: 280rpx;
  height: 280rpx;
  pointer-events: none;
}
.deco-ring {
  position: absolute;
  right: -20rpx;
  top: -20rpx;
  width: 200rpx;
  height: 200rpx;
  border-radius: 50%;
  border: 3rpx dashed rgba(255,252,245,0.45);
}
.deco-dot {
  position: absolute;
  right: 60rpx;
  top: 100rpx;
  width: 24rpx;
  height: 24rpx;
  border-radius: 50%;
  background: rgba(255,252,245,0.5);
}
.banner-content {
  position: relative;
  z-index: 1;
  flex: 1;
  display: flex;
  flex-direction: column;
  justify-content: center;
}
.banner-season {
  position: absolute;
  top: 0;
  left: 0;
  font-size: 22rpx;
  letter-spacing: 0.3em;
  opacity: 0.85;
  color: #FFFCF5;
}
.banner-title {
  display: block;
  font-size: 52rpx;
  font-weight: 700;
  line-height: 1.15;
  color: #FFFCF5;
  white-space: pre-line;
}
.banner-sub {
  display: block;
  font-size: 24rpx;
  margin-top: 16rpx;
  opacity: 0.85;
  color: #FFFCF5;
}
.banner-dots {
  display: flex;
  gap: 8rpx;
  margin-top: 24rpx;
}
.bdot {
  width: 10rpx;
  height: 4rpx;
  border-radius: 4rpx;
  background: rgba(255,252,245,0.4);
  transition: all 0.3s;
  &.active {
    width: 36rpx;
    background: #FFFCF5;
  }
}

/* 公告栏 */
.notice-strip {
  display: flex;
  align-items: center;
  gap: 20rpx;
  padding: 16rpx 28rpx;
  border-radius: 24rpx;
  background: rgba(232,184,96,0.14);
  border: 1rpx solid rgba(232,184,96,0.3);
}
.notice-badge-text {
  flex-shrink: 0;
  padding: 2rpx 12rpx;
  border-radius: 8rpx;
  background: var(--butter);
  color: #3A2A0A;
  font-size: 20rpx;
  font-weight: 700;
  letter-spacing: 0.05em;
}
.notice-content {
  flex: 1;
  font-size: 24rpx;
  color: var(--ink-2);
  overflow: hidden;
  text-overflow: ellipsis;
  white-space: nowrap;
}

/* 分类网格 */
.category-grid {
  display: grid;
  grid-template-columns: repeat(4, 1fr);
  gap: 24rpx;
}
.cat-tile {
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 12rpx;
}
.icon-bg {
  width: 104rpx;
  height: 104rpx;
  border-radius: 32rpx;
  display: flex;
  align-items: center;
  justify-content: center;
}
.cat-emoji {
  font-size: 44rpx;
}
.cat-name {
  font-size: 24rpx;
  color: var(--ink-2);
  font-weight: 500;
}

/* 区块标题 */
.section-head {
  display: flex;
  align-items: flex-start;
  justify-content: space-between;
}
.section-title-row {
  position: relative;
  display: inline-block;
}
.section-title {
  font-size: 44rpx;
  font-weight: 600;
  color: var(--ink);
}
.title-underline {
  position: absolute;
  left: -4rpx;
  right: -4rpx;
  bottom: -6rpx;
  height: 12rpx;
  background: url("data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' viewBox='0 0 100 6' preserveAspectRatio='none'%3E%3Cpath d='M2 4 Q 25 1 50 3 T 98 2.5' stroke='%23D97757' stroke-width='2' fill='none' stroke-linecap='round'/%3E%3C/svg%3E") no-repeat center / 100% 100%;
  opacity: 0.85;
}
.section-sub {
  font-size: 24rpx;
  color: var(--ink-3);
  margin-top: 4rpx;
  display: block;
}
.section-more {
  font-size: 24rpx;
  color: var(--ink-3);
  margin-top: 8rpx;
}

/* 热门课程横向卡片 */
.hot-scroll {
  width: 100%;
}
.hot-list {
  display: inline-flex;
  gap: 24rpx;
  padding: 0 32rpx 44rpx;
}
.hot-card {
  flex: 0 0 320rpx;
  display: flex;
  flex-direction: column;
  border-radius: 36rpx;
  overflow: hidden;
}
.hot-thumb {
  width: 100%;
  height: 240rpx;
  position: relative;
}
.hot-body {
  padding: 20rpx 24rpx 24rpx;
  display: flex;
  flex-direction: column;
  flex: 1;
}
.hot-name {
  font-size: 30rpx;
  font-weight: 600;
  line-height: 1.25;
  color: var(--ink);
}
.hot-footer {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-top: auto;
  padding-top: 12rpx;
}
.hot-price {
  font-size: 22rpx;
  color: var(--primary-deep);
  font-weight: 600;
}

/* 最新课程行 */
.course-row {
  display: flex;
  gap: 24rpx;
  padding: 20rpx;
  border-radius: 32rpx;
}
.row-thumb {
  width: 176rpx;
  height: 176rpx;
  border-radius: 24rpx;
  flex-shrink: 0;
  background: var(--primary-soft);
}
.row-info {
  flex: 1;
  display: flex;
  flex-direction: column;
  justify-content: space-between;
  min-width: 0;
  padding: 4rpx 0 8rpx;
}
.row-name {
  font-size: 30rpx;
  font-weight: 600;
  line-height: 1.3;
  color: var(--ink);
}

.thumb-img {
  position: absolute;
  inset: 0;
  width: 100%;
  height: 100%;
  border-radius: inherit;
}

.scroll-content {
  /* height set via inline style */
}
</style>
