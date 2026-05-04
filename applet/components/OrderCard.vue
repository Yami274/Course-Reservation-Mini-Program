<template>
  <view class="order-card" @tap="handleTap">
    <!-- ????????-->
    <view class="top-row">
      <!-- 缩略图 -->
      <view class="thumb" :style="{ background: order.thumbBg || 'linear-gradient(135deg, #F4D9B8, #D97757)' }">
        <image v-if="order.cover" class="thumb-img" :src="order.cover" mode="aspectFill" />
      </view>

      <!-- ?????? -->
      <view class="course-info">
        <text class="course-name">{{ order.courseName }}</text>
        <text class="class-type">{{ order.classType }}</text>
        <view class="time-row">
          <text class="time-icon">??</text>
          <text class="time-text">{{ order.timeSlot }}</text>
        </view>
      </view>

      <!-- ??�????-->
      <view class="status-pill" :class="statusClass">
        {{ statusText }}
      </view>
    </view>

    <!-- ?????-->
    <view class="divider"></view>

    <!-- ????????? + ?????? -->
    <view class="bottom-row">
      <text class="order-no">??? {{ order.orderNo }}</text>
      <view class="actions">
        <view
          v-if="showCancel"
          class="action-btn cancel"
          @tap.stop="handleCancel"
        >???</view>
        <view
          v-if="showRebook"
          class="action-btn rebook"
          @tap.stop="handleRebook"
        >??????</view>
      </view>
    </view>
  </view>
</template>

<script setup>
import { computed } from 'vue'

const props = defineProps({
  order: {
    type: Object,
    required: true,
  },
})

const emit = defineEmits(['tap', 'cancel', 'rebook'])

const statusMap = {
  pending: { text: '?????, cls: 'status-pending' },
  approved: { text: '??�??', cls: 'status-approved' },
  rejected: { text: '?????, cls: 'status-rejected' },
  cancelled: { text: '?????, cls: 'status-cancelled' },
}

const statusText = computed(() => statusMap[props.order.status]?.text || '???')
const statusClass = computed(() => statusMap[props.order.status]?.cls || '')

const showCancel = computed(() =>
  props.order.status === 'pending' || props.order.status === 'approved'
)
const showRebook = computed(() =>
  props.order.status === 'rejected' || props.order.status === 'cancelled'
)

function handleTap() {
  emit('tap', props.order)
  uni.navigateTo({ url: `/pages/order/detail?id=${props.order.id}` })
}

function handleCancel() {
  emit('cancel', props.order)
}

function handleRebook() {
  emit('rebook', props.order)
}
</script>

<style lang="scss" scoped>
.order-card {
  background: var(--card);
  border-radius: 24rpx;
  padding: 24rpx;
  box-shadow: 0 2rpx 16rpx rgba(42, 37, 32, 0.06);
  margin-bottom: 20rpx;
  transition: transform 0.15s;

  &:active {
    transform: scale(0.99);
  }
}

.top-row {
  display: flex;
  align-items: flex-start;
  gap: 20rpx;
}

.thumb {
  width: 100rpx;
  height: 100rpx;
  border-radius: 16rpx;
  flex-shrink: 0;
  position: relative;
  overflow: hidden;
}

.thumb-img {
  position: absolute;
  inset: 0;
  width: 100%;
  height: 100%;
}

.course-info {
  flex: 1;
  min-width: 0;
}

.course-name {
  display: block;
  font-size: 28rpx;
  font-weight: 600;
  color: var(--ink);
  overflow: hidden;
  text-overflow: ellipsis;
  white-space: nowrap;
  margin-bottom: 6rpx;
}

.class-type {
  display: block;
  font-size: 22rpx;
  color: var(--ink-3);
  margin-bottom: 8rpx;
}

.time-row {
  display: flex;
  align-items: center;
  gap: 6rpx;
}

.time-icon {
  font-size: 22rpx;
}

.time-text {
  font-size: 22rpx;
  color: var(--ink-2);
}

/* ??�????*/
.status-pill {
  flex-shrink: 0;
  font-size: 22rpx;
  font-weight: 600;
  padding: 6rpx 16rpx;
  border-radius: 20rpx;
}

.status-pending {
  background: rgba(232, 184, 96, 0.18);
  color: #9A6820;
}

.status-approved {
  background: rgba(107, 127, 90, 0.15);
  color: #4A6A40;
}

.status-rejected {
  background: rgba(160, 71, 63, 0.12);
  color: #A0473F;
}

.status-cancelled {
  background: rgba(138, 126, 112, 0.12);
  color: var(--ink-3);
}

/* ?????*/
.divider {
  width: 100%;
  height: 1rpx;
  background: var(--line);
  margin: 20rpx 0;
}

/* ??? */
.bottom-row {
  display: flex;
  align-items: center;
  justify-content: space-between;
}

.order-no {
  font-size: 22rpx;
  color: var(--ink-3);
}

.actions {
  display: flex;
  gap: 12rpx;
}

.action-btn {
  font-size: 24rpx;
  font-weight: 500;
  padding: 10rpx 24rpx;
  border-radius: 16rpx;
  transition: all 0.15s;

  &:active {
    transform: scale(0.95);
  }
}

.cancel {
  background: rgba(138, 126, 112, 0.12);
  color: var(--ink-3);
}

.rebook {
  background: var(--primary-soft);
  color: var(--primary-deep);
}
</style>

