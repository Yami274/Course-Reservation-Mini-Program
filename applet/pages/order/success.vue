<template>
  <view class="page">
    <!-- 状态栏高度 -->
    <view class="status-bar" :style="{ height: statusBarHeight + 'px' }"></view>

    <!-- 主内容区域 -->
    <view class="content-area">
      <!-- 成功插图 -->
      <view class="success-illustration">
        <!-- 外圆圈 -->
        <view class="success-bg-circle">
          <!-- 中圆圈 -->
          <view class="success-mid-circle">
            <!-- 勾选图标 -->
            <view class="check-icon">
              <SvgIcon name="check" color="#FFFCF5" :size="60" />
            </view>
          </view>
        </view>

        <!-- 装饰星星 -->
        <view class="deco-star s1">✨</view>
        <view class="deco-star s2">✨</view>
        <view class="deco-star s3">✨</view>
      </view>

      <!-- 标题文字 -->
      <text class="success-title">预约申请已提交！</text>
      <text class="success-subtitle">我们将在1-2个工作日内完成审核，审核结果将通过消息通知您</text>

      <!-- 预约信息卡片 -->
      <view class="order-info-card">
        <view class="info-row">
          <text class="info-label">课程名称</text>
          <text class="info-val">{{ info.courseName }}</text>
        </view>
        <template v-if="info.timeSlot">
          <view class="info-divider"></view>
          <view class="info-row">
            <text class="info-label">上课时间</text>
            <text class="info-val">{{ info.timeSlot }}</text>
          </view>
        </template>
        <template v-if="info.studentName">
          <view class="info-divider"></view>
          <view class="info-row">
            <text class="info-label">参与学员</text>
            <text class="info-val">{{ info.studentName }}</text>
          </view>
        </template>
        <template v-if="info.location">
          <view class="info-divider"></view>
          <view class="info-row">
            <text class="info-label">上课地点</text>
            <text class="info-val">{{ info.location }}</text>
          </view>
        </template>
        <template v-if="info.orderNo">
          <view class="info-divider"></view>
          <view class="info-row">
            <text class="info-label">预约单号</text>
            <text class="info-val order-no">{{ info.orderNo }}</text>
          </view>
        </template>
      </view>

      <!-- 温馨提示卡 -->
      <view class="tips-card">
        <text class="tips-title">💡 温馨提示</text>
        <view class="tip-item">
          <text class="tip-dot">·</text>
          <text class="tip-text">审核结果将在1-2个工作日内通过消息通知您</text>
        </view>
        <view class="tip-item">
          <text class="tip-dot">·</text>
          <text class="tip-text">审核通过后如需取消，请提前8小时操作，以免影响您的信誉</text>
        </view>
        <view class="tip-item">
          <text class="tip-dot">·</text>
          <text class="tip-text">如有疑问请联系工作人员，我们将竭诚为您服务</text>
        </view>
      </view>
    </view>

    <!-- 底部按钮 -->
    <view class="actions">
      <view class="primary-btn" @tap="toOrderList">查看我的预约</view>
      <view class="ghost-btn" @tap="toHome">返回首页</view>
    </view>
  </view>
</template>

<script setup>
import { ref, onMounted } from 'vue'
import { onLoad } from '@dcloudio/uni-app'
import SvgIcon from '@/components/SvgIcon.vue'

const statusBarHeight = ref(44)

const info = ref({
  courseName: '课程预约',
  timeSlot: '',
  studentName: '',
  location: '',
  orderNo: '',
})

onMounted(() => {
  const sys = uni.getSystemInfoSync()
  statusBarHeight.value = sys.statusBarHeight || 44
})

onLoad((options) => {
  if (options?.courseName)   info.value.courseName  = decodeURIComponent(options.courseName)
  if (options?.timeSlot)     info.value.timeSlot    = decodeURIComponent(options.timeSlot)
  if (options?.studentName)  info.value.studentName = decodeURIComponent(options.studentName)
  if (options?.location)     info.value.location    = decodeURIComponent(options.location)
  if (options?.orderNo)      info.value.orderNo     = decodeURIComponent(options.orderNo)
})

function toOrderList() {
  uni.switchTab({ url: '/pages/order/list' })
}

function toHome() {
  uni.switchTab({ url: '/pages/index/index' })
}
</script>

<style lang="scss" scoped>
.page {
  min-height: 100vh;
  background: var(--paper);
  display: flex;
  flex-direction: column;
  overflow-x: hidden;
}

.status-bar {
  background: var(--paper);
}

.content-area {
  flex: 1;
  padding: 40rpx 32rpx 0;
  display: flex;
  flex-direction: column;
  align-items: center;
}

/* 成功插图 */
.success-illustration {
  position: relative;
  width: 280rpx;
  height: 280rpx;
  margin-bottom: 40rpx;
  display: flex;
  align-items: center;
  justify-content: center;
}

.success-bg-circle {
  width: 240rpx;
  height: 240rpx;
  border-radius: 50%;
  background: var(--primary-soft);
  display: flex;
  align-items: center;
  justify-content: center;
}

.success-mid-circle {
  width: 180rpx;
  height: 180rpx;
  border-radius: 50%;
  background: var(--primary);
  display: flex;
  align-items: center;
  justify-content: center;
  box-shadow: 0 8rpx 32rpx rgba(217, 119, 87, 0.36);
}

.check-icon {
  width: 100rpx;
  height: 100rpx;
  display: flex;
  align-items: center;
  justify-content: center;
}

.check-symbol {
  font-size: 72rpx;
  color: #fff;
  font-weight: 700;
}

/* 装饰星星 */
.deco-star {
  position: absolute;
  font-size: 36rpx;
}

.s1 {
  top: 20rpx;
  right: 20rpx;
}

.s2 {
  bottom: 40rpx;
  left: 10rpx;
}

.s3 {
  top: 60rpx;
  left: 20rpx;
}

/* 标题 */
.success-title {
  font-size: 44rpx;
  font-weight: 800;
  color: var(--ink);
  margin-bottom: 16rpx;
  text-align: center;
}

.success-subtitle {
  font-size: 26rpx;
  color: var(--ink-3);
  text-align: center;
  line-height: 1.6;
  margin-bottom: 40rpx;
  padding: 0 24rpx;
}

/* 预约信息卡片 */
.order-info-card {
  width: 100%;
  background: var(--card);
  border-radius: 24rpx;
  padding: 24rpx;
  box-shadow: 0 4rpx 20rpx rgba(42, 37, 32, 0.06);
  margin-bottom: 20rpx;
}

.info-row {
  display: flex;
  justify-content: space-between;
  align-items: flex-start;
  padding: 14rpx 0;
  gap: 20rpx;
}

.info-label {
  font-size: 26rpx;
  color: var(--ink-3);
  flex-shrink: 0;
}

.info-val {
  font-size: 26rpx;
  color: var(--ink);
  font-weight: 500;
  text-align: right;
  flex: 1;
}

.order-no {
  color: var(--ink-3);
  font-size: 22rpx;
  font-weight: 400;
  font-family: monospace;
}

.info-divider {
  height: 1rpx;
  background: var(--line);
}

/* 提示卡 */
.tips-card {
  width: 100%;
  background: rgba(232, 184, 96, 0.1);
  border-radius: 20rpx;
  padding: 20rpx 24rpx;
  border: 1rpx solid rgba(232, 184, 96, 0.25);
  margin-bottom: 20rpx;
}

.tips-title {
  display: block;
  font-size: 26rpx;
  font-weight: 600;
  color: #8A6020;
  margin-bottom: 12rpx;
}

.tip-item {
  display: flex;
  gap: 8rpx;
  margin-bottom: 8rpx;
  align-items: flex-start;
}

.tip-dot {
  font-size: 28rpx;
  color: var(--butter);
  flex-shrink: 0;
  line-height: 1.5;
}

.tip-text {
  font-size: 24rpx;
  color: #7A5A20;
  line-height: 1.6;
}

/* 底部按钮 */
.actions {
  padding: 24rpx 32rpx;
  padding-bottom: calc(24rpx + constant(safe-area-inset-bottom));
  padding-bottom: calc(24rpx + env(safe-area-inset-bottom));
  display: flex;
  flex-direction: column;
  gap: 16rpx;
}

.primary-btn {
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
  letter-spacing: 2rpx;
  transition: all 0.15s;

  &:active {
    transform: scale(0.97);
  }
}

.ghost-btn {
  display: flex;
  align-items: center;
  justify-content: center;
  background: transparent;
  color: var(--ink-3);
  font-size: 28rpx;
  font-weight: 500;
  padding: 24rpx;
  border-radius: 20rpx;
  border: 1rpx solid var(--line);
  transition: all 0.15s;

  &:active {
    background: var(--paper-2);
  }
}
</style>
