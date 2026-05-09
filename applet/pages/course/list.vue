<template>
  <view class="page paper-bg">
    <!-- 状态栏占位 -->
    <view :style="{ height: statusBarHeight + 'px' }" />

    <!-- 顶部导航 -->
    <view class="mini-nav">
      <text class="nav-title">全部课程</text>
      <view class="search-icon-btn" @tap="toSearch">
        <SvgIcon name="search" :color="searchIconColor" :size="36" />
      </view>
    </view>

    <!-- 滚动主内容 -->
    <scroll-view scroll-y class="scroll-content" :style="{ height: scrollHeight + 'px' }">
      <!-- 搜索 + 筛选 -->
      <view style="padding: 8rpx 32rpx 20rpx;" @tap="toSearch">
        <view class="search-box">
          <SvgIcon name="search" :color="searchIconColor2" :size="30" />
          <text style="flex:1; color:var(--ink-3);">搜索课程、讲师…</text>
          <view style="display:flex;align-items:center;gap:8rpx;">
            <SvgIcon name="filter" :color="filterIconColor" :size="28" />
            <text style="font-size:24rpx;color:var(--ink-2);font-weight:500;">筛选</text>
          </view>
        </view>
      </view>

      <!-- 分类 Tab 横向滚动 -->
      <view class="tab-bar-wrap">
        <scroll-view scroll-x class="tab-scroll" :show-scrollbar="false">
          <view class="tab-list">
            <view
              v-for="(tab, i) in tabs"
              :key="tab.key"
              class="tab-item"
              :class="{ active: activeTab === tab.key }"
              @tap="setTab(tab.key)"
            >
              {{ tab.label }}
            </view>
          </view>
        </scroll-view>
      </view>

      <!-- 副筛选行 -->
      <view class="sub-filter-row">
        <view
          v-for="(f, i) in subFilters"
          :key="f"
          class="sub-chip"
          :class="{ active: activeSubFilter === i }"
          @tap="setSubFilter(i)"
        >{{ f }}</view>
      </view>

      <!-- 课程列表 -->
      <view class="course-list tab-fade" :key="activeTab">
        <view
          v-for="course in filteredCourses"
          :key="course.id"
          class="course-card card shadow-warm"
          @tap="toCourseDetail(course)"
        >
          <!-- 缩略图 -->
          <view class="thumb ph" :style="{ background: course.thumbBg }">
            <image
              v-if="course.cover"
              class="thumb-img"
              :src="course.cover"
              mode="aspectFill"
              @error="course.coverError = true"
            />
            <view v-if="course.isHot" class="tag-ribbon">HOT</view>
          </view>

          <!-- 课程信息 -->
          <view class="card-info">
            <text class="course-name serif">{{ course.name }}</text>
            <view style="display:flex;gap:8rpx;margin-top:12rpx;">
              <view class="tag">{{ course.ageRange }}</view>
              <view v-if="course.timeSlot" class="tag">{{ course.timeSlot }}</view>
            </view>
            <view style="display:flex;align-items:center;gap:8rpx;margin-top:16rpx;">
              <SvgIcon name="user" :color="userIconColor" :size="22" />
              <text style="font-size:22rpx;color:var(--ink-3);">{{ course.teacherName }} 老师</text>
            </view>
            <view class="card-footer">
              <view>
                <text class="card-price serif">{{ course.priceText }}</text>
                <text :style="{ display:'block', fontSize:'20rpx', marginTop:'4rpx', color: course.seatsLeft===0?'var(--ink-3)':'var(--moss)' }">
                  {{ course.seatsLeft === 0 ? '本期已满 · 候补' : `余 ${course.seatsLeft} 席` }}
                </text>
              </view>
              <view
                class="book-btn"
                :style="{ background: course.seatsLeft===0?'rgba(42,37,32,0.08)':'var(--primary)', color: course.seatsLeft===0?'var(--ink-3)':'#FFFCF5' }"
              >
                {{ course.seatsLeft === 0 ? '候补' : '去预约' }}
              </view>
            </view>
          </view>
        </view>

        <!-- 空状态 -->
        <view v-if="filteredCourses.length === 0 && !loading" class="empty-state">
          <text style="font-size:80rpx;">🎨</text>
          <text style="font-size:28rpx;color:var(--ink-3);margin-top:16rpx;">暂无相关课程</text>
        </view>

        <view v-if="filteredCourses.length > 0" class="list-end hand">— 到底啦 —</view>
      </view>

      <view style="height:200rpx;" />
    </scroll-view>
  </view>
</template>

<script setup>
import { ref, computed, onMounted, watch } from 'vue'
import { onLoad, onShow } from '@dcloudio/uni-app'
import { getCourses } from '@/api/course.js'
import { getCategories } from '@/api/home.js'
import { normalizeCourse } from '@/utils/normalize.js'
import SvgIcon from '@/components/SvgIcon.vue'

onShow(() => {
  const pending = uni.getStorageSync('pendingCategory')
  if (pending) {
    uni.removeStorageSync('pendingCategory')
    activeTab.value = pending
  }
})

const statusBarHeight = ref(44)
const scrollHeight = ref(600)
const activeTab = ref('all')
const activeSubFilter = ref(0)
const loading = ref(false)
const allCourses = ref([])
const tabs = ref([{ key: 'all', label: '全部' }])
const subFilters = ['默认', '最新', '名额', '周末']

const searchIconColor = '#2A2520'
const searchIconColor2 = '#8A7E70'
const filterIconColor = '#5A4F44'
const userIconColor = '#8A7E70'

onMounted(() => {
  const info = uni.getSystemInfoSync()
  statusBarHeight.value = info.statusBarHeight || 44
  const navH = 88 * (info.screenWidth || 375) / 750
  scrollHeight.value = info.windowHeight - statusBarHeight.value - navH
})

onLoad(async (options) => {
  try {
    const catsRes = await getCategories()
    const cats = catsRes || []
    tabs.value = [
      { key: 'all', label: '全部' },
      ...cats.filter(c => c.name !== '全部').map(c => ({ key: String(c.id), label: c.name }))
    ]
  } catch(e) {
    console.error('categories error:', e)
  }

  if (options?.category) {
    activeTab.value = options.category
  }
  await loadCourses()
})

async function loadCourses() {
  loading.value = true
  try {
    const params = { page: 1, pageSize: 20, status: 'published' }
    if (activeTab.value !== 'all') {
      params.category_id = Number(activeTab.value)
    }
    const res = await getCourses(params)
    allCourses.value = (res?.list || res || []).map(normalizeCourse)
  } catch(e) {
    console.error('courses error:', e)
  } finally {
    loading.value = false
  }
}

watch(activeTab, () => loadCourses())

const filteredCourses = computed(() => {
  let list = [...allCourses.value]
  if (activeSubFilter.value === 1) {
    list.sort((a, b) => (b.createdAt || b.id || 0) - (a.createdAt || a.id || 0))
  } else if (activeSubFilter.value === 2) {
    list.sort((a, b) => (a.seatsLeft || 99) - (b.seatsLeft || 99))
  } else if (activeSubFilter.value === 3) {
    list = list.filter(c => c.timeSlot && /周六|周日|周末/.test(c.timeSlot))
  }
  return list
})

function setTab(key) {
  activeTab.value = key
}

function setSubFilter(i) {
  activeSubFilter.value = i
}
function toCourseDetail(course) {
  uni.navigateTo({ url: `/pages/course/detail?id=${course.id}` })
}
function toSearch() {
  uni.navigateTo({ url: '/pages/course/search' })
}
</script>

<style lang="scss" scoped>
.page {
  min-height: 100vh;
  background: var(--paper);
  overflow-x: hidden;
}

.mini-nav {
  position: relative;
  height: 88rpx;
  display: flex;
  align-items: center;
  justify-content: center;
}
.nav-title {
  font-size: 34rpx;
  font-weight: 600;
  color: var(--ink);
}
.search-icon-btn {
  position: absolute;
  right: 32rpx;
  top: 50%;
  transform: translateY(-50%);
  width: 60rpx;
  height: 60rpx;
  display: flex;
  align-items: center;
  justify-content: center;
}

/* 分类 Tab */
.tab-bar-wrap {
  position: relative;
  border-bottom: 1rpx solid var(--line);
}
.tab-scroll {
  width: 100%;
}
.tab-list {
  display: inline-flex;
  padding: 8rpx 32rpx 0;
  gap: 32rpx;
}
.tab-item {
  flex-shrink: 0;
  position: relative;
  padding-bottom: 16rpx;
  font-size: 28rpx;
  font-weight: 500;
  color: var(--ink-3);
  white-space: nowrap;
  transition: color 0.25s ease, font-weight 0.25s ease;

  &.active {
    font-weight: 700;
    color: var(--ink);
    &::after {
      content: '';
      position: absolute;
      left: 50%;
      bottom: 0;
      transform: translateX(-50%);
      width: 40rpx;
      height: 6rpx;
      border-radius: 6rpx;
      background: var(--primary);
    }
  }
}

/* 副筛选 */
.sub-filter-row {
  display: flex;
  gap: 16rpx;
  padding: 24rpx 32rpx 16rpx;
}
.sub-chip {
  padding: 10rpx 24rpx;
  border-radius: 999rpx;
  font-size: 24rpx;
  font-weight: 500;
  background: transparent;
  color: var(--ink-2);
  border: 1rpx solid var(--line);

  &.active {
    background: var(--primary-soft);
    color: var(--primary-deep);
    border-color: var(--primary-soft);
  }
}

/* 课程列表 */
.scroll-content {
  width: 100%;
  overflow-y: scroll;
  overflow-x: hidden;
}
.course-list {
  padding: 8rpx 32rpx;
  display: flex;
  flex-direction: column;
  gap: 24rpx;
}
.course-card {
  padding: 24rpx;
  border-radius: 36rpx;
  display: flex;
  gap: 24rpx;
}
.thumb {
  width: 200rpx;
  height: 248rpx;
  border-radius: 28rpx;
  flex-shrink: 0;
  position: relative;
  background: var(--primary-soft);
}
.card-info {
  flex: 1;
  display: flex;
  flex-direction: column;
  min-width: 0;
}
.course-name {
  font-size: 32rpx;
  font-weight: 600;
  line-height: 1.3;
  color: var(--ink);
}
.card-footer {
  display: flex;
  justify-content: space-between;
  align-items: flex-end;
  margin-top: auto;
  padding-top: 16rpx;
}
.card-price {
  font-size: 32rpx;
  font-weight: 700;
  color: var(--primary-deep);
}
.book-btn {
  padding: 14rpx 28rpx;
  border-radius: 999rpx;
  font-size: 24rpx;
  font-weight: 600;
}

.thumb-img {
  position: absolute;
  top: 0; right: 0; bottom: 0; left: 0;
  width: 100%;
  height: 100%;
  border-radius: inherit;
}

.list-end {
  text-align: center;
  color: var(--ink-3);
  font-size: 24rpx;
  padding: 16rpx 0;
}

/* 空状态 */
.empty-state {
  display: flex;
  flex-direction: column;
  align-items: center;
  padding: 120rpx 0;
}
</style>
