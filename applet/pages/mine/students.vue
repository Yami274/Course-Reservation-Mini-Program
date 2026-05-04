<template>
  <view class="page">
    <!-- 头部 -->
    <view class="header" :style="{ paddingTop: statusBarHeight + 'px' }">
      <view class="nav-bar">
        <view class="back-btn" @tap="goBack">
          <SvgIcon name="chevron-left" :color="'var(--ink)'" :size="28" />
        </view>
        <text class="nav-title">学员管理</text>
        <view style="width: 64rpx;"></view>
      </view>
    </view>

    <scroll-view scroll-y class="scroll-content" :style="{ height: scrollHeight + 'px' }">

      <!-- 学员卡片列表 -->
      <view class="students-list">
        <view
          v-for="student in students"
          :key="student.id"
          class="student-card"
          @tap="editStudent(student)"
        >
          <!-- 头像 -->
          <view class="stu-avatar" :style="{ background: student.avatarBg }">
            <text class="stu-emoji">{{ student.emoji }}</text>
          </view>

          <!-- 信息 -->
          <view class="stu-info">
            <view class="stu-name-row">
              <text class="stu-name">{{ student.name }}</text>
              <view v-if="student.isPrimary" class="primary-tag">主要学员</view>
            </view>
            <text class="stu-age">{{ student.age }}岁 · {{ student.school }}</text>
            <view class="stu-tags">
              <view
                v-for="tag in student.interests"
                :key="tag"
                class="interest-tag"
              >{{ tag }}</view>
            </view>
          </view>

          <!-- 右侧箭头 -->
          <text class="stu-arrow">›</text>
        </view>
      </view>

      <!-- 添加学员按钮 -->
      <view class="add-btn" @tap="showAddForm = true">
        <text class="add-plus">+</text>
        <text class="add-text">添加学员</text>
      </view>

      <!-- 添加/编辑表单弹层 -->
      <view v-if="showAddForm" class="form-overlay" @tap.self="showAddForm = false">
        <view class="form-panel">
          <view class="form-header">
            <text class="form-title">{{ editingStudent ? '编辑学员' : '添加学员' }}</text>
            <view class="form-close" @tap="showAddForm = false">✕</view>
          </view>

          <!-- 头像选择 -->
          <view class="avatar-selector">
            <view
              v-for="opt in avatarOptions"
              :key="opt.emoji"
              class="avatar-option"
              :class="{ selected: newStudent.emoji === opt.emoji }"
              :style="{ background: opt.bg }"
              @tap="selectAvatar(opt)"
            >
              <text class="avatar-opt-emoji">{{ opt.emoji }}</text>
            </view>
          </view>

          <view class="form-fields">
            <view class="field-item">
              <text class="field-label">姓名</text>
              <input
                class="field-input"
                v-model="newStudent.name"
                placeholder="请输入姓名"
                placeholder-style="color: #8A7E70"
              />
            </view>
            <view class="field-divider"></view>

            <view class="field-item">
              <text class="field-label">年龄</text>
              <input
                class="field-input"
                v-model="newStudent.age"
                type="number"
                placeholder="年龄"
                placeholder-style="color: #8A7E70"
              />
            </view>
            <view class="field-divider"></view>

            <view class="field-item">
              <text class="field-label">学校</text>
              <input
                class="field-input"
                v-model="newStudent.school"
                placeholder="学校名称(选填)"
                placeholder-style="color: #8A7E70"
              />
            </view>
          </view>

          <view class="form-actions">
            <view class="save-btn" @tap="saveStudent">保存</view>
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
import { getStudents, createStudent, updateStudent, deleteStudent } from '@/api/student.js'
import { useUserStore } from '@/stores/user.js'
import SvgIcon from '@/components/SvgIcon.vue'

const statusBarHeight = ref(44)
const scrollHeight = ref(600)
const showAddForm = ref(false)
const editingStudent = ref(null)

onMounted(() => {
  const info = uni.getSystemInfoSync()
  statusBarHeight.value = info.statusBarHeight || 44
  scrollHeight.value = info.windowHeight - statusBarHeight.value - 44
})

onShow(async () => {
  const userStore = useUserStore()
  if (!userStore.isLoggedIn) {
    try { await userStore.login() } catch(e) { return }
  }
  loadStudents()
})

const students = ref([])

async function loadStudents() {
  try {
    const res = await getStudents()
    // 映射后端字段，补充前端展示字段
    students.value = (res || []).map(s => ({
      id: s.id,
      name: s.name,
      age: s.age,
      school: s.notes || '',
      emoji: '🎨',
      avatarBg: 'linear-gradient(135deg, #F9D9C4, #E8A87C)',
      isPrimary: false,
      interests: [],
      phone: s.phone || '',
    }))
  } catch(e) {
    console.error('students error:', e)
  }
}

const avatarOptions = ref([
  { emoji: '🎨', bg: 'linear-gradient(135deg, #F9D9C4, #E8A87C)' },
  { emoji: '🖌️', bg: 'linear-gradient(135deg, #C7D1B6, #7A9F70)' },
  { emoji: '🎭', bg: 'linear-gradient(135deg, #F2C9B5, #D99070)' },
  { emoji: '✏️', bg: 'linear-gradient(135deg, #E8DFC8, #C8B888)' },
  { emoji: '🌟', bg: 'linear-gradient(135deg, #E5BEB9, #C48A88)' },
  { emoji: '🦋', bg: 'linear-gradient(135deg, #C5D5DD, #7A9CB0)' },
])

const newStudent = ref({
  name: '',
  age: '',
  school: '',
  phone: '',
  emoji: '🎨',
  avatarBg: 'linear-gradient(135deg, #F9D9C4, #E8A87C)',
})

function selectAvatar(opt) {
  newStudent.value.emoji = opt.emoji
  newStudent.value.avatarBg = opt.bg
}

function editStudent(student) {
  editingStudent.value = student
  newStudent.value = { ...student }
  showAddForm.value = true
}

async function saveStudent() {
  if (!newStudent.value.name.trim()) {
    uni.showToast({ title: '请输入学员姓名', icon: 'none' })
    return
  }
  try {
    if (editingStudent.value) {
      await updateStudent(editingStudent.value.id, {
        name: newStudent.value.name,
        age: Number(newStudent.value.age),
        phone: newStudent.value.phone || '',
        notes: newStudent.value.school || '',
      })
      uni.showToast({ title: '已更新', icon: 'success' })
    } else {
      await createStudent({
        name: newStudent.value.name,
        age: Number(newStudent.value.age),
        phone: newStudent.value.phone || '',
        notes: newStudent.value.school || '',
      })
      uni.showToast({ title: '添加成功', icon: 'success' })
    }
    await loadStudents()
  } catch(e) {
    console.error('save student error:', e)
  }
  showAddForm.value = false
  editingStudent.value = null
  newStudent.value = { name: '', age: '', school: '', phone: '', emoji: '🎨', avatarBg: 'linear-gradient(135deg, #F9D9C4, #E8A87C)' }
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

.scroll-content {
  width: 100%;
  overflow-y: scroll;
  overflow-x: hidden;
  padding: 24rpx 32rpx;
}

/* 学员卡片列表 */
.students-list {
  display: flex;
  flex-direction: column;
  gap: 16rpx;
  margin-bottom: 24rpx;
}

.student-card {
  display: flex;
  align-items: center;
  gap: 20rpx;
  background: var(--card);
  border-radius: 24rpx;
  padding: 24rpx;
  box-shadow: 0 2rpx 16rpx rgba(42, 37, 32, 0.06);
  transition: transform 0.15s;

  &:active {
    transform: scale(0.99);
  }
}

.stu-avatar {
  width: 100rpx;
  height: 100rpx;
  border-radius: 50%;
  display: flex;
  align-items: center;
  justify-content: center;
  flex-shrink: 0;
}

.stu-emoji {
  font-size: 52rpx;
}

.stu-info {
  flex: 1;
  min-width: 0;
}

.stu-name-row {
  display: flex;
  align-items: center;
  gap: 12rpx;
  margin-bottom: 6rpx;
}

.stu-name {
  font-size: 32rpx;
  font-weight: 700;
  color: var(--ink);
}

.primary-tag {
  background: var(--primary-soft);
  color: var(--primary-deep);
  font-size: 20rpx;
  font-weight: 600;
  padding: 4rpx 14rpx;
  border-radius: 20rpx;
}

.stu-age {
  display: block;
  font-size: 24rpx;
  color: var(--ink-3);
  margin-bottom: 10rpx;
}

.stu-tags {
  display: flex;
  flex-wrap: wrap;
  gap: 8rpx;
}

.interest-tag {
  background: var(--moss-soft);
  color: var(--moss);
  font-size: 20rpx;
  font-weight: 500;
  padding: 4rpx 14rpx;
  border-radius: 16rpx;
}

.stu-arrow {
  font-size: 40rpx;
  color: var(--ink-3);
}

/* 添加按钮 */
.add-btn {
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 12rpx;
  background: var(--card);
  border-radius: 24rpx;
  padding: 32rpx;
  border: 2rpx dashed var(--primary-soft);
  transition: all 0.15s;

  &:active {
    background: var(--primary-soft);
  }
}

.add-plus {
  font-size: 36rpx;
  color: var(--primary);
  font-weight: 300;
}

.add-text {
  font-size: 28rpx;
  color: var(--primary);
  font-weight: 600;
}

/* 弹层 */
.form-overlay {
  position: fixed;
  inset: 0;
  background: rgba(42, 37, 32, 0.5);
  z-index: 100;
  display: flex;
  align-items: flex-end;
}

.form-panel {
  width: 100%;
  background: var(--paper);
  border-radius: 36rpx 36rpx 0 0;
  padding: 32rpx 32rpx;
  padding-bottom: calc(32rpx + constant(safe-area-inset-bottom));
  padding-bottom: calc(32rpx + env(safe-area-inset-bottom));
}

.form-header {
  display: flex;
  align-items: center;
  justify-content: space-between;
  margin-bottom: 28rpx;
}

.form-title {
  font-size: 34rpx;
  font-weight: 700;
  color: var(--ink);
}

.form-close {
  font-size: 32rpx;
  color: var(--ink-3);
  padding: 8rpx;
}

/* 头像选择 */
.avatar-selector {
  display: flex;
  flex-wrap: wrap;
  gap: 16rpx;
  margin-bottom: 28rpx;
  justify-content: center;
}

.avatar-option {
  width: 80rpx;
  height: 80rpx;
  border-radius: 50%;
  display: flex;
  align-items: center;
  justify-content: center;
  border: 4rpx solid transparent;
  transition: all 0.2s;

  &.selected {
    border-color: var(--primary);
    transform: scale(1.15);
    box-shadow: 0 4rpx 16rpx rgba(217, 119, 87, 0.3);
  }
}

.avatar-opt-emoji {
  font-size: 40rpx;
}

/* 表单字段 */
.form-fields {
  background: var(--card);
  border-radius: 20rpx;
  padding: 8rpx 24rpx;
  margin-bottom: 24rpx;
}

.field-item {
  display: flex;
  align-items: center;
  padding: 20rpx 0;
}

.field-label {
  width: 120rpx;
  font-size: 28rpx;
  color: var(--ink);
  font-weight: 500;
  flex-shrink: 0;
}

.field-input {
  flex: 1;
  font-size: 28rpx;
  color: var(--ink);
  text-align: right;
}

.field-divider {
  height: 1rpx;
  background: var(--line);
}

.form-actions {
  display: flex;
}

.save-btn {
  flex: 1;
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

  &:active {
    transform: scale(0.97);
  }
}

.bottom-space {
  height: 40rpx;
}
</style>
