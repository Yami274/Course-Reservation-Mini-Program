<template>
  <view class="page">
    <!-- 状态栏 + 导航栏 -->
    <view :style="{ height: statusBarHeight + 'px' }" class="status-spacer" />
    <view class="nav-bar">
      <view class="back-btn" @tap="goBack">
        <SvgIcon name="chevron-left" :color="'var(--ink)'" :size="28" />
      </view>
      <text class="nav-title">课程详情</text>
      <view style="width: 64rpx;" />
    </view>

    <!-- 渐变 banner -->
    <view class="banner" :style="{ background: course.bannerBg }">
      <image v-if="course.cover" class="banner-cover-img" :src="course.cover" mode="aspectFill" @error="course.coverError = true" />
      <!-- 装饰圆圈 -->
      <view class="deco-c1"></view>
      <view class="deco-c2"></view>
    </view>

    <!-- 滚动内容区域 -->
    <scroll-view scroll-y class="scroll-content" :style="{ height: scrollHeight + 'px' }">

      <!-- 课程信息卡片 -->
      <view class="main-card">
        <!-- 分类 + 价格 -->
        <view class="top-row">
          <view class="cat-tag" :style="{ background: course.tagBg, color: course.tagColor }">
            {{ course.category }}
          </view>
          <text class="price">{{ course.priceText }}</text>
        </view>

        <!-- 课程标题 -->
        <text class="course-title">{{ course.name }}</text>
        <text class="course-subtitle">{{ course.ageRange }} · {{ course.totalLessons }}</text>

        <!-- 讲师信息 -->
        <view class="teacher-row" @tap="toTeacher">
          <view class="teacher-avatar" :style="{ background: course.teacherAvatarBg }">
            <text class="teacher-initial">{{ course.teacherName?.[0] }}</text>
          </view>
          <view class="teacher-info">
            <text class="teacher-name">{{ course.teacherName }}</text>
            <text class="teacher-title">{{ course.teacherTitle }}</text>
          </view>
          <SvgIcon name="chevron" color="var(--ink-3)" :size="28" />
        </view>
      </view>

      <!-- 课程简介 -->
      <view class="section-card">
        <text class="section-label">课程简介</text>
        <rich-text class="intro-text" :nodes="course.intro || ''"></rich-text>

        <!-- 课程特点 -->
        <view class="feature-tags">
          <view v-for="tag in course.features" :key="tag" class="feature-tag">
            {{ tag }}
          </view>
        </view>
      </view>

      <!-- 课程类型 -->
      <view class="section-card">
        <text class="section-label">课程类型</text>
        <view class="class-type-row">
          <view
            v-for="type in classTypes"
            :key="type.key"
            class="class-type-btn"
            :class="{ active: selectedClassType === type.key }"
            @tap="selectClassType(type.key)"
          >
            <view v-if="selectedClassType === type.key" class="type-check"><SvgIcon name="check" :color="'var(--primary)'" :size="28" /></view>
            <text class="type-name">{{ type.label }}</text>
            <text class="type-desc">{{ type.desc }}</text>
          </view>
        </view>
      </view>

      <!-- 上课地点 -->
      <view class="section-card" v-if="locations.length > 0">
        <text class="section-label">上课地点</text>
        <view class="location-card" v-for="loc in locations" :key="loc.id">
          <view class="loc-pin-box">
            <SvgIcon name="pin" :color="'var(--moss)'" :size="36" />
          </view>
          <view class="loc-info">
            <text class="loc-name">{{ loc.name }}</text>
            <text class="loc-addr">{{ loc.address }}</text>
          </view>
          <view class="nav-btn" @tap="toLocation(loc)">
            <SvgIcon name="nav" :color="'var(--primary)'" :size="28" />
            <text class="nav-label">导航</text>
          </view>
        </view>
      </view>

      <!-- 预约时段 -->
      <view class="section-card">
        <text class="section-label">预约时段</text>

        <!-- 横向滚动日期选择 -->
        <scroll-view scroll-x class="week-scroll" :show-scrollbar="false">
          <view class="week-list">
            <view
              v-for="day in weekDays"
              :key="day.date"
              class="day-item"
              :class="{ active: selectedDate === day.date, today: day.isToday, noslot: !day.hasSlots }"
              @tap="day.hasSlots && selectDate(day.date)"
            >
              <text class="day-name">{{ day.dayName }}</text>
              <text class="day-date">{{ day.dateNum }}</text>
            </view>
          </view>
        </scroll-view>

        <!-- 时段列表 -->
        <view class="slots-list">
          <view v-if="filteredSlots.length === 0" class="no-slots">
            <text style="font-size:24rpx;color:var(--ink-3);">该日期暂无可用时段</text>
          </view>
          <view
            v-for="slot in filteredSlots"
            :key="slot.id"
            class="slot-item"
            :class="{ active: selectedSlot === slot.id, full: slot.seatsLeft === 0 }"
            @tap="slot.seatsLeft > 0 && selectSlot(slot.id)"
          >
            <view class="slot-left">
              <text class="slot-time">{{ slot.time }}</text>
              <text class="slot-duration">{{ slot.duration }}</text>
            </view>
            <view class="slot-right">
              <view class="slot-seats" :class="{ full: slot.seatsLeft === 0 }">
                {{ slot.seatsLeft === 0 ? '已满' : `剩${slot.seatsLeft}位` }}
              </view>
            </view>
          </view>
        </view>
      </view>

      <view style="height:200rpx;" />
    </scroll-view>

    <!-- 底部操作栏 -->
    <view class="sticky-bar">
      <view class="bar-action" @tap="callService">
        <SvgIcon name="wechat" :color="'var(--moss)'" :size="40" />
        <text class="bar-action-label">客服</text>
      </view>
      <view class="bar-action" @tap="toggleFav">
        <SvgIcon name="heart" :color="isFav ? 'var(--primary)' : 'var(--ink-2)'" :size="40" :filled="isFav" />
        <text class="bar-action-label">收藏</text>
      </view>
      <view class="book-btn" @tap="toBook">立即预约</view>
    </view>
  </view>
</template>

<script setup>
import { ref, computed, onMounted } from 'vue'
import { onLoad } from '@dcloudio/uni-app'
import SvgIcon from '@/components/SvgIcon.vue'
import { getCourseDetail, getScheduleDetail } from '@/api/course.js'
import { normalizeCourse, formatScheduleTime } from '@/utils/normalize.js'

const statusBarHeight = ref(44)
const scrollHeight = ref(600)
const selectedClassType = ref('')
const selectedDate = ref('')
const selectedSlot = ref(null)
const loading = ref(true)
const isFav = ref(false)
let courseId = null

onMounted(() => {
  const info = uni.getSystemInfoSync()
  const sw = info.screenWidth || 375
  statusBarHeight.value = info.statusBarHeight || 44
  const navH = 88 * sw / 750           // nav bar ~88rpx
  const bannerH = 480 * sw / 750       // banner 480rpx
  const overlapH = 40 * sw / 750       // scroll-view 上移 40rpx
  const stickyH = Math.round(140 * sw / 750) // sticky bar + safe area
  scrollHeight.value = info.windowHeight - statusBarHeight.value - navH - bannerH + overlapH - stickyH
})

const course = ref({
  id: 0,
  name: '',
  category: '',
  ageRange: '',
  totalLessons: '',
  priceText: '',
  bannerBg: 'linear-gradient(135deg, #F9D9C4, #E8A87C, #D97757)',
  tagBg: '#F4DFB1',
  tagColor: '#8A5020',
  teacherName: '',
  teacherTitle: '',
  teacherAvatarBg: 'linear-gradient(135deg, #F4DFB1, #E8A87C)',
  intro: '',
  features: [],
})

const classTypes = ref([])
const availableSlots = ref([])
const locations = ref([])

onLoad(async (options) => {
  courseId = options?.id
  console.log('courseId:', courseId)

  // 生成当前日期及往后两周的日历
  const today = new Date()
  selectedDate.value = today.toISOString().split('T')[0]

  try {
    const res = await getCourseDetail(courseId)
    if (res) {
      const norm = normalizeCourse(res)
      course.value = {
        ...norm,
        totalLessons: '',
      }

      // Check if this course is favorited
      const stored = JSON.parse(uni.getStorageSync('favorites') || '[]')
      isFav.value = stored.some(f => String(f.id) === String(courseId))

      // 地点
      locations.value = res.locations || []

      // 课程类型，取courseTypes字段（camelCase或snake_case）
      const types = res.courseTypes || res.course_types || []
      courseTypesCache.value = types
      if (types.length) {
        classTypes.value = types.map(t => ({
          key: String(t.id),
          id: t.id,
          label: t.name,
          desc: t.description || `最多 ${t.capacity} 人`,
        }))
        selectedClassType.value = String(types[0].id)

        // 初始化时段，取 courseTypes[].schedules 中未取消的时段
        updateSlots(types[0])
      }
    }
  } catch(e) {
    console.error('course detail error:', e)
  } finally {
    loading.value = false
  }
})

// 生成日历日期 — 基于实际有课日期
const dayNames = ['周日', '周一', '周二', '周三', '周四', '周五', '周六']
const weekDays = ref([])

function buildCalendar(scheduleDates) {
  const days = []
  const today = new Date()
  const todayStr = today.toISOString().split('T')[0]
  const dateSet = new Set(scheduleDates)

  // 从今天起往后 13 天
  for (let i = 0; i <= 13; i++) {
    const d = new Date(today)
    d.setDate(today.getDate() + i)
    const dateStr = d.toISOString().split('T')[0]
    days.push({
      date: dateStr,
      dayName: dayNames[d.getDay()],
      dateNum: d.getDate(),
      isToday: dateStr === todayStr,
      hasSlots: dateSet.has(dateStr),
    })
  }
  // 将今天之前有课且最近的一两天也加入
  for (let i = 1; i <= 2; i++) {
    const d = new Date(today)
    d.setDate(today.getDate() - i)
    const dateStr = d.toISOString().split('T')[0]
    if (dateSet.has(dateStr)) {
      days.unshift({
        date: dateStr,
        dayName: dayNames[d.getDay()],
        dateNum: d.getDate(),
        isToday: false,
        hasSlots: true,
      })
    }
  }
  return days
}

// courseTypesCache 缓存API返回的原始类型数据，用于切换课程类型时重新计算时段
const courseTypesCache = ref([])

function updateSlots(typeObj) {
  if (!typeObj) { availableSlots.value = []; return }
  const allSlots = (typeObj.schedules || [])
    .filter(s => s.status !== 'cancelled')
    .map(s => ({
      id: s.id,
      time: `${(s.start_time || '').slice(0, 5)} - ${(s.end_time || '').slice(0, 5)}`,
      duration: '',
      date: s.date || '',
      seatsLeft: Math.max(0, (s.max_count || 0) - (s.booked_count || 0)),
    }))
  availableSlots.value = allSlots

  // Build calendar from actual schedule dates
  const dates = [...new Set(allSlots.map(s => s.date).filter(Boolean))]
  weekDays.value = buildCalendar(dates)

  // Auto-select first available date that has slots
  const todayStr = new Date().toISOString().split('T')[0]
  const firstAvailable = weekDays.value.find(d => d.hasSlots && d.date >= todayStr)
  if (firstAvailable) {
    selectedDate.value = firstAvailable.date
  } else if (weekDays.value.length) {
    selectedDate.value = weekDays.value[0].date
  }

  selectedSlot.value = null
}

function selectClassType(key) {
  selectedClassType.value = key
  const t = courseTypesCache.value.find(t => String(t.id) === key)
  updateSlots(t)
}

function selectDate(date) {
  selectedDate.value = date
  selectedSlot.value = null
}

const filteredSlots = computed(() => {
  if (!selectedDate.value) return availableSlots.value
  return availableSlots.value.filter(s => s.date === selectedDate.value)
})

function selectSlot(id) {
  selectedSlot.value = id
}

function goBack() {
  uni.navigateBack()
}

function toggleFav() {
  isFav.value = !isFav.value
  // Persist to localStorage
  const stored = JSON.parse(uni.getStorageSync('favorites') || '[]')
  if (isFav.value) {
    if (!stored.find(f => String(f.id) === String(course.value.id))) {
      stored.unshift({
        id: course.value.id,
        name: course.value.name,
        category: course.value.category,
        teacherName: course.value.teacherName,
        ageRange: course.value.ageRange,
        thumbBg: course.value.thumbBg,
        priceText: course.value.priceText,
        price: course.value.price,
      })
    }
  } else {
    const idx = stored.findIndex(f => String(f.id) === String(course.value.id))
    if (idx > -1) stored.splice(idx, 1)
  }
  uni.setStorageSync('favorites', JSON.stringify(stored))
  uni.showToast({
    title: isFav.value ? '已收藏' : '已取消收藏',
    icon: 'none',
    duration: 1200,
  })
}

function callService() {
  uni.showToast({ title: '联系客服', icon: 'none' })
}

function toTeacher() {
  const teacher = course.value.teachers?.[0]
  if (teacher) {
    uni.navigateTo({ url: `/pages/course/teacher?id=${teacher.id}&name=${encodeURIComponent(teacher.name || '')}` })
  }
}

function toLocation(loc) {
  if (loc?.latitude && loc?.longitude) {
    uni.openLocation({
      latitude: Number(loc.latitude),
      longitude: Number(loc.longitude),
      name: loc.name || '',
      address: loc.address || '',
    })
  } else {
    uni.navigateTo({ url: '/pages/mine/location' })
  }
}

function toBook() {
  if (!selectedSlot.value) {
    uni.showToast({ title: '请先选择上课时段', icon: 'none' })
    return
  }
  const typeId = selectedClassType.value || ''
  uni.navigateTo({
    url: `/pages/order/create?course_id=${course.value.id}&course_type_id=${typeId}&schedule_id=${selectedSlot.value}`
  })
}
</script>

<style lang="scss" scoped>
.page {
  min-height: 100vh;
  background: var(--paper);
  overflow-x: hidden;
}

.status-spacer {
  background: transparent;
}

.nav-bar {
  display: flex;
  align-items: center;
  justify-content: space-between;
  padding: 0 32rpx;
  height: 88rpx;
}

.back-btn {
  width: 64rpx;
  height: 64rpx;
  display: flex;
  align-items: center;
  justify-content: center;
}

.nav-title {
  font-size: 34rpx;
  font-weight: 600;
  color: var(--ink);
}

/* 渐变 Banner */
.banner {
  width: 100%;
  height: 480rpx;
  position: relative;
  overflow: hidden;
}

.banner-cover-img {
  position: absolute;
  top: 0; right: 0; bottom: 0; left: 0;
  width: 100%;
  height: 100%;
  z-index: 0;
}

.deco-c1 {
  position: absolute;
  width: 320rpx;
  height: 320rpx;
  border-radius: 50%;
  background: rgba(255, 255, 255, 0.12);
  top: -80rpx;
  right: -60rpx;
}

.deco-c2 {
  position: absolute;
  width: 180rpx;
  height: 180rpx;
  border-radius: 50%;
  background: rgba(255, 255, 255, 0.08);
  bottom: 40rpx;
  left: 40rpx;
}

/* 滚动内容 */
.scroll-content {
  width: 100%;
  overflow-y: scroll;
  overflow-x: hidden;
  background: var(--paper);
  margin-top: -40rpx;
  border-radius: 40rpx 40rpx 0 0;
}

/* 主信息卡 */
.main-card {
  margin: 0 24rpx 16rpx;
  background: var(--card);
  border-radius: 24rpx;
  padding: 32rpx;
  box-shadow: 0 4rpx 24rpx rgba(42, 37, 32, 0.08);
}

.top-row {
  display: flex;
  align-items: center;
  justify-content: space-between;
  margin-bottom: 16rpx;
}

.cat-tag {
  font-size: 22rpx;
  font-weight: 600;
  padding: 6rpx 18rpx;
  border-radius: 20rpx;
}

.price {
  font-size: 36rpx;
  font-weight: 800;
  color: var(--primary);
}

.course-title {
  display: block;
  font-size: 40rpx;
  font-weight: 800;
  color: var(--ink);
  line-height: 1.3;
  margin-bottom: 8rpx;
}

.course-subtitle {
  display: block;
  font-size: 26rpx;
  color: var(--ink-3);
  margin-bottom: 28rpx;
}

/* 讲师行 */
.teacher-row {
  display: flex;
  align-items: center;
  gap: 16rpx;
  padding: 20rpx;
  background: var(--paper);
  border-radius: 16rpx;
  transition: background 0.15s;

  &:active {
    background: var(--paper-2);
  }
}

.teacher-avatar {
  width: 72rpx;
  height: 72rpx;
  border-radius: 50%;
  display: flex;
  align-items: center;
  justify-content: center;
  flex-shrink: 0;
}

.teacher-initial {
  font-size: 28rpx;
  font-weight: 700;
  color: #fff;
}

.teacher-info {
  flex: 1;
}

.teacher-name {
  display: block;
  font-size: 28rpx;
  font-weight: 600;
  color: var(--ink);
}

.teacher-title {
  display: block;
  font-size: 22rpx;
  color: var(--ink-3);
  margin-top: 4rpx;
}

.teacher-arrow {
  font-size: 36rpx;
  color: var(--ink-3);
}

/* 卡片 Section */
.section-card {
  margin: 0 24rpx 16rpx;
  background: var(--card);
  border-radius: 24rpx;
  padding: 28rpx 32rpx;
  box-shadow: 0 2rpx 12rpx rgba(42, 37, 32, 0.05);
}

.section-label {
  display: block;
  font-size: 30rpx;
  font-weight: 700;
  color: var(--ink);
  margin-bottom: 20rpx;
}

/* 课程简介 */
.intro-text {
  display: block;
  font-size: 26rpx;
  color: var(--ink-2);
  line-height: 1.8;
  margin-bottom: 20rpx;
}

.feature-tags {
  display: flex;
  flex-wrap: wrap;
  gap: 12rpx;
}

.feature-tag {
  background: var(--paper);
  color: var(--ink-2);
  font-size: 22rpx;
  padding: 8rpx 18rpx;
  border-radius: 20rpx;
  font-weight: 500;
}

/* 课程类型 */
.class-type-row {
  display: flex;
  gap: 16rpx;
}

.class-type-btn {
  flex: 1;
  padding: 20rpx;
  border-radius: 16rpx;
  border: 2rpx solid var(--line);
  transition: all 0.2s;
  position: relative;

  &.active {
    border-color: var(--primary);
    background: rgba(217, 119, 87, 0.06);
  }
}

.type-check {
  position: absolute;
  top: 12rpx;
  right: 12rpx;
}

.type-name {
  display: block;
  font-size: 28rpx;
  font-weight: 600;
  color: var(--ink);
  margin-bottom: 4rpx;
}

.type-desc {
  font-size: 22rpx;
  color: var(--ink-3);
}

/* 地点卡片 */
.location-card {
  display: flex;
  align-items: center;
  gap: 16rpx;
  padding: 20rpx;
  background: var(--paper);
  border-radius: 16rpx;
}

.loc-pin-box {
  width: 72rpx;
  height: 72rpx;
  border-radius: 20rpx;
  background: var(--moss-soft, rgba(107, 127, 90, 0.15));
  display: flex;
  align-items: center;
  justify-content: center;
  flex-shrink: 0;
}

.loc-info {
  flex: 1;
}

.loc-name {
  display: block;
  font-size: 28rpx;
  font-weight: 600;
  color: var(--ink);
  margin-bottom: 4rpx;
}

.loc-addr {
  display: block;
  font-size: 22rpx;
  color: var(--ink-3);
}

.nav-btn {
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 4rpx;
  color: var(--primary);
  flex-shrink: 0;
}

.nav-label {
  font-size: 20rpx;
  font-weight: 600;
  color: var(--primary);
}

/* 日期选择 */
.week-scroll {
  width: 100%;
  margin-bottom: 20rpx;
}

.week-list {
  display: inline-flex;
  gap: 12rpx;
}

.day-item {
  display: inline-flex;
  flex-direction: column;
  align-items: center;
  padding: 14rpx 16rpx;
  border-radius: 16rpx;
  border: 2rpx solid transparent;
  min-width: 80rpx;
  transition: all 0.2s;

  &.today {
    border-color: var(--primary-soft);
  }

  &.active {
    background: var(--primary);
    border-color: var(--primary);
  }

  &.noslot {
    opacity: 0.35;
  }
}

.day-name {
  font-size: 20rpx;
  color: var(--ink-3);
  margin-bottom: 6rpx;

  .active & {
    color: rgba(255, 255, 255, 0.8);
  }
}

.day-date {
  font-size: 32rpx;
  font-weight: 700;
  color: var(--ink);

  .active & {
    color: #fff;
  }
}

/* 时段列表 */
.slots-list {
  display: flex;
  flex-direction: column;
  gap: 12rpx;
}

.slot-item {
  display: flex;
  align-items: center;
  justify-content: space-between;
  padding: 20rpx 24rpx;
  border-radius: 16rpx;
  border: 2rpx solid var(--line);
  transition: all 0.2s;

  &.active {
    border-color: var(--primary);
    background: rgba(217, 119, 87, 0.06);
  }

  &.full {
    opacity: 0.5;
  }
}

.slot-time {
  display: block;
  font-size: 28rpx;
  font-weight: 600;
  color: var(--ink);
  margin-bottom: 4rpx;
}

.slot-duration {
  display: block;
  font-size: 22rpx;
  color: var(--ink-3);
}

.slot-seats {
  font-size: 22rpx;
  font-weight: 600;
  color: #6B7F5A;
  background: rgba(107, 127, 90, 0.12);
  padding: 6rpx 16rpx;
  border-radius: 16rpx;

  &.full {
    color: var(--ink-3);
    background: rgba(138, 126, 112, 0.1);
  }
}

/* 底部操作栏 */
.sticky-bar {
  position: fixed;
  bottom: 0;
  left: 0;
  right: 0;
  display: flex;
  align-items: center;
  gap: 0;
  padding: 20rpx 32rpx;
  padding-bottom: calc(20rpx + constant(safe-area-inset-bottom));
  padding-bottom: calc(20rpx + env(safe-area-inset-bottom));
  background: var(--card);
  box-shadow: 0 -4rpx 24rpx rgba(42, 37, 32, 0.08);
  box-sizing: border-box;
}

.bar-action {
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 4rpx;
  padding: 0 20rpx;
  flex-shrink: 0;
}

.bar-action-label {
  font-size: 18rpx;
  color: var(--ink-3);
  font-weight: 500;
}

.book-btn {
  flex: 1;
  background: var(--primary);
  color: #fff;
  font-size: 30rpx;
  font-weight: 700;
  padding: 24rpx 0;
  border-radius: 20rpx;
  text-align: center;
  box-shadow: 0 4rpx 16rpx rgba(217, 119, 87, 0.36);
  transition: all 0.15s;
  margin-left: 16rpx;

  &:active {
    transform: scale(0.96);
    box-shadow: 0 2rpx 8rpx rgba(217, 119, 87, 0.24);
  }
}


</style>
