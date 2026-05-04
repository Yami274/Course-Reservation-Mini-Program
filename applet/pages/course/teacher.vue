<template>
  <view class="page">
    <!-- 状态栏高度 + 导航栏 -->
    <view class="header-bg">
      <view class="status-bar" :style="{ height: statusBarHeight + 'px' }"></view>
      <view class="nav-bar">
        <view class="back-btn" @tap="goBack">
          <SvgIcon name="chevron-left" :color="'var(--ink)'" :size="28" />
        </view>
        <text class="nav-title">讲师介绍</text>
        <view style="width: 64rpx;"></view>
      </view>
    </view>

    <scroll-view scroll-y class="scroll-content" :style="{ height: scrollHeight + 'px' }">

      <!-- 讲师信息卡片 -->
      <view class="hero-card">
        <view class="hero-inner">
          <!-- 头像 -->
          <view class="avatar-wrap" :style="{ background: teacher.avatarBg }">
            <text class="avatar-text">{{ teacher.name[0] }}</text>
          </view>

          <!-- 姓名、评分、课时 -->
          <view class="hero-info">
            <view class="name-row">
              <text class="teacher-name">{{ teacher.name }}</text>
              <view class="rating-tag">
                <SvgIcon name="star" color="#8A6020" :size="22" :filled="true" />
                <text class="rating-text">{{ teacher.rating }}</text>
              </view>
            </view>
            <text class="teacher-title">{{ teacher.title }}</text>
            <text class="sessions-info">已完成{{ teacher.totalSessions }}节课</text>
          </view>
        </view>

        <!-- 三项数据统计 -->
        <view class="stats-row">
          <view class="stat-item">
            <text class="stat-num">{{ teacher.yearsExp }}</text>
            <text class="stat-label">教学年限</text>
          </view>
          <view class="stat-divider"></view>
          <view class="stat-item">
            <text class="stat-num">{{ teacher.studentCount }}</text>
            <text class="stat-label">累计学员</text>
          </view>
          <view class="stat-divider"></view>
          <view class="stat-item">
            <text class="stat-num">{{ teacher.courseCount }}</text>
            <text class="stat-label">开设课程</text>
          </view>
        </view>
      </view>

      <!-- 关于我 -->
      <view class="section-card">
        <text class="section-label">关于我</text>
        <text class="about-text">{{ teacher.about }}</text>

        <!-- 标签 -->
        <view class="tag-row">
          <view v-for="tag in teacher.tags" :key="tag" class="about-tag">{{ tag }}</view>
        </view>
      </view>

      <!-- 教学风采 -->
      <view class="section-card">
        <text class="section-label">教学风采</text>
        <view class="photo-grid">
          <view
            v-for="(photo, i) in teacher.photos"
            :key="i"
            class="photo-item"
            :style="{ background: photo.bg }"
          >
            <text class="photo-icon">{{ photo.icon }}</text>
          </view>
        </view>
      </view>

      <!-- 在教课程 -->
      <view class="section-card">
        <text class="section-label">在教课程</text>
        <view class="active-courses">
          <view
            v-for="course in teacher.activeCourses"
            :key="course.id"
            class="course-item"
            @tap="toCourseDetail(course)"
          >
            <view class="course-thumb" :style="{ background: course.thumbBg }">
              <view class="course-seats" :class="{ full: course.seatsLeft === 0 }">
                {{ course.seatsLeft === 0 ? '已满' : `剩${course.seatsLeft}位` }}
              </view>
            </view>
            <view class="course-info">
              <text class="course-name">{{ course.name }}</text>
              <text class="course-age">{{ course.ageRange }}</text>
              <text class="course-price">{{ course.priceText }}</text>
            </view>
            <text class="course-arrow">›</text>
          </view>
        </view>
      </view>

      <view class="bottom-space"></view>
    </scroll-view>
  </view>
</template>

<script setup>
import { ref, onMounted } from 'vue'
import { onLoad } from '@dcloudio/uni-app'
import { getCourses, getCourseDetail } from '@/api/course.js'
import { normalizeCourse, formatScheduleTime } from '@/utils/normalize.js'
import SvgIcon from '@/components/SvgIcon.vue'

const THUMB_COLORS = [
  'linear-gradient(135deg, #F9D9C4, #E8A87C, #D97757)',
  'linear-gradient(135deg, #C7D1B6, #8AAA70, #6B7F5A)',
  'linear-gradient(135deg, #C5D5DD, #7A9CB0, #5A7C90)',
]

const statusBarHeight = ref(44)
const scrollHeight = ref(600)
const loading = ref(true)

let teacherId = null
let teacherName = ''

onMounted(() => {
  const info = uni.getSystemInfoSync()
  statusBarHeight.value = info.statusBarHeight || 44
  scrollHeight.value = info.windowHeight - statusBarHeight.value - 44
})

onLoad(async (options) => {
  teacherId = options?.id
  teacherName = decodeURIComponent(options?.name || '')
  await loadTeacherData()
})

const teacher = ref({
  name: '',
  title: '',
  rating: '4.9',
  totalSessions: 0,
  yearsExp: 0,
  studentCount: 0,
  courseCount: 0,
  avatarBg: 'linear-gradient(135deg, #F9D9C4, #E8A87C)',
  about: '',
  tags: [],
  photos: [
    { bg: 'linear-gradient(135deg, #F9D9C4, #E8A87C)', icon: '🎨' },
    { bg: 'linear-gradient(135deg, #C7D1B6, #7A9F70)', icon: '🖌️' },
    { bg: 'linear-gradient(135deg, #F2C9B5, #D99070)', icon: '🖼️' },
    { bg: 'linear-gradient(135deg, #C5D5DD, #7A9CB0)', icon: '✏️' },
  ],
  activeCourses: [],
})

async function loadTeacherData() {
  loading.value = true
  try {
    // Fetch all published courses to find teacher info
    const coursesRes = await getCourses({ pageSize: 100, status: 'published' })
    const allCourses = coursesRes?.list || coursesRes || []

    // Find courses that include this teacher
    let teacherInfo = null
    const teacherCourses = []

    // Try to find teacher from course detail
    if (teacherId && allCourses.length > 0) {
      // Try a few courses to find the teacher
      for (const c of allCourses.slice(0, 3)) {
        try {
          const detail = await getCourseDetail(c.id)
          const matched = (detail.teachers || []).find(t => String(t.id) === String(teacherId))
          if (matched) {
            teacherInfo = matched
            break
          }
        } catch(e) { /* continue */ }
      }
    }

    // If not found by ID, use the first course's teacher as fallback
    if (!teacherInfo && allCourses.length > 0) {
      try {
        const detail = await getCourseDetail(allCourses[0].id)
        teacherInfo = (detail.teachers || [])[0]
      } catch(e) { /* ignore */ }
    }

    if (teacherInfo) {
      teacher.value = {
        ...teacher.value,
        name: teacherInfo.name || teacherName,
        title: teacherInfo.title || '专业美术讲师',
        about: teacherInfo.intro || '暂无简介',
        tags: teacherInfo.title ? teacherInfo.title.split(/[/、，,·]+/).filter(Boolean) : [],
      }
    }

    // Load teacher's courses
    // Since list API doesn't include teacher_ids, show all published courses as "在教课程"
    const normalized = allCourses.map(normalizeCourse)
    teacher.value.activeCourses = normalized.map(c => ({
      id: c.id,
      name: c.name,
      ageRange: c.ageRange || '',
      thumbBg: THUMB_COLORS[c.id % THUMB_COLORS.length],
      seatsLeft: c.seatsLeft,
      priceText: c.priceText,
    }))
    teacher.value.courseCount = normalized.length
  } catch(e) {
    console.error('teacher load error:', e)
  } finally {
    loading.value = false
  }
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

.header-bg {
  background: linear-gradient(180deg, #FAF4E8, #F5EDE0);
}

.status-bar {}

.nav-bar {
  display: flex;
  align-items: center;
  justify-content: space-between;
  padding: 12rpx 24rpx 16rpx;
}

.back-btn {
  width: 64rpx;
  height: 64rpx;
  display: flex;
  align-items: center;
  justify-content: center;
  background: var(--card);
  border-radius: 50%;
  box-shadow: 0 2rpx 12rpx rgba(42, 37, 32, 0.08);
}


.nav-title {
  font-size: 32rpx;
  font-weight: 700;
  color: var(--ink);
}

/* 滚动内容 */
.scroll-content {
  width: 100%;
  overflow-y: scroll;
  overflow-x: hidden;
}

/* 讲师主卡片 */
.hero-card {
  margin: 20rpx 32rpx;
  background: var(--card);
  border-radius: 24rpx;
  padding: 32rpx;
  box-shadow: 0 4rpx 24rpx rgba(42, 37, 32, 0.08);
}

.hero-inner {
  display: flex;
  gap: 24rpx;
  align-items: flex-start;
  margin-bottom: 32rpx;
}

.avatar-wrap {
  width: 152rpx;
  height: 152rpx;
  border-radius: 50%;
  display: flex;
  align-items: center;
  justify-content: center;
  flex-shrink: 0;
  box-shadow: 0 4rpx 16rpx rgba(217, 119, 87, 0.2);
}

.avatar-text {
  font-size: 56rpx;
  font-weight: 800;
  color: #fff;
}

.hero-info {
  flex: 1;
  padding-top: 8rpx;
}

.name-row {
  display: flex;
  align-items: center;
  gap: 16rpx;
  margin-bottom: 8rpx;
}

.teacher-name {
  font-size: 40rpx;
  font-weight: 800;
  color: var(--ink);
}

.rating-tag {
  background: rgba(232, 184, 96, 0.2);
  color: #8A6020;
  font-size: 22rpx;
  font-weight: 600;
  padding: 6rpx 16rpx;
  border-radius: 20rpx;
  display: flex;
  align-items: center;
  gap: 6rpx;
}

.rating-text {
  font-size: 22rpx;
  font-weight: 600;
  color: #8A6020;
}

.teacher-title {
  display: block;
  font-size: 26rpx;
  color: var(--ink-3);
  margin-bottom: 8rpx;
}

.sessions-info {
  display: block;
  font-size: 24rpx;
  color: var(--primary);
  font-weight: 500;
}

/* 统计数据行 */
.stats-row {
  display: flex;
  align-items: center;
  padding: 24rpx 0 8rpx;
  border-top: 1rpx solid var(--line);
}

.stat-item {
  flex: 1;
  text-align: center;
}

.stat-num {
  display: block;
  font-size: 40rpx;
  font-weight: 800;
  color: var(--primary);
  margin-bottom: 4rpx;
}

.stat-label {
  display: block;
  font-size: 22rpx;
  color: var(--ink-3);
}

.stat-divider {
  width: 1rpx;
  height: 60rpx;
  background: var(--line);
}

/* 卡片 Section */
.section-card {
  margin: 0 32rpx 16rpx;
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

/* 关于我 */
.about-text {
  display: block;
  font-size: 26rpx;
  color: var(--ink-2);
  line-height: 1.8;
  margin-bottom: 20rpx;
}

.tag-row {
  display: flex;
  flex-wrap: wrap;
  gap: 12rpx;
}

.about-tag {
  background: var(--paper);
  color: var(--ink-2);
  font-size: 22rpx;
  font-weight: 500;
  padding: 8rpx 20rpx;
  border-radius: 20rpx;
}

/* 教学风采 */
.photo-grid {
  display: grid;
  grid-template-columns: 1fr 1fr;
  gap: 16rpx;
}

.photo-item {
  height: 180rpx;
  border-radius: 16rpx;
  display: flex;
  align-items: center;
  justify-content: center;
}

.photo-icon {
  font-size: 60rpx;
}

/* 在教课程 */
.active-courses {
  display: flex;
  flex-direction: column;
  gap: 16rpx;
}

.course-item {
  display: flex;
  align-items: center;
  gap: 20rpx;
  padding: 16rpx;
  background: var(--paper);
  border-radius: 16rpx;
  transition: background 0.15s;

  &:active {
    background: var(--paper-2);
  }
}

.course-thumb {
  width: 100rpx;
  height: 100rpx;
  border-radius: 14rpx;
  flex-shrink: 0;
  position: relative;
  display: flex;
  align-items: flex-end;
  justify-content: flex-end;
  padding: 8rpx;
}

.course-seats {
  font-size: 18rpx;
  font-weight: 600;
  color: #6B7F5A;
  background: rgba(255, 252, 245, 0.9);
  padding: 3rpx 10rpx;
  border-radius: 16rpx;

  &.full {
    color: var(--ink-3);
  }
}

.course-info {
  flex: 1;
  min-width: 0;
}

.course-name {
  display: block;
  font-size: 26rpx;
  font-weight: 600;
  color: var(--ink);
  overflow: hidden;
  text-overflow: ellipsis;
  white-space: nowrap;
  margin-bottom: 4rpx;
}

.course-age {
  display: block;
  font-size: 22rpx;
  color: var(--ink-3);
  margin-bottom: 4rpx;
}

.course-price {
  display: block;
  font-size: 24rpx;
  font-weight: 700;
  color: var(--primary);
}

.course-arrow {
  font-size: 36rpx;
  color: var(--ink-3);
}

.bottom-space {
  height: 40rpx;
}
</style>
