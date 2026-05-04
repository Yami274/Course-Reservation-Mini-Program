<template>
  <view class="page">
    <view class="status-bar" :style="{ height: statusBarHeight + 'px' }"></view>

    <view class="nav-bar">
      <text class="nav-title">管理后台</text>
      <view class="refresh-btn" @tap="loadStats">
        <text class="refresh-icon">↻</text>
      </view>
    </view>

    <scroll-view scroll-y class="scroll-content" :style="{ height: scrollHeight + 'px' }">

      <!-- Today's date header -->
      <view class="date-banner">
        <text class="date-label">今日概览</text>
        <text class="date-text">{{ todayStr }}</text>
      </view>

      <!-- Stats grid -->
      <view class="stats-grid">
        <view
          v-for="stat in stats"
          :key="stat.key"
          class="stat-card"
          :style="{ '--accent': stat.color }"
          @tap="stat.action && stat.action()"
        >
          <text class="stat-icon">{{ stat.icon }}</text>
          <text class="stat-num">{{ stat.value }}</text>
          <text class="stat-label">{{ stat.label }}</text>
          <view v-if="stat.badge" class="stat-badge">{{ stat.badge }}</view>
        </view>
      </view>

      <!-- Pending orders section -->
      <view class="section-header">
        <text class="section-title">待审核预约</text>
        <view class="view-all-btn" @tap="toOrders">
          <text class="view-all-text">全部</text>
          <text class="view-all-arrow">›</text>
        </view>
      </view>

      <view v-if="loadingOrders" class="mini-loading">
        <text>加载中…</text>
      </view>

      <view v-else-if="pendingOrders.length === 0" class="mini-empty">
        <text class="mini-empty-icon">✓</text>
        <text class="mini-empty-text">暂无待审核预约</text>
      </view>

      <view v-else class="order-preview-list">
        <view
          v-for="order in pendingOrders.slice(0, 5)"
          :key="order.id"
          class="order-preview-card"
          @tap="toOrders"
        >
          <view class="op-left">
            <text class="op-name">{{ order.student_name || order.userName || '学员' }}</text>
            <text class="op-course">{{ order.course_name || order.courseName }}</text>
          </view>
          <view class="op-right">
            <text class="op-time">{{ formatTime(order.created_at || order.createdAt) }}</text>
            <view class="op-status pending">待审核</view>
          </view>
        </view>

        <view v-if="pendingOrders.length > 5" class="more-hint" @tap="toOrders">
          还有 {{ pendingOrders.length - 5 }} 条待审核 →
        </view>
      </view>

      <!-- Quick actions -->
      <view class="section-header">
        <text class="section-title">快捷操作</text>
      </view>

      <view class="quick-actions">
        <view
          v-for="action in quickActions"
          :key="action.key"
          class="qa-item"
          @tap="action.action"
        >
          <view class="qa-icon-wrap" :style="{ background: action.bg }">
            <text class="qa-icon">{{ action.icon }}</text>
          </view>
          <text class="qa-label">{{ action.label }}</text>
        </view>
      </view>

      <view class="bottom-space"></view>
    </scroll-view>
  </view>
</template>

<script setup>
import { ref, onMounted } from 'vue'
import { onShow } from '@dcloudio/uni-app'
import http from '@/utils/request.js'

const statusBarHeight = ref(44)
const scrollHeight = ref(600)
const loadingOrders = ref(false)
const pendingOrders = ref([])

const todayStr = new Date().toLocaleDateString('zh-CN', {
  year: 'numeric', month: 'long', day: 'numeric', weekday: 'long',
})

const stats = ref([
  { key: 'pending', icon: '⏳', label: '待审核', value: 0, color: '#E8B860', badge: 0, action: () => toOrders() },
  { key: 'today', icon: '📅', label: '今日预约', value: 0, color: '#D97757', action: null },
  { key: 'students', icon: '👥', label: '学员总数', value: 0, color: '#7A9CB0', action: null },
  { key: 'courses', icon: '📚', label: '课程总数', value: 0, color: '#6B7F5A', action: null },
])

const quickActions = ref([
  {
    key: 'orders',
    icon: '📋',
    label: '预约审核',
    bg: 'rgba(217, 119, 87, 0.12)',
    action: () => toOrders(),
  },
  {
    key: 'courses',
    icon: '🎨',
    label: '课程管理',
    bg: 'rgba(107, 127, 90, 0.12)',
    action: () => uni.showToast({ title: '请前往web管理后台', icon: 'none' }),
  },
  {
    key: 'students',
    icon: '👤',
    label: '学员管理',
    bg: 'rgba(122, 156, 176, 0.15)',
    action: () => uni.showToast({ title: '请前往web管理后台', icon: 'none' }),
  },
  {
    key: 'notify',
    icon: '📢',
    label: '消息推送',
    bg: 'rgba(232, 184, 96, 0.15)',
    action: () => uni.showToast({ title: '请前往web管理后台', icon: 'none' }),
  },
])

onMounted(() => {
  const info = uni.getSystemInfoSync()
  statusBarHeight.value = info.statusBarHeight || 44
  scrollHeight.value = info.windowHeight - statusBarHeight.value - 44
})

onShow(() => {
  loadStats()
})

async function loadStats() {
  loadingOrders.value = true
  try {
    const [dashRes, ordersRes] = await Promise.allSettled([
      http.get('/admin/dashboard', null, { showLoad: false }),
      http.get('/admin/orders', { status: 'pending', pageSize: 20 }, { showLoad: false }),
    ])

    if (dashRes.status === 'fulfilled' && dashRes.value) {
      const d = dashRes.value
      stats.value[0].value = d.pendingCount ?? 0
      stats.value[0].badge = d.pendingCount > 0 ? d.pendingCount : 0
      stats.value[1].value = d.todayOrders ?? 0
      stats.value[2].value = d.totalStudents ?? 0
      stats.value[3].value = d.totalCourses ?? 0
    }

    if (ordersRes.status === 'fulfilled' && ordersRes.value) {
      const list = ordersRes.value?.list || ordersRes.value || []
      pendingOrders.value = Array.isArray(list) ? list : []
      stats.value[0].value = pendingOrders.value.length
    }
  } catch(e) {
    console.error('admin dashboard error:', e)
  } finally {
    loadingOrders.value = false
  }
}

function formatTime(ts) {
  if (!ts) return ''
  const d = new Date(ts)
  const mm = String(d.getMonth() + 1).padStart(2, '0')
  const dd = String(d.getDate()).padStart(2, '0')
  const hh = String(d.getHours()).padStart(2, '0')
  const min = String(d.getMinutes()).padStart(2, '0')
  return `${mm}-${dd} ${hh}:${min}`
}

function toOrders() {
  uni.navigateTo({ url: '/pages/admin/orders' })
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

.nav-bar {
  display: flex;
  align-items: center;
  justify-content: space-between;
  padding: 12rpx 32rpx 16rpx;
  background: var(--paper-2);
}

.nav-title {
  font-size: 38rpx;
  font-weight: 800;
  color: var(--ink);
}

.refresh-btn {
  width: 64rpx;
  height: 64rpx;
  display: flex;
  align-items: center;
  justify-content: center;
}

.refresh-icon {
  font-size: 40rpx;
  color: var(--ink-2);
}

.scroll-content {
  width: 100%;
  overflow-y: scroll;
  overflow-x: hidden;
}

/* Date banner */
.date-banner {
  display: flex;
  align-items: center;
  justify-content: space-between;
  padding: 20rpx 32rpx 16rpx;
  background: var(--paper-2);
  border-radius: 0 0 32rpx 32rpx;
  margin-bottom: 24rpx;
}

.date-label {
  font-size: 28rpx;
  font-weight: 700;
  color: var(--ink);
}

.date-text {
  font-size: 22rpx;
  color: var(--ink-3);
}

/* Stats grid */
.stats-grid {
  display: grid;
  grid-template-columns: 1fr 1fr;
  gap: 16rpx;
  padding: 0 32rpx 24rpx;
}

.stat-card {
  background: var(--card);
  border-radius: 24rpx;
  padding: 28rpx 24rpx 24rpx;
  box-shadow: 0 2rpx 16rpx rgba(42, 37, 32, 0.06);
  position: relative;
  overflow: hidden;
  transition: transform 0.15s;

  &:active {
    transform: scale(0.97);
  }

  &::before {
    content: '';
    position: absolute;
    top: 0;
    left: 0;
    right: 0;
    height: 4rpx;
    background: var(--accent);
    border-radius: 24rpx 24rpx 0 0;
  }
}

.stat-icon {
  display: block;
  font-size: 44rpx;
  margin-bottom: 12rpx;
}

.stat-num {
  display: block;
  font-size: 56rpx;
  font-weight: 900;
  color: var(--accent);
  line-height: 1;
  margin-bottom: 8rpx;
}

.stat-label {
  display: block;
  font-size: 24rpx;
  color: var(--ink-3);
}

.stat-badge {
  position: absolute;
  top: 16rpx;
  right: 16rpx;
  background: var(--accent);
  color: #fff;
  font-size: 18rpx;
  font-weight: 700;
  min-width: 36rpx;
  height: 36rpx;
  border-radius: 18rpx;
  display: flex;
  align-items: center;
  justify-content: center;
  padding: 0 8rpx;
}

/* Section header */
.section-header {
  display: flex;
  align-items: center;
  justify-content: space-between;
  padding: 0 32rpx 16rpx;
}

.section-title {
  font-size: 28rpx;
  font-weight: 700;
  color: var(--ink);
}

.view-all-btn {
  display: flex;
  align-items: center;
  gap: 4rpx;
}

.view-all-text {
  font-size: 24rpx;
  color: var(--primary);
}

.view-all-arrow {
  font-size: 32rpx;
  color: var(--primary);
}

/* Mini loading/empty */
.mini-loading, .mini-empty {
  display: flex;
  flex-direction: column;
  align-items: center;
  padding: 40rpx;
  gap: 12rpx;
  font-size: 26rpx;
  color: var(--ink-3);
  margin: 0 32rpx 24rpx;
  background: var(--card);
  border-radius: 20rpx;
}

.mini-empty-icon {
  font-size: 40rpx;
  color: var(--moss);
}

.mini-empty-text {
  font-size: 26rpx;
  color: var(--ink-3);
}

/* Order preview list */
.order-preview-list {
  margin: 0 32rpx 24rpx;
  background: var(--card);
  border-radius: 24rpx;
  overflow: hidden;
  box-shadow: 0 2rpx 16rpx rgba(42, 37, 32, 0.06);
}

.order-preview-card {
  display: flex;
  align-items: center;
  justify-content: space-between;
  padding: 24rpx;
  border-bottom: 1rpx solid var(--line);
  transition: background 0.15s;

  &:last-child {
    border-bottom: none;
  }

  &:active {
    background: var(--paper);
  }
}

.op-left {
  flex: 1;
  min-width: 0;
}

.op-name {
  display: block;
  font-size: 28rpx;
  font-weight: 600;
  color: var(--ink);
  margin-bottom: 6rpx;
}

.op-course {
  display: block;
  font-size: 22rpx;
  color: var(--ink-3);
  overflow: hidden;
  text-overflow: ellipsis;
  white-space: nowrap;
}

.op-right {
  flex-shrink: 0;
  display: flex;
  flex-direction: column;
  align-items: flex-end;
  gap: 8rpx;
  margin-left: 16rpx;
}

.op-time {
  font-size: 20rpx;
  color: var(--ink-3);
}

.op-status {
  font-size: 20rpx;
  font-weight: 600;
  padding: 4rpx 14rpx;
  border-radius: 12rpx;

  &.pending {
    background: rgba(232, 184, 96, 0.18);
    color: #9A6820;
  }
}

.more-hint {
  text-align: center;
  padding: 20rpx;
  font-size: 24rpx;
  color: var(--primary);
  font-weight: 500;
}

/* Quick actions */
.quick-actions {
  display: grid;
  grid-template-columns: repeat(4, 1fr);
  gap: 0;
  margin: 0 32rpx 24rpx;
  background: var(--card);
  border-radius: 24rpx;
  overflow: hidden;
  box-shadow: 0 2rpx 16rpx rgba(42, 37, 32, 0.06);
}

.qa-item {
  display: flex;
  flex-direction: column;
  align-items: center;
  padding: 28rpx 16rpx;
  transition: background 0.15s;

  &:active {
    background: var(--paper);
  }
}

.qa-icon-wrap {
  width: 80rpx;
  height: 80rpx;
  border-radius: 22rpx;
  display: flex;
  align-items: center;
  justify-content: center;
  margin-bottom: 12rpx;
}

.qa-icon {
  font-size: 38rpx;
}

.qa-label {
  font-size: 22rpx;
  color: var(--ink-2);
  font-weight: 500;
  white-space: nowrap;
}

.bottom-space {
  height: 40rpx;
}
</style>
