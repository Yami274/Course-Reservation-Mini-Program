<template>
  <view class="page">
    <!-- 状态栏高度 -->
    <view class="status-bar" :style="{ height: statusBarHeight + 'px' }"></view>

    <!-- 搜索头部 -->
    <view class="search-header">
      <view class="search-input-wrap">
        <SvgIcon name="search" color="#8A7E70" :size="32" />
        <input
          class="search-input"
          v-model="keyword"
          placeholder="搜索课程、讲师..."
          placeholder-style="color: #8A7E70"
          :focus="true"
          @input="onInput"
          @confirm="doSearch"
        />
        <view v-if="keyword" class="clear-btn" @tap="clearSearch">✕</view>
      </view>
      <text class="cancel-btn" @tap="goBack">取消</text>
    </view>

    <!-- 搜索结果 -->
    <scroll-view v-if="keyword && searched" scroll-y class="results" :style="{ height: scrollHeight + 'px' }">
      <!-- Searching indicator -->
      <view v-if="searching" class="searching-state">
        <text class="searching-text">搜索中...</text>
      </view>
      <view v-else-if="results.length > 0" class="results-list">
        <view class="results-count">找到 {{ results.length }} 个相关课程</view>
        <view
          v-for="item in results"
          :key="item.id"
          class="result-item"
          @tap="toCourseDetail(item)"
        >
          <view class="item-thumb" :style="{ background: item.thumbBg }"></view>
          <view class="item-info">
            <text class="item-name">{{ item.name }}</text>
            <text class="item-sub">{{ item.category }} · {{ item.teacherName }}</text>
            <text class="item-age">{{ item.ageRange }}</text>
          </view>
          <text class="item-price">{{ item.priceText }}</text>
        </view>
      </view>

      <!-- 空结果 -->
      <view v-else class="empty-state">
        <text class="empty-emoji">🔍</text>
        <text class="empty-title">没有找到相关课程</text>
        <text class="empty-sub">试试其他关键词搜索吧</text>
      </view>
    </scroll-view>

    <!-- 默认内容：最近搜索 + 热门搜索 -->
    <view v-else class="default-content">
      <!-- 最近搜索 -->
      <view v-if="recentSearches.length > 0" class="search-section">
        <view class="section-header">
          <text class="section-title">最近搜索</text>
          <text class="clear-history" @tap="clearHistory">清除</text>
        </view>
        <view class="tag-list">
          <view
            v-for="item in recentSearches"
            :key="item"
            class="search-tag history"
            @tap="setKeyword(item)"
          >{{ item }}</view>
        </view>
      </view>

      <!-- 热门搜索 -->
      <view class="search-section">
        <text class="section-title">热门搜索</text>
        <view class="tag-list">
          <view
            v-for="(item, i) in hotSearches"
            :key="item"
            class="search-tag"
            :class="{ top3: i < 3 }"
            @tap="setKeyword(item)"
          >
            <text v-if="i < 3" class="rank">{{ i + 1 }}</text>
            {{ item }}
          </view>
        </view>
      </view>
    </view>
  </view>
</template>

<script setup>
import { ref, onMounted } from 'vue'
import { getCourses } from '@/api/course.js'
import { normalizeCourse } from '@/utils/normalize.js'
import SvgIcon from '@/components/SvgIcon.vue'

const statusBarHeight = ref(44)
const scrollHeight = ref(600)
const keyword = ref('')
const searched = ref(false)
const results = ref([])
const searching = ref(false)

onMounted(() => {
  const info = uni.getSystemInfoSync()
  statusBarHeight.value = info.statusBarHeight || 44
  scrollHeight.value = info.windowHeight - statusBarHeight.value - 100
})

const recentSearches = ref(
  (uni.getStorageSync('recentSearches') || []).slice(0, 6)
)

const hotSearches = ref([
  '儿童启蒙绘画',
  '水彩花卉课程',
  '国画入门',
  '素描基础',
  '亲子绘画课',
  '油画',
  '色彩构图课',
  '速写课程',
])

let searchTimer = null

function onInput() {
  searched.value = false
  clearTimeout(searchTimer)
  searchTimer = setTimeout(() => {
    if (keyword.value.trim()) {
      doSearch()
    }
  }, 400)
}

async function doSearch() {
  if (!keyword.value.trim()) return
  searching.value = true
  try {
    const res = await getCourses({ keyword: keyword.value.trim(), pageSize: 20, status: 'published' })
    const list = res?.list || res || []
    results.value = list.map(normalizeCourse)
  } catch(e) {
    console.error('search error:', e)
    results.value = []
  } finally {
    searching.value = false
    searched.value = true
  }

  // 更新最近搜索记录
  if (!recentSearches.value.includes(keyword.value)) {
    recentSearches.value.unshift(keyword.value)
    if (recentSearches.value.length > 6) {
      recentSearches.value = recentSearches.value.slice(0, 6)
    }
    uni.setStorageSync('recentSearches', recentSearches.value)
  }
}

function setKeyword(val) {
  keyword.value = val
  doSearch()
}

function clearSearch() {
  keyword.value = ''
  searched.value = false
  results.value = []
}

function clearHistory() {
  recentSearches.value = []
}

function goBack() {
  uni.navigateBack()
}

function toCourseDetail(course) {
  uni.navigateTo({ url: `/pages/course/detail?id=${course.id}` })
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

/* 搜索头部 */
.search-header {
  display: flex;
  align-items: center;
  gap: 16rpx;
  padding: 16rpx 24rpx 20rpx;
  background: var(--paper-2);
}

.search-input-wrap {
  flex: 1;
  display: flex;
  align-items: center;
  gap: 16rpx;
  background: var(--card);
  border-radius: 20rpx;
  padding: 20rpx 24rpx;
  box-shadow: 0 2rpx 12rpx rgba(42, 37, 32, 0.06);
}

.search-icon {
  font-size: 32rpx;
  flex-shrink: 0;
}

.search-input {
  flex: 1;
  font-size: 28rpx;
  color: var(--ink);
  background: transparent;
  border: none;
  outline: none;
}

.clear-btn {
  font-size: 28rpx;
  color: var(--ink-3);
  padding: 4rpx 8rpx;
  flex-shrink: 0;
}

.cancel-btn {
  font-size: 28rpx;
  color: var(--ink-3);
  flex-shrink: 0;
  padding: 12rpx;
}

/* 默认内容区域 */
.default-content {
  padding: 32rpx;
}

.search-section {
  margin-bottom: 40rpx;
}

.section-header {
  display: flex;
  align-items: center;
  justify-content: space-between;
  margin-bottom: 20rpx;
}

.section-title {
  font-size: 28rpx;
  font-weight: 700;
  color: var(--ink);
}

.clear-history {
  font-size: 24rpx;
  color: var(--ink-3);
}

.tag-list {
  display: flex;
  flex-wrap: wrap;
  gap: 16rpx;
}

.search-tag {
  display: flex;
  align-items: center;
  gap: 8rpx;
  font-size: 26rpx;
  color: var(--ink-2);
  padding: 14rpx 24rpx;
  border-radius: 20rpx;
  background: var(--card);
  box-shadow: 0 2rpx 8rpx rgba(42, 37, 32, 0.05);
  transition: all 0.15s;

  &.top3 {
    background: var(--primary-soft);
    color: var(--primary-deep);
  }

  &.history {
    background: var(--paper-2);
    border: 1rpx solid var(--line);
  }

  &:active {
    transform: scale(0.95);
  }
}

.rank {
  font-size: 22rpx;
  font-weight: 700;
  color: var(--primary);
  width: 28rpx;
  text-align: center;
}

/* 搜索结果 */
.results {
  width: 100%;
  overflow-y: scroll;
  overflow-x: hidden;
}

.results-list {
  padding: 24rpx 32rpx;
}

.results-count {
  font-size: 24rpx;
  color: var(--ink-3);
  margin-bottom: 20rpx;
}

.result-item {
  display: flex;
  align-items: center;
  gap: 20rpx;
  padding: 20rpx;
  background: var(--card);
  border-radius: 20rpx;
  margin-bottom: 16rpx;
  box-shadow: 0 2rpx 12rpx rgba(42, 37, 32, 0.05);
  transition: transform 0.15s;

  &:active {
    transform: scale(0.99);
  }
}

.item-thumb {
  width: 100rpx;
  height: 100rpx;
  border-radius: 14rpx;
  flex-shrink: 0;
}

.item-info {
  flex: 1;
  min-width: 0;
}

.item-name {
  display: block;
  font-size: 28rpx;
  font-weight: 600;
  color: var(--ink);
  overflow: hidden;
  text-overflow: ellipsis;
  white-space: nowrap;
  margin-bottom: 6rpx;
}

.item-sub {
  display: block;
  font-size: 22rpx;
  color: var(--ink-3);
  margin-bottom: 4rpx;
}

.item-age {
  display: block;
  font-size: 22rpx;
  color: var(--ink-3);
}

.item-price {
  font-size: 26rpx;
  font-weight: 700;
  color: var(--primary);
  flex-shrink: 0;
}

/* 搜索中 */
.searching-state {
  display: flex;
  align-items: center;
  justify-content: center;
  padding: 80rpx 32rpx;
}
.searching-text {
  font-size: 28rpx;
  color: var(--ink-3);
}

/* 空状态 */
.empty-state {
  display: flex;
  flex-direction: column;
  align-items: center;
  padding: 120rpx 0;
  gap: 16rpx;
}

.empty-emoji {
  font-size: 80rpx;
}

.empty-title {
  font-size: 30rpx;
  font-weight: 600;
  color: var(--ink);
}

.empty-sub {
  font-size: 26rpx;
  color: var(--ink-3);
}
</style>
