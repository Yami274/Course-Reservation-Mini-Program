<template>
  <view class="page paper-bg">
    <!-- 状态栏占位 -->
    <view :style="{ height: statusBarHeight + 'px' }" />

    <!-- 顶部导航 -->
    <view class="mini-nav">
      <text class="nav-title">我的预约</text>
    </view>

    <!-- 滚动主内容 -->
    <scroll-view scroll-y class="scroll-content" :style="{ height: scrollHeight + 'px' }">

      <!-- 分段控制器 -->
      <view style="padding: 8rpx 32rpx 28rpx;">
        <view class="seg">
          <view
            v-for="tab in tabs"
            :key="tab.key"
            class="seg-btn"
            :class="{ active: activeTab === tab.key }"
            @tap="setTab(tab.key)"
          >
            {{ tab.label }}
            <text v-if="getCount(tab.key) > 0" class="tab-count">{{ getCount(tab.key) }}</text>
          </view>
        </view>
      </view>

      <view class="order-list" v-if="filteredOrders.length > 0">
        <view
          v-for="order in filteredOrders"
          :key="order.id"
          class="order-card card shadow-warm"
        >
          <!-- 状态条 -->
          <view class="status-strip" :style="getStatusStrip(order.status)">
            <view style="display:flex;align-items:center;gap:12rpx;">
              <view class="status-dot" :style="{ background: getStatusColor(order.status) }" />
              <text>{{ getStatusText(order.status) }}</text>
            </view>
            <text class="order-no">订单 #{{ order.orderNo || order.id }}</text>
          </view>

          <!-- 内容体 -->
          <view class="order-body" @tap="toOrderDetail(order)">
            <view class="order-thumb ph" :style="{ background: order.thumbBg }">
              <image
                v-if="order.cover"
                class="thumb-img"
                :src="order.cover"
                mode="aspectFill"
                @error="order.coverError = true"
              />
            </view>
            <view class="order-info">
              <text class="order-name serif">{{ order.courseName }}</text>
              <view style="display:flex;align-items:center;gap:8rpx;margin-top:10rpx;">
                <SvgIcon name="clock" :color="iconColor" :size="22" />
                <text style="font-size:22rpx;color:var(--ink-3);">{{ order.timeSlot }}</text>
              </view>
              <view style="display:flex;align-items:center;gap:8rpx;margin-top:8rpx;">
                <SvgIcon name="user" :color="iconColor" :size="22" />
                <text style="font-size:22rpx;color:var(--ink-3);">{{ order.studentName || '学员' }}</text>
              </view>
              <view style="display:flex;gap:8rpx;margin-top:12rpx;">
                <view class="tag">{{ order.classType }}</view>
              </view>
            </view>
          </view>

          <!-- 提示 + 操作 -->
          <view class="order-footer">
            <view class="order-hint">
              <view class="hint-dot" :style="{ background: getStatusColor(order.status) }" />
              <text style="font-size:22rpx;color:var(--ink-3);flex:1;">{{ getStatusHint(order.status) }}</text>
            </view>
            <view class="order-actions">
              <view v-if="canCancel(order.status)" class="act-btn ghost" @tap.stop="handleCancel(order)">取消预约</view>
              <view v-if="canCancel(order.status)" class="act-btn ghost" @tap.stop="toOrderDetail(order)">查看详情</view>
              <view v-if="order.status === 'approved'" class="act-btn ghost" @tap.stop="toOrderDetail(order)">查看详情</view>
              <view v-if="canRebook(order.status)" class="act-btn ghost" @tap.stop="handleRebook(order)">再次预约</view>
            </view>
          </view>
        </view>

        <view class="list-end hand">— 共 {{ filteredOrders.length }} 条记录 —</view>
      </view>

      <!-- 空状态 -->
      <view v-else class="empty-state">
        <text style="font-size:80rpx;">📋</text>
        <text class="empty-title">暂无{{ getTabLabel(activeTab) }}预约</text>
        <text class="empty-sub">快去挑选你喜欢的课程吧</text>
        <view class="to-course-btn btn-primary" @tap="toCourseList">浏览课程</view>
      </view>

      <view style="height:200rpx;" />
    </scroll-view>

  </view>
</template>

<script setup>
import { ref, computed, onMounted } from 'vue'
import { onShow } from '@dcloudio/uni-app'
import { getOrders, cancelOrder } from '@/api/order.js'
import { useUserStore } from '@/stores/user.js'
import { normalizeOrder } from '@/utils/normalize.js'
import SvgIcon from '@/components/SvgIcon.vue'
import { useTabbarStore } from '@/stores/tabbar.js'
const statusBarHeight = ref(44)
const scrollHeight = ref(600)
const activeTab = ref('all')
const loading = ref(false)
const allOrders = ref([])

const iconColor = '#8A7E70'

onMounted(() => {
  const info = uni.getSystemInfoSync()
  statusBarHeight.value = info.statusBarHeight || 44
  const navH = 88 * (info.screenWidth || 375) / 750
  scrollHeight.value = info.windowHeight - statusBarHeight.value - navH
})

onShow(() => {
  useTabbarStore().active = 'order'
  loadOrders()
})

const tabs = ref([
  { key: 'all',       label: '全部' },
  { key: 'pending',   label: '待审核' },
  { key: 'approved',  label: '已通过' },
  { key: 'rejected',  label: '已拒绝' },
  { key: 'cancelled', label: '已取消' },
])

async function loadOrders() {
  const userStore = useUserStore()
  if (!userStore.isLoggedIn) {
    try { await userStore.login() } catch(e) { return }
  }
  loading.value = true
  try {
    const params = { page: 1, pageSize: 20 }
    if (activeTab.value !== 'all') params.status = activeTab.value
    const res = await getOrders(params)
    allOrders.value = (res?.list || res || []).map(normalizeOrder)
  } catch(e) {
    console.error('orders error:', e)
  } finally {
    loading.value = false
  }
}

const filteredOrders = computed(() => {
  if (activeTab.value === 'all') return allOrders.value
  return allOrders.value.filter(o => o.status === activeTab.value)
})

function getCount(key) {
  if (key === 'all') return 0
  return allOrders.value.filter(o => o.status === key).length
}

const STATUS_META = {
  pending:   { text: '待审核', color: '#E8B860', bg: 'rgba(232,184,96,0.16)', txtColor: '#8A6520', hint: '讲师将于 24 小时内审核' },
  approved:  { text: '已通过', color: '#6B7F5A', bg: 'var(--moss-soft)',       txtColor: 'var(--moss)', hint: '请提前 10 分钟到场' },
  rejected:  { text: '已拒绝', color: '#A0473F', bg: 'rgba(160,71,63,0.12)',  txtColor: 'var(--berry)', hint: '预约未通过，可重新预约' },
  cancelled: { text: '已取消', color: '#8A7E70', bg: 'rgba(42,37,32,0.06)',   txtColor: 'var(--ink-3)', hint: '已取消' },
}

function getStatusText(s) { return STATUS_META[s]?.text || s }
function getStatusColor(s) { return STATUS_META[s]?.color || '#8A7E70' }
function getStatusHint(s) { return STATUS_META[s]?.hint || '' }
function getStatusStrip(s) {
  const m = STATUS_META[s] || STATUS_META.cancelled
  return { background: m.bg, color: m.txtColor }
}

function getTabLabel(key) {
  return tabs.value.find(t => t.key === key)?.label || ''
}

function canCancel(status) {
  return status === 'pending' || status === 'approved'
}
function canRebook(status) {
  return status === 'rejected' || status === 'cancelled'
}

function setTab(key) {
  activeTab.value = key
  loadOrders()
}
function toOrderDetail(order) {
  uni.navigateTo({ url: `/pages/order/detail?id=${order.id}` })
}
function handleCancel(order) {
  uni.showModal({
    title: '取消预约',
    content: `确定要取消"${order.courseName}"的预约吗？`,
    confirmText: '确认取消',
    confirmColor: '#D97757',
    success: async (res) => {
      if (res.confirm) {
        try {
          await cancelOrder(order.id)
          uni.showToast({ title: '已取消预约', icon: 'success' })
          loadOrders()
        } catch(e) {
          console.error('cancel error:', e)
        }
      }
    },
  })
}
function handleRebook(order) {
  uni.navigateTo({ url: `/pages/course/detail?id=${order.courseId || 1}` })
}
function toCourseList() {
  uni.switchTab({ url: '/pages/course/list' })
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

.order-list {
  padding: 0 32rpx;
  display: flex;
  flex-direction: column;
  gap: 28rpx;
  padding-top: 4rpx;
}

.order-card {
  border-radius: 36rpx;
  overflow: hidden;
}

/* 状态条 */
.status-strip {
  display: flex;
  align-items: center;
  justify-content: space-between;
  padding: 20rpx 32rpx;
  font-size: 24rpx;
  font-weight: 600;
}
.status-dot {
  width: 12rpx;
  height: 12rpx;
  border-radius: 50%;
}
.order-no {
  font-size: 22rpx;
  opacity: 0.85;
}

/* 订单内容体 */
.order-body {
  padding: 28rpx;
  display: flex;
  gap: 24rpx;
}
.order-thumb {
  width: 152rpx;
  height: 152rpx;
  border-radius: 24rpx;
  flex-shrink: 0;
  background: var(--primary-soft);
  position: relative;
  overflow: hidden;
}
.order-info {
  flex: 1;
  min-width: 0;
}
.order-name {
  font-size: 30rpx;
  font-weight: 600;
  line-height: 1.3;
  color: var(--ink);
}

/* 提示 + 操作 */
.order-footer {
  padding: 0 28rpx 28rpx;
}
.order-hint {
  display: flex;
  align-items: center;
  gap: 12rpx;
  padding: 16rpx 20rpx;
  border-radius: 16rpx;
  background: rgba(42,37,32,0.04);
}
.hint-dot {
  width: 10rpx;
  height: 10rpx;
  border-radius: 50%;
  flex-shrink: 0;
}
.order-actions {
  display: flex;
  gap: 16rpx;
  margin-top: 24rpx;
  justify-content: flex-end;
}
.act-btn {
  padding: 16rpx 32rpx;
  border-radius: 999rpx;
  font-size: 24rpx;
  font-weight: 500;
  &.ghost {
    background: transparent;
    color: var(--ink-2);
    border: 1rpx solid var(--line);
  }
  &.primary {
    background: var(--primary);
    color: #FFFCF5;
    font-weight: 600;
  }
}

.tab-count {
  display: inline-block;
  background: var(--primary);
  color: #FFFCF5;
  font-size: 18rpx;
  min-width: 28rpx;
  height: 28rpx;
  border-radius: 14rpx;
  text-align: center;
  line-height: 28rpx;
  padding: 0 6rpx;
  margin-left: 4rpx;
  .seg-btn.active & {
    background: rgba(255,255,255,0.3);
  }
}

.thumb-img {
  position: absolute;
  inset: 0;
  width: 100%;
  height: 100%;
  border-radius: inherit;
}

.list-end {
  text-align: center;
  color: var(--ink-3);
  font-size: 24rpx;
  padding: 24rpx 0;
}

/* 空状态 */
.empty-state {
  display: flex;
  flex-direction: column;
  align-items: center;
  padding: 120rpx 64rpx;
  gap: 16rpx;
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
.to-course-btn {
  margin-top: 16rpx;
}
</style>
