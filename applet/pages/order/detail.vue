<template>
  <view class="page">
    <!-- 头部 -->
    <view class="header" :style="{ paddingTop: statusBarHeight + 'px' }">
      <view class="nav-bar">
        <view class="back-btn" @tap="goBack">
          <SvgIcon name="chevron-left" :color="'var(--ink)'" :size="28" />
        </view>
        <text class="nav-title">预约详情</text>
        <view style="width: 64rpx;"></view>
      </view>
    </view>

    <scroll-view scroll-y class="scroll-content" :style="{ height: scrollHeight + 'px' }">

      <!-- 状态卡片 -->
      <view class="status-card" :class="statusCardClass">
        <view class="status-icon-wrap">
          <text class="status-icon">{{ statusIcon }}</text>
        </view>
        <text class="status-main-text">{{ statusMainText }}</text>
        <text class="status-sub-text">{{ statusSubText }}</text>
      </view>

      <!-- 课程信息 -->
      <view class="info-card">
        <text class="card-label">课程信息</text>
        <view class="course-row">
          <view class="course-thumb" :style="{ background: order.thumbBg }">
              <image v-if="order.cover" class="thumb-img" :src="order.cover" mode="aspectFill" @error="order.coverError = true" />
            </view>
          <view class="course-detail">
            <text class="course-name">{{ order.courseName }}</text>
            <view class="class-type-tag">{{ order.classType }}</view>
            <text class="teacher-info">{{ order.teacherName }}</text>
          </view>
        </view>
      </view>

      <!-- 预约信息 -->
      <view class="info-card">
        <text class="card-label">预约信息</text>
        <view class="detail-row">
          <view class="detail-icon"><SvgIcon name="clock" color="var(--ink-3)" :size="32" /></view>
          <text class="detail-label">上课时间</text>
          <text class="detail-val">{{ order.timeSlot }}</text>
        </view>
        <view class="detail-divider"></view>
        <view class="detail-row">
          <view class="detail-icon"><SvgIcon name="pin" color="var(--primary)" :size="32" /></view>
          <text class="detail-label">上课地点</text>
          <text class="detail-val">{{ order.location }}</text>
        </view>
      </view>

      <!-- 学员信息 -->
      <view class="info-card">
        <text class="card-label">学员信息</text>
        <view class="detail-row">
          <view class="detail-icon"><SvgIcon name="user" color="var(--ink-3)" :size="32" /></view>
          <text class="detail-label">学员姓名</text>
          <text class="detail-val">{{ order.studentName }}</text>
        </view>
        <view class="detail-divider"></view>
        <view class="detail-row">
          <view class="detail-icon"><SvgIcon name="calendar" color="var(--ink-3)" :size="32" /></view>
          <text class="detail-label">学员年龄</text>
          <text class="detail-val">{{ order.studentAge }} 岁</text>
        </view>
        <view class="detail-divider"></view>
        <view class="detail-row">
          <view class="detail-icon"><SvgIcon name="phone" color="#A0473F" :size="32" /></view>
          <text class="detail-label">联系电话</text>
          <text class="detail-val">{{ order.phone }}</text>
        </view>
      </view>

      <!-- 预约单号 -->
      <view class="info-card">
        <text class="card-label">预约单号</text>
        <view class="detail-row">
          <view class="detail-icon"><SvgIcon name="check" color="var(--moss)" :size="32" /></view>
          <text class="detail-label">预约单号</text>
          <text class="detail-val order-no">{{ order.orderNo }}</text>
        </view>
        <view class="detail-divider"></view>
        <view class="detail-row">
          <view class="detail-icon"><SvgIcon name="calendar" color="var(--ink-3)" :size="32" /></view>
          <text class="detail-label">预约时间</text>
          <text class="detail-val">{{ order.createTime }}</text>
        </view>
      </view>

      <!-- 仅当状态为已拒绝且有拒绝原因时显示 -->
      <view class="reject-card" v-if="order.status === 'rejected' && order.rejectReason">
        <text class="reject-title">未通过原因</text>
        <text class="reject-reason">{{ order.rejectReason }}</text>
      </view>

      <view class="bottom-space"></view>
    </scroll-view>

    <!-- 底部操作按钮 -->
    <view class="action-bar" v-if="canCancel || canRebook">
      <view v-if="canRebook" class="rebook-btn" @tap="handleRebook">重新预约</view>
      <view v-if="canCancel" class="cancel-btn" @tap="handleCancel">取消预约</view>
    </view>
  </view>
</template>

<script setup>
import { ref, computed, onMounted } from 'vue'
import { onLoad } from '@dcloudio/uni-app'
import { getOrderDetail, cancelOrder } from '@/api/order.js'
import { normalizeOrder } from '@/utils/normalize.js'
import SvgIcon from '@/components/SvgIcon.vue'

const statusBarHeight = ref(44)
const scrollHeight = ref(600)
const loading = ref(true)

onMounted(() => {
  const info = uni.getSystemInfoSync()
  const sw = info.screenWidth || 375
  statusBarHeight.value = info.statusBarHeight || 44
  const headerH = 92 * sw / 750      // nav-bar height
  const actionH = Math.round(130 * sw / 750) // action bar + safe area
  scrollHeight.value = info.windowHeight - statusBarHeight.value - headerH - actionH
})

onLoad(async (options) => {
  const id = options?.id
  if (!id) return
  try {
    const res = await getOrderDetail(id)
    if (res) order.value = normalizeOrder(res)
  } catch(e) {
    console.error('order detail error:', e)
    uni.showToast({ title: '加载失败', icon: 'none' })
  } finally {
    loading.value = false
  }
})

const order = ref({
  id: 0,
  courseName: '',
  classType: '',
  teacherName: '',
  timeSlot: '',
  location: '',
  studentName: '',
  studentAge: '',
  phone: '',
  orderNo: '',
  createTime: '',
  status: 'pending',
  thumbBg: 'linear-gradient(135deg, #F9D9C4, #E8A87C)',
  rejectReason: '',
})

const statusConfig = {
  pending: {
    icon: '⏳',
    mainText: '待审核',
    subText: '工作人员将在1-2个工作日内完成审核，请耐心等待',
    cardBg: 'status-pending',
  },
  approved: {
    icon: '✅',
    mainText: '预约已通过',
    subText: '您的预约已审核通过，如需取消请提前8小时操作',
    cardBg: 'status-approved',
  },
  rejected: {
    icon: '❌',
    mainText: '预约未通过',
    subText: '很遗憾未能通过审核，您可以选择其他时段重新预约',
    cardBg: 'status-rejected',
  },
  cancelled: {
    icon: '🚫',
    mainText: '预约已取消',
    subText: '预约已取消，欢迎再次预约',
    cardBg: 'status-cancelled',
  },
}

const statusIcon = computed(() => statusConfig[order.value.status]?.icon || '⏳')
const statusMainText = computed(() => statusConfig[order.value.status]?.mainText || '')
const statusSubText = computed(() => statusConfig[order.value.status]?.subText || '')
const statusCardClass = computed(() => statusConfig[order.value.status]?.cardBg || '')

const canCancel = computed(() =>
  order.value.status === 'pending' || order.value.status === 'approved'
)
const canRebook = computed(() =>
  order.value.status === 'rejected' || order.value.status === 'cancelled'
)

function handleCancel() {
  uni.showModal({
    title: '取消预约',
    content: '确定要取消该预约吗？',
    confirmText: '确认取消',
    confirmColor: '#D97757',
    success: async (res) => {
      if (res.confirm) {
        try {
          await cancelOrder(order.value.id)
          order.value = { ...order.value, status: 'cancelled' }
          uni.showToast({ title: '已取消预约', icon: 'success' })
        } catch(e) {
          uni.showToast({ title: e?.message || '取消失败', icon: 'none' })
        }
      }
    },
  })
}

function handleRebook() {
  uni.navigateTo({ url: '/pages/course/detail?id=1' })
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
  padding: 24rpx 32rpx 0;
  box-sizing: border-box;
}

/* 状态卡片 */
.status-card {
  border-radius: 24rpx;
  padding: 40rpx;
  text-align: center;
  margin-bottom: 20rpx;
  box-shadow: 0 4rpx 20rpx rgba(42, 37, 32, 0.08);

  &.status-pending {
    background: rgba(232, 184, 96, 0.12);
    border: 1rpx solid rgba(232, 184, 96, 0.3);
  }

  &.status-approved {
    background: rgba(107, 127, 90, 0.1);
    border: 1rpx solid rgba(107, 127, 90, 0.25);
  }

  &.status-rejected {
    background: rgba(160, 71, 63, 0.08);
    border: 1rpx solid rgba(160, 71, 63, 0.2);
  }

  &.status-cancelled {
    background: rgba(138, 126, 112, 0.08);
    border: 1rpx solid rgba(138, 126, 112, 0.2);
  }
}

.status-icon-wrap {
  margin-bottom: 16rpx;
}

.status-icon {
  font-size: 72rpx;
}

.status-main-text {
  display: block;
  font-size: 36rpx;
  font-weight: 800;
  color: var(--ink);
  margin-bottom: 12rpx;
}

.status-sub-text {
  display: block;
  font-size: 24rpx;
  color: var(--ink-3);
  line-height: 1.6;
}

/* 信息卡片 */
.info-card {
  background: var(--card);
  border-radius: 24rpx;
  padding: 28rpx 32rpx;
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

/* 课程行 */
.course-row {
  display: flex;
  gap: 20rpx;
  align-items: center;
}

.thumb-img {
  position: absolute;
  inset: 0;
  width: 100%;
  height: 100%;
  border-radius: inherit;
}

.course-thumb {
  width: 100rpx;
  height: 100rpx;
  border-radius: 16rpx;
  flex-shrink: 0;
  position: relative;
  overflow: hidden;
}

.course-detail {
  flex: 1;
}

.course-name {
  display: block;
  font-size: 28rpx;
  font-weight: 600;
  color: var(--ink);
  margin-bottom: 8rpx;
}

.class-type-tag {
  display: inline-block;
  background: var(--primary-soft);
  color: var(--primary-deep);
  font-size: 20rpx;
  font-weight: 500;
  padding: 4rpx 14rpx;
  border-radius: 20rpx;
  margin-bottom: 8rpx;
}

.teacher-info {
  display: block;
  font-size: 22rpx;
  color: var(--ink-3);
}

/* 详情行 */
.detail-row {
  display: flex;
  align-items: flex-start;
  gap: 16rpx;
  padding: 14rpx 0;
}

.detail-icon {
  font-size: 30rpx;
  flex-shrink: 0;
  width: 40rpx;
}

.detail-label {
  font-size: 26rpx;
  color: var(--ink-3);
  width: 140rpx;
  flex-shrink: 0;
}

.detail-val {
  flex: 1;
  font-size: 26rpx;
  color: var(--ink);
  font-weight: 500;
  text-align: right;
  overflow: hidden;
  text-overflow: ellipsis;
  white-space: nowrap;
}

.order-no {
  font-size: 22rpx;
  color: var(--ink-3);
  font-weight: 400;
  overflow: hidden;
  text-overflow: ellipsis;
  white-space: nowrap;
}

.detail-divider {
  height: 1rpx;
  background: var(--line);
}

/* 拒绝原因 */
.reject-card {
  background: rgba(160, 71, 63, 0.06);
  border-radius: 20rpx;
  padding: 24rpx;
  margin-bottom: 20rpx;
  border: 1rpx solid rgba(160, 71, 63, 0.15);
}

.reject-title {
  display: block;
  font-size: 26rpx;
  font-weight: 600;
  color: #A0473F;
  margin-bottom: 12rpx;
}

.reject-reason {
  display: block;
  font-size: 24rpx;
  color: var(--ink-2);
  line-height: 1.6;
}

/* 底部操作栏 */
.action-bar {
  position: fixed;
  bottom: 0;
  left: 0;
  right: 0;
  padding: 20rpx 32rpx;
  padding-bottom: calc(20rpx + constant(safe-area-inset-bottom));
  padding-bottom: calc(20rpx + env(safe-area-inset-bottom));
  background: var(--card);
  box-shadow: 0 -4rpx 24rpx rgba(42, 37, 32, 0.08);
  display: flex;
  gap: 16rpx;
  box-sizing: border-box;
}

.cancel-btn {
  flex: 1;
  display: flex;
  align-items: center;
  justify-content: center;
  background: rgba(138, 126, 112, 0.12);
  color: var(--ink-3);
  font-size: 30rpx;
  font-weight: 600;
  padding: 24rpx;
  border-radius: 20rpx;
  transition: all 0.15s;

  &:active {
    transform: scale(0.97);
  }
}

.rebook-btn {
  flex: 1;
  display: flex;
  align-items: center;
  justify-content: center;
  background: var(--primary);
  color: #fff;
  font-size: 30rpx;
  font-weight: 600;
  padding: 24rpx;
  border-radius: 20rpx;
  box-shadow: 0 4rpx 16rpx rgba(217, 119, 87, 0.3);
  transition: all 0.15s;

  &:active {
    transform: scale(0.97);
  }
}

.bottom-space {
  height: 120rpx;
}
</style>
