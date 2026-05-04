<template>
  <view class="page">
    <!-- 头部 -->
    <view class="header" :style="{ paddingTop: statusBarHeight + 'px' }">
      <view class="nav-bar">
        <view class="back-btn" @tap="goBack">
          <SvgIcon name="chevron-left" :color="'var(--ink)'" :size="28" />
        </view>
        <text class="nav-title">消息通知</text>
        <text class="mark-all" @tap="markAllRead" v-if="unreadCount > 0">全部已读</text>
        <view v-else style="width: 80rpx;"></view>
      </view>
    </view>

    <scroll-view scroll-y class="scroll-content" :style="{ height: scrollHeight + 'px' }">

      <!-- 未读提示 -->
      <view class="unread-tip" v-if="unreadCount > 0">
        <text class="unread-text">有 {{ unreadCount }} 条未读消息</text>
      </view>

      <!-- 消息列表 -->
      <view v-if="loading" class="loading-state">
        <text style="font-size:28rpx;color:var(--ink-3);">加载中...</text>
      </view>
      <view class="notice-list" v-else-if="notices.length > 0">
        <view
          v-for="notice in notices"
          :key="notice.id"
          class="notice-item"
          :class="{ unread: !notice.isRead }"
          @tap="readNotice(notice)"
        >
          <!-- 图标背景 + 未读点 -->
          <view class="notice-icon-wrap">
            <view class="notice-icon-bg" :style="{ background: notice.iconBg }">
              <text class="notice-icon-text">{{ notice.icon }}</text>
            </view>
            <view v-if="!notice.isRead" class="unread-dot" :style="{ background: notice.dotColor }"></view>
          </view>

          <!-- 消息内容 -->
          <view class="notice-content">
            <view class="notice-header">
              <text class="notice-type">{{ notice.type }}</text>
              <text class="notice-time">{{ notice.time }}</text>
            </view>
            <text class="notice-title">{{ notice.title }}</text>
            <text class="notice-body" v-if="notice.body">{{ notice.body }}</text>

            <!-- 课程标签 -->
            <view v-if="notice.courseName" class="course-chip">
              <text class="course-chip-text">{{ notice.courseName }}</text>
            </view>
          </view>
        </view>
      </view>

      <!-- 空状态 -->
      <view v-else class="empty-state">
        <text class="empty-emoji">🔔</text>
        <text class="empty-title">暂无消息</text>
        <text class="empty-sub">预约审核结果，系统通知将在此显示</text>
      </view>

      <view class="bottom-space"></view>
    </scroll-view>
  </view>
</template>

<script setup>
import { ref, computed, onMounted } from 'vue'
import { onShow } from '@dcloudio/uni-app'
import { getOrders } from '@/api/order.js'
import { getNotices } from '@/api/home.js'
import { normalizeOrder } from '@/utils/normalize.js'
import { useUserStore } from '@/stores/user.js'
import SvgIcon from '@/components/SvgIcon.vue'

const statusBarHeight = ref(44)
const scrollHeight = ref(600)

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
  await loadNotifications()
})

const STATUS_META = {
  approved:  { type: '预约通知', icon: '✅', iconBg: 'rgba(107,127,90,0.15)', dotColor: '#6B7F5A', title: '您的预约已通过审核', body: '您的课程预约已审核通过，请准时参加。' },
  rejected:  { type: '预约通知', icon: '❌', iconBg: 'rgba(160,71,63,0.1)', dotColor: '#A0473F', title: '很遗憾，预约未通过审核', body: '' },
  cancelled: { type: '预约通知', icon: '🚫', iconBg: 'rgba(138,126,112,0.1)', dotColor: '#8A7E70', title: '预约已取消', body: '' },
}

const notices = ref([])
const loading = ref(true)

async function loadNotifications() {
  loading.value = true
  try {
    const [ordersRes, sysNotices] = await Promise.all([
      getOrders({ pageSize: 50 }).catch(() => ({ list: [] })),
      getNotices().catch(() => []),
    ])

    const orders = (ordersRes?.list || ordersRes || []).map(normalizeOrder)
    const readIds = JSON.parse(uni.getStorageSync('readNotices') || '[]')

    // Derive notifications from orders with status changes
    const orderNotices = orders
      .filter(o => ['approved', 'rejected', 'cancelled'].includes(o.status))
      .map(o => {
        const meta = STATUS_META[o.status] || STATUS_META.cancelled
        return {
          id: `order-${o.id}`,
          type: meta.type,
          icon: meta.icon,
          iconBg: meta.iconBg,
          dotColor: meta.dotColor,
          isRead: readIds.includes(`order-${o.id}`),
          title: meta.title,
          body: meta.body || (o.rejectReason ? `原因：${o.rejectReason}` : ''),
          courseName: o.courseName ? `${o.courseName} · ${o.timeSlot}` : '',
          time: formatTimeAgo(o.createdAt || o.createTime),
          orderId: o.id,
        }
      })

    // System notices from API
    const sysNotificationItems = (sysNotices || []).map(n => ({
      id: `sys-${n.id}`,
      type: '系统公告',
      icon: '📢',
      iconBg: 'rgba(232,184,96,0.18)',
      dotColor: '#E8B860',
      isRead: readIds.includes(`sys-${n.id}`),
      title: n.content || '系统公告',
      body: '',
      courseName: null,
      time: n.created_at ? formatTimeAgo(n.created_at) : '',
    }))

    // Merge and sort by time (newest first)
    notices.value = [...orderNotices, ...sysNotificationItems]
      .sort((a, b) => (b.id || '').localeCompare(a.id || ''))
  } catch(e) {
    console.error('notifications error:', e)
  } finally {
    loading.value = false
  }
}

function formatTimeAgo(dateStr) {
  if (!dateStr) return ''
  try {
    const d = new Date(dateStr)
    const now = new Date()
    const diff = now - d
    const mins = Math.floor(diff / 60000)
    if (mins < 60) return mins <= 0 ? '刚刚' : `${mins}分钟前`
    const hours = Math.floor(mins / 60)
    if (hours < 24) return `${hours}小时前`
    const days = Math.floor(hours / 24)
    if (days < 7) return `${days}天前`
    return d.toLocaleDateString('zh', { month: '2-digit', day: '2-digit' })
  } catch(e) { return dateStr }
}

const unreadCount = computed(() => notices.value.filter(n => !n.isRead).length)

function readNotice(notice) {
  notice.isRead = true
  const readIds = JSON.parse(uni.getStorageSync('readNotices') || '[]')
  if (!readIds.includes(notice.id)) {
    readIds.push(notice.id)
    uni.setStorageSync('readNotices', readIds)
  }
  // Navigate to order detail for order notifications
  if (notice.orderId) {
    uni.navigateTo({ url: `/pages/order/detail?id=${notice.orderId}` })
  }
}

function markAllRead() {
  const readIds = notices.value.map(n => n.id)
  uni.setStorageSync('readNotices', readIds)
  notices.value.forEach(n => n.isRead = true)
  uni.showToast({ title: '已全部标记为已读', icon: 'success' })
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

.mark-all {
  font-size: 26rpx;
  color: var(--primary);
  font-weight: 500;
  width: 80rpx;
  text-align: right;
}

/* 未读提示 */
.unread-tip {
  margin: 20rpx 32rpx 8rpx;
  padding: 12rpx 20rpx;
  background: rgba(217, 119, 87, 0.08);
  border-radius: 12rpx;
}

.unread-text {
  font-size: 24rpx;
  color: var(--primary-deep);
}

/* 滚动 */
.scroll-content {
  width: 100%;
  overflow-y: scroll;
  overflow-x: hidden;
}

.notice-list {
  padding: 16rpx 32rpx;
  display: flex;
  flex-direction: column;
  gap: 12rpx;
}

/* 消息项 */
.notice-item {
  display: flex;
  gap: 20rpx;
  background: var(--card);
  border-radius: 20rpx;
  padding: 24rpx;
  box-shadow: 0 2rpx 12rpx rgba(42, 37, 32, 0.05);
  transition: all 0.15s;
  position: relative;

  &.unread {
    background: var(--card);
    box-shadow: 0 4rpx 20rpx rgba(42, 37, 32, 0.08);
  }

  &:not(.unread) {
    opacity: 0.7;
  }

  &:active {
    transform: scale(0.99);
  }
}

.notice-icon-wrap {
  position: relative;
  flex-shrink: 0;
}

.notice-icon-bg {
  width: 72rpx;
  height: 72rpx;
  border-radius: 20rpx;
  display: flex;
  align-items: center;
  justify-content: center;
}

.notice-icon-text {
  font-size: 36rpx;
}

.unread-dot {
  position: absolute;
  top: -6rpx;
  right: -6rpx;
  width: 18rpx;
  height: 18rpx;
  border-radius: 50%;
  border: 3rpx solid var(--card);
}

.notice-content {
  flex: 1;
  min-width: 0;
}

.notice-header {
  display: flex;
  align-items: center;
  justify-content: space-between;
  margin-bottom: 8rpx;
}

.notice-type {
  font-size: 22rpx;
  color: var(--ink-3);
  font-weight: 500;
}

.notice-time {
  font-size: 22rpx;
  color: var(--ink-3);
}

.notice-title {
  display: block;
  font-size: 28rpx;
  font-weight: 600;
  color: var(--ink);
  margin-bottom: 8rpx;
}

.notice-body {
  display: block;
  font-size: 24rpx;
  color: var(--ink-3);
  line-height: 1.6;
  margin-bottom: 10rpx;
}

.course-chip {
  display: inline-flex;
  background: var(--primary-soft);
  border-radius: 12rpx;
  padding: 6rpx 14rpx;
}

.course-chip-text {
  font-size: 22rpx;
  color: var(--primary-deep);
  font-weight: 500;
}

/* 加载 */
.loading-state {
  display: flex;
  align-items: center;
  justify-content: center;
  padding: 120rpx 0;
}

/* 空状态 */
.empty-state {
  display: flex;
  flex-direction: column;
  align-items: center;
  padding: 160rpx 0;
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

.bottom-space {
  height: 40rpx;
}
</style>
