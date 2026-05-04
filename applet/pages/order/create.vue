<template>
  <view class="page">
    <!-- 状态栏高度 + 导航栏 -->
    <view class="header">
      <view class="status-bar" :style="{ height: statusBarHeight + 'px' }"></view>
      <view class="nav-bar">
        <view class="back-btn" @tap="goBack">
          <SvgIcon name="chevron-left" :color="'var(--ink)'" :size="28" />
        </view>
        <text class="nav-title">确认预约</text>
        <view style="width: 64rpx;"></view>
      </view>
    </view>

    <scroll-view scroll-y class="scroll-content" :style="{ height: scrollHeight + 'px' }">

      <!-- 课程信息摘要 -->
      <view class="course-summary">
        <view class="course-thumb" :style="{ background: course.thumbBg }">
          <image
            v-if="course.cover"
            class="thumb-img"
            :src="course.cover"
            mode="aspectFill"
          />
          <text v-else class="thumb-emoji">🎨</text>
        </view>
        <view class="course-detail">
          <text class="course-name">{{ course.name }}</text>
          <view class="cat-row">
            <view class="cat-tag">{{ course.category }}</view>
            <text class="class-type">{{ selectedClassType }}</text>
          </view>
          <text class="teacher">{{ course.teacherName }} · {{ course.ageRange }}</text>
        </view>
      </view>

      <!-- 上课时间卡片 -->
      <view class="info-card">
        <text class="card-label">上课时间</text>
        <view class="slot-display">
          <SvgIcon name="clock" color="var(--ink-2)" :size="40" />
          <view class="slot-info">
            <text class="slot-date">{{ scheduleInfo.time || scheduleInfo.date || '请选择时间段' }}</text>
          </view>
          <view class="slot-seats" v-if="seatsLeft > 0">剩{{ seatsLeft }}位</view>
        </view>
      </view>

      <!-- 名额紧张提示 -->
      <view class="warning-strip" v-if="seatsWarning">
        <text class="warning-icon">⚠️</text>
        <text class="warning-text">仅剩 {{ seatsLeft }} 个名额，请尽快确认预约</text>
      </view>

      <!-- 已有学员：快捷选择 -->
      <view class="form-card" v-if="students.length > 0">
        <text class="card-label">选择学员</text>
        <view class="student-picker">
          <view
            v-for="s in students"
            :key="s.id"
            class="student-chip"
            :class="{ active: selectedStudentId === s.id }"
            @tap="selectExistingStudent(s)"
          >
            <text class="chip-emoji">🎨</text>
            <text class="chip-name">{{ s.name }}</text>
            <text class="chip-age" v-if="s.age">{{ s.age }}岁</text>
          </view>
          <view
            class="student-chip new"
            :class="{ active: selectedStudentId === 0 }"
            @tap="selectNewStudent"
          >
            <text class="chip-plus">+</text>
            <text class="chip-name">新学员</text>
          </view>
        </view>
      </view>

      <!-- 学员信息表单（新学员或编辑已有学员） -->
      <view class="form-card" v-if="selectedStudentId === 0">
        <text class="card-label">{{ students.length > 0 ? '新学员信息' : '学员信息' }}</text>

        <view class="form-item">
          <text class="form-label">学员姓名</text>
          <input
            class="form-input"
            v-model="form.studentName"
            placeholder="请输入学员姓名"
            placeholder-style="color: #8A7E70"
          />
        </view>
        <view class="form-divider"></view>

        <view class="form-item">
          <text class="form-label">年龄</text>
          <input
            class="form-input"
            v-model="form.studentAge"
            type="number"
            placeholder="请输入年龄"
            placeholder-style="color: #8A7E70"
          />
        </view>
        <view class="form-divider"></view>

        <view class="form-item">
          <text class="form-label">联系电话</text>
          <input
            class="form-input"
            v-model="form.phone"
            type="tel"
            placeholder="请输入联系电话"
            placeholder-style="color: #8A7E70"
          />
        </view>
      </view>

      <!-- 费用明细 -->
      <view class="price-card">
        <view class="price-row">
          <text class="price-label">课程原价</text>
          <text class="price-val">¥{{ coursePrice }}</text>
        </view>
        <view class="price-row">
          <text class="price-label">优惠</text>
          <text class="price-discount">-¥0</text>
        </view>
        <view class="price-divider"></view>
        <view class="price-row total">
          <text class="price-label">合计</text>
          <text class="price-total">¥{{ coursePrice }}</text>
        </view>
        <text class="price-note">* 课程费用将在审核通过后由工作人员与您确认缴费方式</text>
      </view>

      <view class="bottom-space"></view>
    </scroll-view>

    <!-- 底部提交按钮 -->
    <view class="sticky-bar">
      <view class="submit-btn" :class="{ loading: submitting }" @tap="handleSubmit">
        <text v-if="!submitting">提交预约</text>
        <text v-else>提交中...</text>
      </view>
    </view>
  </view>
</template>

<script setup>
import { ref, computed, onMounted } from 'vue'
import { onLoad } from '@dcloudio/uni-app'
import { createOrder } from '@/api/order.js'
import { getCourseDetail, getScheduleDetail } from '@/api/course.js'
import { getStudents, createStudent } from '@/api/student.js'
import { useUserStore } from '@/stores/user.js'
import SvgIcon from '@/components/SvgIcon.vue'
import { normalizeCourse, formatScheduleTime } from '@/utils/normalize.js'

const statusBarHeight = ref(44)
const scrollHeight = ref(600)
const submitting = ref(false)
const seatsLeft = ref(0)
const seatsWarning = computed(() => seatsLeft.value > 0 && seatsLeft.value <= 3)

// 路由参数
let routeOpts = {}

onMounted(() => {
  const info = uni.getSystemInfoSync()
  statusBarHeight.value = info.statusBarHeight || 44
  scrollHeight.value = info.windowHeight - statusBarHeight.value - 44 - 100
})

const course = ref({
  name: '',
  category: '',
  teacherName: '',
  ageRange: '',
  thumbBg: 'linear-gradient(135deg, #F9D9C4, #E8A87C)',
})

const selectedClassType = ref('')
const scheduleInfo = ref({ date: '', time: '' })
const coursePrice = ref(0)
const students = ref([])
const selectedStudentId = ref(0)

const form = ref({
  studentName: '',
  studentAge: '',
  phone: '',
})

onLoad(async (options) => {
  routeOpts = options || {}
  console.log('create order options:', routeOpts)

  const userStore = useUserStore()
  if (!userStore.isLoggedIn) {
    try { await userStore.login() } catch(e) { return }
  }

  // 并行加载课程详情、时段详情、学员列表
  const promises = []
  if (routeOpts.course_id) {
    promises.push(getCourseDetail(routeOpts.course_id))
  } else {
    promises.push(Promise.resolve(null))
  }
  if (routeOpts.schedule_id) {
    promises.push(getScheduleDetail(routeOpts.schedule_id))
  } else {
    promises.push(Promise.resolve(null))
  }
  promises.push(getStudents())

  try {
    const [courseRes, scheduleRes, studentsRes] = await Promise.all(promises)

    if (courseRes) {
      const norm = normalizeCourse(courseRes)
      course.value = {
        name: norm.name,
        category: norm.category,
        teacherName: norm.teacherName,
        ageRange: norm.ageRange,
        thumbBg: norm.thumbBg,
        cover: norm.cover,
      }
      // 找到对应课程类型并提取价格
      const types = courseRes.courseTypes || courseRes.course_types || []
      if (routeOpts.course_type_id && types.length) {
        const ct = types.find(t => String(t.id) === String(routeOpts.course_type_id))
        selectedClassType.value = ct?.name || ''
        coursePrice.value = ct?.price || 0
      }
    }

    if (scheduleRes) {
      seatsLeft.value = Math.max(0, (scheduleRes.max_count || 0) - (scheduleRes.booked_count || 0))
      scheduleInfo.value = {
        date: scheduleRes.date || '',
        time: formatScheduleTime(scheduleRes),
      }
    }

    students.value = studentsRes || []
    if (students.value.length > 0) {
      const first = students.value[0]
      selectedStudentId.value = first.id
      form.value.studentName = first.name
      form.value.studentAge = String(first.age || '')
      form.value.phone = first.phone || ''
    } else {
      selectedStudentId.value = 0
    }
  } catch(e) {
    console.error('create page load error:', e)
  }
})

function selectExistingStudent(s) {
  selectedStudentId.value = s.id
  form.value.studentName = s.name
  form.value.studentAge = String(s.age || '')
  form.value.phone = s.phone || ''
}

function selectNewStudent() {
  selectedStudentId.value = 0
  form.value.studentName = ''
  form.value.studentAge = ''
  form.value.phone = ''
}

function validate() {
  if (!selectedStudentId.value && selectedStudentId.value !== 0) {
    uni.showToast({ title: '请选择学员', icon: 'none' })
    return false
  }
  if (selectedStudentId.value === 0) {
    if (!form.value.studentName) {
      uni.showToast({ title: '请填写学员姓名', icon: 'none' })
      return false
    }
    if (!form.value.phone) {
      uni.showToast({ title: '请填写联系电话', icon: 'none' })
      return false
    }
  }
  return true
}

async function handleSubmit() {
  const courseId = Number(routeOpts.course_id)
  const courseTypeId = Number(routeOpts.course_type_id)
  const scheduleId = Number(routeOpts.schedule_id)
  if (!courseId || !courseTypeId || !scheduleId) {
    uni.showToast({ title: '预约信息有误，请返回重试', icon: 'none' })
    return
  }
  if (!validate()) return
  submitting.value = true
  try {
    let studentId = selectedStudentId.value
    // 如果选择新学员，先创建
    if (studentId === 0) {
      const newStudent = await createStudent({
        name: form.value.studentName,
        age: Number(form.value.studentAge) || undefined,
        phone: form.value.phone,
      })
      studentId = newStudent?.id || newStudent
    }
    await createOrder({
      course_id: courseId,
      course_type_id: courseTypeId,
      schedule_id: scheduleId,
      student_id: studentId,
    })
    const qs = [
      `courseName=${encodeURIComponent(course.value.name || '')}`,
      `timeSlot=${encodeURIComponent(scheduleInfo.value.time || scheduleInfo.value.date || '')}`,
      `studentName=${encodeURIComponent(form.value.studentName || '')}`,
    ].join('&')
    uni.redirectTo({ url: `/pages/order/success?${qs}` })
  } catch(e) {
    uni.showToast({ title: e?.message || '提交失败', icon: 'none' })
  } finally {
    submitting.value = false
  }
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

.header {
  background: var(--paper-2);
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

.back-icon {
  font-size: 48rpx;
  color: var(--ink);
  font-weight: 300;
  line-height: 1;
  margin-top: -4rpx;
}

.nav-title {
  font-size: 34rpx;
  font-weight: 700;
  color: var(--ink);
}

/* 滚动区域 */
.scroll-content {
  width: 100%;
  overflow-y: scroll;
  overflow-x: hidden;
  padding: 24rpx 32rpx 0;
}

/* 课程信息摘要 */
.course-summary {
  display: flex;
  gap: 20rpx;
  background: var(--card);
  border-radius: 24rpx;
  padding: 24rpx;
  margin-bottom: 16rpx;
  box-shadow: 0 2rpx 16rpx rgba(42, 37, 32, 0.06);
  align-items: center;
}

.course-thumb {
  width: 120rpx;
  height: 120rpx;
  border-radius: 18rpx;
  flex-shrink: 0;
  display: flex;
  align-items: center;
  justify-content: center;
  position: relative;
  overflow: hidden;
}

.thumb-img {
  position: absolute;
  inset: 0;
  width: 100%;
  height: 100%;
  border-radius: inherit;
}

.thumb-emoji {
  font-size: 52rpx;
}

.course-detail {
  flex: 1;
  min-width: 0;
}

.course-name {
  display: block;
  font-size: 30rpx;
  font-weight: 700;
  color: var(--ink);
  margin-bottom: 8rpx;
  overflow: hidden;
  text-overflow: ellipsis;
  white-space: nowrap;
}

.cat-row {
  display: flex;
  align-items: center;
  gap: 12rpx;
  margin-bottom: 8rpx;
}

.cat-tag {
  background: var(--primary-soft);
  color: var(--primary-deep);
  font-size: 20rpx;
  font-weight: 500;
  padding: 4rpx 14rpx;
  border-radius: 20rpx;
}

.class-type {
  font-size: 22rpx;
  color: var(--ink-3);
}

.teacher {
  display: block;
  font-size: 22rpx;
  color: var(--ink-3);
}

/* 信息卡片 */
.info-card {
  background: var(--card);
  border-radius: 24rpx;
  padding: 24rpx;
  margin-bottom: 16rpx;
  box-shadow: 0 2rpx 12rpx rgba(42, 37, 32, 0.05);
}

.card-label {
  display: block;
  font-size: 28rpx;
  font-weight: 700;
  color: var(--ink);
  margin-bottom: 20rpx;
}

/* 时段显示 */
.slot-display {
  display: flex;
  align-items: center;
  gap: 16rpx;
  padding: 16rpx;
  background: var(--paper);
  border-radius: 16rpx;
}

.slot-icon {
  font-size: 40rpx;
  flex-shrink: 0;
}

.slot-info {
  flex: 1;
}

.slot-date {
  display: block;
  font-size: 26rpx;
  font-weight: 600;
  color: var(--ink);
  margin-bottom: 4rpx;
}

.slot-time {
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
  flex-shrink: 0;
}

/* 学员选择器 */
.student-picker {
  display: flex;
  flex-wrap: wrap;
  gap: 16rpx;
}
.student-chip {
  display: flex;
  align-items: center;
  gap: 10rpx;
  padding: 14rpx 24rpx;
  border-radius: 20rpx;
  border: 2rpx solid var(--line);
  background: var(--card);
  transition: all 0.15s;
  &.active {
    border-color: var(--primary);
    background: var(--primary-soft);
  }
  &.new {
    border-style: dashed;
  }
}
.chip-emoji { font-size: 28rpx; }
.chip-name { font-size: 26rpx; font-weight: 500; color: var(--ink); }
.chip-age { font-size: 22rpx; color: var(--ink-3); }
.chip-plus { font-size: 28rpx; color: var(--primary); font-weight: 300; }

/* 警告条 */
.warning-strip {
  display: flex;
  align-items: center;
  gap: 12rpx;
  padding: 16rpx 24rpx;
  background: rgba(217, 119, 87, 0.08);
  border-radius: 16rpx;
  border: 1rpx solid rgba(217, 119, 87, 0.2);
  margin-bottom: 16rpx;
}

.warning-icon {
  font-size: 30rpx;
}

.warning-text {
  font-size: 26rpx;
  color: var(--primary-deep);
  font-weight: 500;
}

/* 表单 */
.form-card {
  background: var(--card);
  border-radius: 24rpx;
  padding: 24rpx;
  margin-bottom: 16rpx;
  box-shadow: 0 2rpx 12rpx rgba(42, 37, 32, 0.05);
}

.form-item {
  display: flex;
  align-items: center;
  padding: 16rpx 0;
}

.form-label {
  width: 160rpx;
  font-size: 28rpx;
  color: var(--ink);
  font-weight: 500;
  flex-shrink: 0;
}

.form-input {
  flex: 1;
  font-size: 28rpx;
  color: var(--ink);
  text-align: right;
}

.form-divider {
  height: 1rpx;
  background: var(--line);
}

/* 备注 */
.notes-input {
  width: 100%;
  font-size: 26rpx;
  color: var(--ink);
  line-height: 1.8;
  min-height: 140rpx;
  margin-bottom: 12rpx;
}

.notes-count {
  display: block;
  text-align: right;
  font-size: 22rpx;
  color: var(--ink-3);
}

/* 价格卡 */
.price-card {
  background: var(--card);
  border-radius: 24rpx;
  padding: 24rpx;
  margin-bottom: 16rpx;
  box-shadow: 0 2rpx 12rpx rgba(42, 37, 32, 0.05);
}

.price-row {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 10rpx 0;

  &.total {
    margin-top: 8rpx;
  }
}

.price-label {
  font-size: 26rpx;
  color: var(--ink-2);
}

.price-val {
  font-size: 26rpx;
  color: var(--ink);
}

.price-discount {
  font-size: 26rpx;
  color: var(--moss);
}

.price-divider {
  height: 1rpx;
  background: var(--line);
  margin: 8rpx 0;
}

.price-total {
  font-size: 36rpx;
  font-weight: 800;
  color: var(--primary);
}

.price-note {
  display: block;
  font-size: 22rpx;
  color: var(--ink-3);
  margin-top: 16rpx;
  line-height: 1.6;
}

/* 底部操作栏 */
.sticky-bar {
  position: fixed;
  bottom: 0;
  left: 0;
  right: 0;
  padding: 20rpx 32rpx;
  padding-bottom: calc(20rpx + constant(safe-area-inset-bottom));
  padding-bottom: calc(20rpx + env(safe-area-inset-bottom));
  background: var(--card);
  box-shadow: 0 -4rpx 24rpx rgba(42, 37, 32, 0.08);
  box-sizing: border-box;
}

.submit-btn {
  display: flex;
  align-items: center;
  justify-content: center;
  background: var(--primary);
  color: #fff;
  font-size: 32rpx;
  font-weight: 700;
  padding: 28rpx;
  border-radius: 20rpx;
  box-shadow: 0 4rpx 20rpx rgba(217, 119, 87, 0.36);
  transition: all 0.15s;
  letter-spacing: 2rpx;

  &:active {
    transform: scale(0.97);
    box-shadow: 0 2rpx 10rpx rgba(217, 119, 87, 0.24);
  }

  &.loading {
    opacity: 0.7;
  }
}

.bottom-space {
  height: 160rpx;
}
</style>
