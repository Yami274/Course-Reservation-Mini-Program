<template>
  <view class="main-shell">
    <view :style="{ height: statusH + 'px' }" />
    <view class="mini-nav"><text class="nav-title">{{ navTitle }}</text></view>
    <swiper class="main-swiper" :current="active" :duration="300" @change="onSwipe" :style="{ height: swiperH + 'px' }">
      <swiper-item><HomeContent :topH="topH" :tabH="tabH" @switchTab="switchTo" /></swiper-item>
      <swiper-item><CourseContent :topH="topH" :tabH="tabH" @switchTab="switchTo" /></swiper-item>
      <swiper-item><OrderContent :topH="topH" :tabH="tabH" @switchTab="switchTo" /></swiper-item>
      <swiper-item><MineContent :topH="topH" :tabH="tabH" @switchTab="switchTo" /></swiper-item>
    </swiper>

    <view class="main-tabbar">
      <view v-for="(t,i) in tabs" :key="t.key" class="m-tab" @tap="switchTo(i)">
        <image class="m-icon-img" :src="'/static/tabbar/' + t.key + (active===i ? '-on' : '') + '.png'" mode="aspectFit" />
        <text class="m-label" :class="{on:active===i}">{{t.label}}</text>
      </view>
    </view>
  </view>
</template>

<script setup>
import { ref, computed, onMounted } from 'vue'
import HomeContent from './HomeContent.vue'
import CourseContent from './CourseContent.vue'
import OrderContent from './OrderContent.vue'
import MineContent from './MineContent.vue'

const statusH = ref(44)
const active = ref(0)
const ratio = ref(0.5)
const tabs = [
  { key: 'home',   label: '首页' },
  { key: 'course', label: '课程' },
  { key: 'order',  label: '预约' },
  { key: 'mine',   label: '我的' },
]
const navTitles = ['安然画室', '全部课程', '我的预约', '我的']
const navTitle = computed(() => navTitles[active.value] || '安然画室')

const topH = computed(() => statusH.value + 88 * ratio.value)
const tabH = computed(() => 100 * ratio.value)
const swiperH = ref(600)

onMounted(() => {
  const info = uni.getSystemInfoSync()
  statusH.value = info.statusBarHeight || 44
  ratio.value = (info.screenWidth || 375) / 750
  const navPx = 88 * ratio.value
  const tabPx = (100 + (info.safeAreaInsets?.bottom || 0) / ratio.value) * ratio.value
  swiperH.value = info.windowHeight - statusH.value - navPx - tabPx

  // Handle tab query param from reLaunch
  const pages = getCurrentPages()
  const currentPage = pages[pages.length - 1]
  const tabParam = currentPage?.options?.tab
  if (tabParam != null) {
    const tabIndex = parseInt(tabParam)
    if (tabIndex >= 0 && tabIndex <= 3) {
      active.value = tabIndex
    }
  }
})

function switchTo(i) { active.value = i }
function onSwipe(e) { active.value = e.detail.current }
</script>

<style lang="scss" scoped>
.main-shell { width: 100vw; height: 100vh; display: flex; flex-direction: column; overflow: hidden; background: var(--paper); }
.mini-nav { height: 88rpx; display: flex; align-items: center; justify-content: center; flex-shrink: 0; }
.nav-title { font-size: 34rpx; font-weight: 600; color: var(--ink); }
.main-swiper { flex: 1; width: 100%; }

.main-tabbar {
  height: 100rpx; padding-bottom: constant(safe-area-inset-bottom); padding-bottom: env(safe-area-inset-bottom);
  background: rgba(255,252,245,0.98);
  border-top: 1rpx solid rgba(42,37,32,0.10); display: flex; align-items: flex-start;
  padding-top: 10rpx; flex-shrink: 0; box-sizing: border-box;
}
.m-tab { flex: 1; display: flex; flex-direction: column; align-items: center; gap: 2rpx; padding: 4rpx 0; }
.m-icon-img { width: 48rpx; height: 48rpx; }
.m-label { font-size: 20rpx; font-weight: 500; color: #8A7E70; line-height: 1.2; }
.m-label.on { color: #D97757; font-weight: 600; }
</style>
