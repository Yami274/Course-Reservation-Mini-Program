<template>
  <view class="page paper-bg">
    <!-- 状态栏占位 -->
    <view :style="{ height: statusBarHeight + 'px' }" />

    <!-- 顶部导航 -->
    <view class="mini-nav">
      <text class="nav-title">我的</text>
    </view>

    <scroll-view scroll-y class="scroll-content" :style="{ height: scrollHeight + 'px' }">

      <!-- 用户名片 -->
      <view style="padding: 16rpx 32rpx 0;">
        <view class="user-card card">
          <!-- 装饰 SVG 背景图案 -->
          <view class="card-deco">
            <view class="deco-ring1" />
            <view class="deco-curve" />
          </view>

          <view class="user-row">
            <!-- 头像 -->
            <view class="avatar-wrap">
              <view class="avatar-circle ph berry">
                <text style="font-size:44rpx;font-weight:700;color:#FFFCF5;">
                  {{ (userStore.userInfo?.nickname || '?')[0] }}
                </text>
              </view>
            </view>

            <view style="flex:1;min-width:0;">
              <text class="user-name serif">{{ userStore.userInfo?.nickname || '未登录' }}</text>
              <text style="display:block;font-size:22rpx;color:var(--ink-3);margin-top:4rpx;">
                注册于 {{ joinDate }} · 已上 {{ doneCount }} 节
              </text>
            </view>

            <view :style="chevronStyle" />
          </view>

          <!-- 统计数据 -->
          <view class="stats-row">
            <view
              v-for="stat in stats"
              :key="stat.label"
              class="stat-item"
              @tap="stat.action"
            >
              <text class="stat-num serif">{{ stat.value }}</text>
              <text class="stat-label">{{ stat.label }}</text>
            </view>
          </view>
        </view>
      </view>

      <!-- 下一节课提醒 -->
      <view style="padding: 24rpx 32rpx 0;" v-if="nextLesson">
        <view class="next-lesson-card card">
          <view class="next-icon">
            <SvgIcon name="calendar" color="#FFFCF5" :size="40" />
          </view>
          <view style="flex:1;min-width:0;">
            <text style="font-size:26rpx;font-weight:600;color:var(--ink);">{{ nextLesson.title }}</text>
            <text style="display:block;font-size:22rpx;color:var(--ink-3);margin-top:4rpx;">
              {{ nextLesson.time }}
            </text>
          </view>
          <view class="nav-btn" @tap="toLocation">
            <text style="font-size:24rpx;color:#FFFCF5;font-weight:600;">导航</text>
          </view>
        </view>
      </view>

      <!-- 功能菜单 -->
      <view style="padding: 24rpx 32rpx 0;">
        <view class="menu-card card">
          <view
            v-for="(item, i) in mainMenuItems"
            :key="item.key"
            class="menu-item"
            :class="{ last: i === mainMenuItems.length - 1 }"
            @tap="item.action"
          >
            <view class="menu-icon-wrap" :style="{ background: item.iconBg }">
              <SvgIcon :name="item.icon" :color="item.color" :size="34" :filled="item.filled" />
            </view>
            <text class="menu-label">{{ item.label }}</text>
            <view v-if="item.badge" class="menu-badge">{{ item.badge }}</view>
            <text v-if="item.sub" class="menu-sub">{{ item.sub }}</text>
            <SvgIcon name="chevron" color="#8A7E70" :size="28" />
          </view>
        </view>
      </view>

      <!-- 联系 / 关于 -->
      <view style="padding: 16rpx 32rpx 0;">
        <view class="menu-card card">
          <view
            v-for="(item, i) in contactMenuItems"
            :key="item.key"
            class="menu-item"
            :class="{ last: i === contactMenuItems.length - 1 }"
            @tap="item.action"
          >
            <view class="menu-icon-wrap" :style="{ background: item.iconBg }">
              <SvgIcon :name="item.icon" :color="item.color" :size="34" />
            </view>
            <text class="menu-label">{{ item.label }}</text>
            <text v-if="item.sub" class="menu-sub">{{ item.sub }}</text>
            <SvgIcon name="chevron" color="#8A7E70" :size="28" />
          </view>
        </view>
      </view>

      <!-- 退出登录 -->
      <view style="padding: 16rpx 32rpx 0;">
        <view class="logout-btn" @tap="handleLogout">退出登录</view>
      </view>

      <view class="footer-text hand">安然画室 · 用心做教育 · v1.0.0</view>
      <view style="height:200rpx;" />
    </scroll-view>

  </view>
</template>

<script setup>
import { ref, computed, onMounted } from 'vue'
import { onShow } from '@dcloudio/uni-app'
import { useUserStore } from '@/stores/user.js'
import { getOrders } from '@/api/order.js'
import { getStudents } from '@/api/student.js'
import { normalizeOrder } from '@/utils/normalize.js'
import SvgIcon from '@/components/SvgIcon.vue'

const statusBarHeight = ref(44)
const scrollHeight = ref(600)
const userStore = useUserStore()

onMounted(() => {
  const info = uni.getSystemInfoSync()
  statusBarHeight.value = info.statusBarHeight || 44
  const navH = 88 * (info.screenWidth || 375) / 750
  scrollHeight.value = info.windowHeight - statusBarHeight.value - navH
})

onShow(async () => {
  if (!userStore.isLoggedIn) {
    try { await userStore.login() } catch(e) { console.error('auto login failed:', e) }
  }
  await loadStats()
})

// Derived display values
const joinDate = computed(() => {
  const u = userStore.userInfo
  if (!u?.created_at) return '2024.09'
  return new Date(u.created_at).toLocaleDateString('zh', { year: 'numeric', month: '2-digit' }).replace('/', '.')
})

const studentCount = ref(0)
const favoriteCount = ref(0)
const approvedCount = ref(0)
const doneCount = ref(0)
const notificationBadge = ref(0)

const stats = computed(() => [
  { label: '学员档案', value: String(studentCount.value), action: () => uni.navigateTo({ url: '/pages/mine/students' }) },
  { label: '已收藏',   value: String(favoriteCount.value), action: () => uni.navigateTo({ url: '/pages/mine/favorites' }) },
  { label: '进行中',   value: String(approvedCount.value), action: () => uni.reLaunch({ url: '/pages/index/index?tab=2' }) },
  { label: '已完成',   value: String(doneCount.value), action: () => uni.reLaunch({ url: '/pages/index/index?tab=2' }) },
])

const nextLesson = ref(null)

async function loadStats() {
  try {
    const [studentsRes, ordersRes] = await Promise.all([
      getStudents().catch(() => []),
      getOrders({ pageSize: 50 }).catch(() => ({ list: [] })),
    ])
    studentCount.value = (studentsRes || []).length
    favoriteCount.value = (JSON.parse(uni.getStorageSync('favorites') || '[]')).length

    const orders = (ordersRes?.list || ordersRes || []).map(normalizeOrder)
    approvedCount.value = orders.filter(o => o.status === 'approved').length
    doneCount.value = orders.filter(o => o.status === 'cancelled').length

    // Compute unread notification count
    const readIds = new Set(JSON.parse(uni.getStorageSync('readNotices') || '[]'))
    const orderChangeIds = orders
      .filter(o => ['approved', 'rejected', 'cancelled'].includes(o.status))
      .map(o => `order-${o.id}`)
    const unread = orderChangeIds.filter(id => !readIds.has(id))
    notificationBadge.value = unread.length

    // Find nearest upcoming approved order
    const now = new Date()
    const upcoming = orders
      .filter(o => o.status === 'approved')
      .sort((a, b) => {
        const da = a.schedule?.date || ''
        const db = b.schedule?.date || ''
        return da.localeCompare(db)
      })
      .find(o => {
        if (!o.schedule?.date) return false
        return new Date(o.schedule.date) >= now
      })

    if (upcoming) {
      nextLesson.value = {
        title: `${upcoming.courseName} · ${upcoming.timeSlot}`,
        time: `下一节课 · ${upcoming.schedule?.date || ''}`,
      }
    }
  } catch(e) {
    console.error('stats load error:', e)
  }
}

const mainMenuItems = computed(() => [
  {
    key: 'orders',    label: '我的预约', sub: '',              icon: 'calendar', color: '#D97757', iconBg: 'rgba(217,119,87,0.12)',
    action: () => uni.reLaunch({ url: '/pages/index/index?tab=2' }),
  },
  {
    key: 'students',  label: '学员档案', sub: '2 位',          icon: 'user',     color: '#6B7F5A', iconBg: 'rgba(107,127,90,0.12)',
    action: () => uni.navigateTo({ url: '/pages/mine/students' }),
  },
  {
    key: 'favorites', label: '我的收藏', sub: '5',             icon: 'heart',    color: '#A0473F', iconBg: 'rgba(160,71,63,0.12)', filled: true,
    action: () => uni.navigateTo({ url: '/pages/mine/favorites' }),
  },
  {
    key: 'notifications', label: '系统通知', sub: '',          icon: 'bell',     color: '#E8B860', iconBg: 'rgba(232,184,96,0.18)',
    badge: notificationBadge.value > 0 ? notificationBadge.value : 0,
    action: () => uni.navigateTo({ url: '/pages/mine/notifications' }),
  },
  {
    key: 'location',   label: '上课地点', sub: '查看导航',      icon: 'pin',      color: '#6B7F5A', iconBg: 'rgba(107,127,90,0.12)',
    action: () => uni.navigateTo({ url: '/pages/mine/location' }),
  },
])

const contactMenuItems = computed(() => [
  {
    key: 'wechat', label: '联系客服', sub: '在线',              icon: 'wechat',   color: '#6B7F5A', iconBg: 'rgba(107,127,90,0.12)',
    action: () => uni.showToast({ title: '请扫码联系客服', icon: 'none' }),
  },
  {
    key: 'phone',  label: '拨打电话', sub: '400-888-6666',     icon: 'phone',    color: '#D97757', iconBg: 'rgba(217,119,87,0.12)',
    action: () => uni.makePhoneCall({ phoneNumber: '400-888-6666' }),
  },
  {
    key: 'about',  label: '关于画室', sub: '',                 icon: 'book',     color: '#5A4F44', iconBg: 'rgba(42,37,32,0.06)',
    action: () => uni.showModal({
      title: '关于安然画室',
      content: '安然画室成立于2018年，专注儿童青少年美术教育，提供专业的绘画课程与个性化教学。',
      showCancel: false,
    }),
  },
])

function toLocation() {
  uni.navigateTo({ url: '/pages/mine/location' })
}
function handleLogout() {
  uni.showModal({
    title: '退出登录',
    content: '确认要退出登录吗？',
    confirmText: '退出',
    confirmColor: '#D97757',
    success: (res) => {
      if (res.confirm) {
        userStore.logout()
        uni.showToast({ title: '已退出登录', icon: 'success' })
      }
    },
  })
}
</script>

<style lang="scss" scoped>
.page {
  min-height: 100vh;
  background: var(--paper);
  overflow-x: hidden;
}
.mini-nav {
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
.scroll-content {
  width: 100%;
  overflow-y: scroll;
  overflow-x: hidden;
}

/* 用户名片 */
.user-card {
  border-radius: 48rpx;
  padding: 40rpx 36rpx;
  background: linear-gradient(135deg, #FAF1E0 0%, #F2D9BC 100%);
  position: relative;
  overflow: hidden;
}
.card-deco {
  position: absolute;
  right: -20rpx;
  bottom: -20rpx;
  width: 240rpx;
  height: 240rpx;
  pointer-events: none;
}
.deco-ring1 {
  position: absolute;
  right: 0;
  bottom: 0;
  width: 160rpx;
  height: 160rpx;
  border-radius: 50%;
  border: 2rpx dashed rgba(217,119,87,0.3);
}
.deco-curve {
  position: absolute;
  right: 60rpx;
  bottom: 60rpx;
  width: 100rpx;
  height: 2rpx;
  background: rgba(107,127,90,0.3);
  border-radius: 2rpx;
  transform: rotate(-30deg);
}

.user-row {
  display: flex;
  align-items: center;
  gap: 28rpx;
}
.avatar-wrap {
  flex-shrink: 0;
}
.avatar-circle {
  width: 120rpx;
  height: 120rpx;
  border-radius: 50%;
  border: 5rpx solid #FFFCF5;
  display: flex;
  align-items: center;
  justify-content: center;
}
.user-name {
  font-size: 36rpx;
  font-weight: 700;
  color: var(--ink);
  display: block;
}

/* 统计 */
.stats-row {
  display: flex;
  margin-top: 32rpx;
  padding-top: 28rpx;
  border-top: 1rpx dashed rgba(42,37,32,0.16);
}
.stat-item {
  flex: 1;
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 4rpx;
}
.stat-num {
  font-size: 36rpx;
  font-weight: 700;
  color: var(--primary-deep);
}
.stat-label {
  font-size: 20rpx;
  color: var(--ink-3);
}

/* 下一节课 */
.next-lesson-card {
  border-radius: 32rpx;
  padding: 28rpx;
  display: flex;
  align-items: center;
  gap: 24rpx;
  border: 2rpx solid var(--moss-soft);
  background: rgba(199,209,182,0.18);
}
.next-icon {
  width: 88rpx;
  height: 88rpx;
  border-radius: 24rpx;
  background: var(--moss);
  display: flex;
  align-items: center;
  justify-content: center;
  flex-shrink: 0;
}
.nav-btn {
  padding: 12rpx 24rpx;
  border-radius: 999rpx;
  background: var(--moss);
  flex-shrink: 0;
}

/* 菜单 */
.menu-card {
  border-radius: 36rpx;
  overflow: hidden;
}
.menu-item {
  display: flex;
  align-items: center;
  gap: 24rpx;
  padding: 28rpx 32rpx;
  border-bottom: 1rpx solid var(--line-2);
  &.last { border-bottom: none; }
}
.menu-icon-wrap {
  width: 64rpx;
  height: 64rpx;
  border-radius: 20rpx;
  display: flex;
  align-items: center;
  justify-content: center;
  flex-shrink: 0;
}
.menu-label {
  flex: 1;
  font-size: 28rpx;
  font-weight: 500;
  color: var(--ink);
}
.menu-sub {
  font-size: 24rpx;
  color: var(--ink-3);
}
.menu-badge {
  background: var(--primary);
  color: #FFFCF5;
  font-size: 20rpx;
  min-width: 36rpx;
  height: 36rpx;
  border-radius: 18rpx;
  display: flex;
  align-items: center;
  justify-content: center;
  padding: 0 8rpx;
}

/* 退出 */
.logout-btn {
  display: flex;
  align-items: center;
  justify-content: center;
  padding: 32rpx;
  background: var(--card);
  border-radius: 32rpx;
  font-size: 28rpx;
  color: var(--ink-3);
  border: 1rpx solid var(--line);
}

.footer-text {
  text-align: center;
  color: var(--ink-3);
  font-size: 22rpx;
  padding: 40rpx 0 20rpx;
}
</style>
