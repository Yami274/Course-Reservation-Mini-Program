<template>
  <view class="page">
    <view class="status-bar" :style="{ height: statusBarHeight + 'px' }"></view>

    <view class="nav-bar">
      <view class="back-btn" @tap="goBack">
        <text class="back-icon">‹</text>
      </view>
      <text class="nav-title">预约审核</text>
      <view style="width: 64rpx;"></view>
    </view>

    <!-- Tab bar -->
    <view class="tab-wrap">
      <scroll-view scroll-x class="tab-scroll" :show-scrollbar="false">
        <view class="tab-list">
          <view
            v-for="tab in tabs"
            :key="tab.key"
            class="tab-item"
            :class="{ active: activeTab === tab.key }"
            @tap="setTab(tab.key)"
          >
            {{ tab.label }}
            <view v-if="tab.key === 'pending' && pendingCount > 0" class="tab-badge">
              {{ pendingCount }}
            </view>
          </view>
        </view>
      </scroll-view>
    </view>

    <scroll-view scroll-y class="scroll-content" :style="{ height: listHeight + 'px' }">

      <view v-if="loading" class="loading-state">
        <text>加载中…</text>
      </view>

      <view v-else-if="orders.length === 0" class="empty-state">
        <text class="empty-emoji">📋</text>
        <text class="empty-title">暂无{{ currentTabLabel }}预约</text>
      </view>

      <view v-else class="order-list">
        <view
          v-for="order in orders"
          :key="order.id"
          class="order-card"
        >
          <!-- Card header -->
          <view class="card-head">
            <view class="student-info">
              <view class="avatar-circle">
                <text class="avatar-text">{{ getInitial(order.student_name || order.userName) }}</text>
              </view>
              <view>
                <text class="student-name">{{ order.student_name || order.userName || '学员' }}</text>
                <text class="student-meta">{{ order.phone || order.student_phone || '' }}</text>
              </view>
            </view>
            <view class="status-pill" :class="getStatusClass(order.status)">
              {{ getStatusText(order.status) }}
            </view>
          </view>

          <view class="divider"></view>

          <!-- Course info -->
          <view class="course-row">
            <view class="course-thumb" :style="{ background: order.thumbBg || '#F2C9B5' }"></view>
            <view class="course-info">
              <text class="course-name">{{ order.course_name || order.courseName }}</text>
              <text class="course-meta">{{ order.class_type || order.classType || '' }}</text>
              <view class="time-row" v-if="order.time_slot || order.timeSlot">
                <text class="time-icon">🕐</text>
                <text class="time-text">{{ order.time_slot || order.timeSlot }}</text>
              </view>
            </view>
          </view>

          <!-- Order meta -->
          <view class="order-meta-row">
            <text class="order-no">预约号 {{ order.order_no || order.orderNo || order.id }}</text>
            <text class="order-time">{{ formatTime(order.created_at || order.createdAt) }}</text>
          </view>

          <!-- Remark -->
          <view v-if="order.remark" class="remark-row">
            <text class="remark-label">备注：</text>
            <text class="remark-text">{{ order.remark }}</text>
          </view>

          <!-- Reject reason -->
          <view v-if="order.status === 'rejected' && order.reject_reason" class="reject-reason-row">
            <text class="reject-label">拒绝原因：</text>
            <text class="reject-text">{{ order.reject_reason }}</text>
          </view>

          <!-- Actions for pending -->
          <view v-if="order.status === 'pending'" class="card-actions">
            <view class="action-btn reject-btn" @tap="handleReject(order)">
              拒绝
            </view>
            <view class="action-btn approve-btn" @tap="handleApprove(order)">
              通过
            </view>
          </view>
        </view>
      </view>

      <!-- Load more -->
      <view v-if="hasMore && !loading" class="load-more-btn" @tap="loadMore">
        加载更多
      </view>

      <view class="bottom-space"></view>
    </scroll-view>

    <!-- Reject reason modal -->
    <view v-if="rejectModal.show" class="modal-mask" @tap.self="closeRejectModal">
      <view class="modal-box">
        <view class="modal-head">
          <text class="modal-title">填写拒绝原因</text>
          <view class="modal-close" @tap="closeRejectModal">✕</view>
        </view>
        <view class="modal-body">
          <text class="modal-hint">请告知学员无法通过的原因（可选）</text>
          <view class="quick-reasons">
            <view
              v-for="r in quickReasons"
              :key="r"
              class="quick-reason-chip"
              :class="{ selected: rejectModal.reason === r }"
              @tap="rejectModal.reason = r"
            >{{ r }}</view>
          </view>
          <textarea
            class="reason-input"
            v-model="rejectModal.reason"
            placeholder="自定义拒绝原因（如名额已满、时间冲突等）"
            :maxlength="100"
          ></textarea>
        </view>
        <view class="modal-foot">
          <view class="modal-btn cancel" @tap="closeRejectModal">取消</view>
          <view class="modal-btn confirm" @tap="confirmReject">确认拒绝</view>
        </view>
      </view>
    </view>
  </view>
</template>

<script setup>
import { ref, computed, onMounted } from 'vue'
import { onShow } from '@dcloudio/uni-app'
import http from '@/utils/request.js'

const statusBarHeight = ref(44)
const listHeight = ref(600)
const loading = ref(false)
const orders = ref([])
const activeTab = ref('pending')
const page = ref(1)
const hasMore = ref(false)
const pendingCount = ref(0)

const thumbColors = ['#F2C9B5', '#C7D1B6', '#B5D4E2', '#F9E0A2', '#D4B5E8']

const tabs = [
  { key: 'pending', label: '待审核' },
  { key: 'approved', label: '已通过' },
  { key: 'rejected', label: '已拒绝' },
  { key: 'all', label: '全部' },
]

const currentTabLabel = computed(() => tabs.find(t => t.key === activeTab.value)?.label || '')

const rejectModal = ref({
  show: false,
  order: null,
  reason: '',
})

const quickReasons = ['名额已满', '时间冲突', '课程暂停', '学员资料不完整']

onMounted(() => {
  const info = uni.getSystemInfoSync()
  statusBarHeight.value = info.statusBarHeight || 44
  listHeight.value = info.windowHeight - statusBarHeight.value - 44 - 88
})

onShow(() => {
  page.value = 1
  loadOrders()
})

async function loadOrders(append = false) {
  loading.value = true
  try {
    const params = { page: page.value, pageSize: 10 }
    if (activeTab.value !== 'all') params.status = activeTab.value
    const res = await http.get('/admin/orders', params, { showLoad: false })
    const list = (res?.list || res || []).map((o, i) => ({
      ...o,
      thumbBg: thumbColors[i % thumbColors.length],
    }))
    if (append) {
      orders.value = [...orders.value, ...list]
    } else {
      orders.value = list
    }
    hasMore.value = list.length === 10
    if (activeTab.value !== 'pending') {
      loadPendingCount()
    } else {
      pendingCount.value = list.filter(o => o.status === 'pending').length
    }
  } catch(e) {
    console.error('admin orders error:', e)
  } finally {
    loading.value = false
  }
}

async function loadPendingCount() {
  try {
    const res = await http.get('/admin/orders', { status: 'pending', pageSize: 1 }, { showLoad: false })
    pendingCount.value = res?.total || 0
  } catch(_) {}
}

function loadMore() {
  page.value++
  loadOrders(true)
}

function setTab(key) {
  activeTab.value = key
  page.value = 1
  loadOrders()
}

const statusMap = {
  pending: { text: '待审核', cls: 'status-pending' },
  approved: { text: '已通过', cls: 'status-approved' },
  rejected: { text: '已拒绝', cls: 'status-rejected' },
  cancelled: { text: '已取消', cls: 'status-cancelled' },
}

function getStatusText(status) { return statusMap[status]?.text || status }
function getStatusClass(status) { return statusMap[status]?.cls || '' }

function getInitial(name) {
  if (!name) return '?'
  return name.slice(0, 1)
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

async function handleApprove(order) {
  uni.showModal({
    title: '通过预约',
    content: `确认通过"${order.student_name || order.userName}"的预约吗？`,
    confirmText: '确认通过',
    confirmColor: '#6B7F5A',
    success: async (res) => {
      if (res.confirm) {
        try {
          await http.put(`/admin/orders/${order.id}/audit`, { action: 'approve', remark: '' })
          uni.showToast({ title: '已通过', icon: 'success' })
          page.value = 1
          loadOrders()
        } catch(e) {
          console.error('approve error:', e)
        }
      }
    },
  })
}

function handleReject(order) {
  rejectModal.value = { show: true, order, reason: '' }
}

function closeRejectModal() {
  rejectModal.value.show = false
}

async function confirmReject() {
  const order = rejectModal.value.order
  if (!order) return
  try {
    await http.put(`/admin/orders/${order.id}/audit`, {
      action: 'reject',
      remark: rejectModal.value.reason || '',
    })
    uni.showToast({ title: '已拒绝', icon: 'success' })
    closeRejectModal()
    page.value = 1
    loadOrders()
  } catch(e) {
    console.error('reject error:', e)
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

.back-btn {
  width: 64rpx;
  height: 64rpx;
  display: flex;
  align-items: center;
  justify-content: center;
}

.back-icon {
  font-size: 48rpx;
  color: var(--ink);
  font-weight: 300;
}

.nav-title {
  font-size: 34rpx;
  font-weight: 800;
  color: var(--ink);
}

/* Tab */
.tab-wrap {
  background: var(--paper-2);
  padding: 4rpx 0 20rpx;
  box-shadow: 0 2rpx 8rpx rgba(42, 37, 32, 0.06);
}

.tab-scroll { width: 100%; }

.tab-list {
  display: inline-flex;
  padding: 0 24rpx;
  gap: 8rpx;
}

.tab-item {
  flex-shrink: 0;
  position: relative;
  display: flex;
  align-items: center;
  gap: 6rpx;
  font-size: 26rpx;
  color: var(--ink-3);
  padding: 12rpx 28rpx;
  border-radius: 20rpx;
  font-weight: 500;
  white-space: nowrap;
  transition: all 0.2s;

  &.active {
    background: var(--primary);
    color: #fff;
    font-weight: 600;
    box-shadow: 0 4rpx 12rpx rgba(217, 119, 87, 0.3);
  }
}

.tab-badge {
  background: var(--berry);
  color: #fff;
  font-size: 18rpx;
  min-width: 32rpx;
  height: 32rpx;
  border-radius: 16rpx;
  display: flex;
  align-items: center;
  justify-content: center;
  padding: 0 6rpx;

  .active & { background: rgba(255, 255, 255, 0.35); }
}

.scroll-content {
  width: 100%;
  overflow-y: scroll;
  overflow-x: hidden;
}

/* States */
.loading-state, .empty-state {
  display: flex;
  flex-direction: column;
  align-items: center;
  padding: 100rpx 32rpx;
  gap: 16rpx;
  font-size: 28rpx;
  color: var(--ink-3);
}

.empty-emoji { font-size: 80rpx; }
.empty-title { font-size: 30rpx; font-weight: 600; color: var(--ink); }

/* Order list */
.order-list {
  padding: 24rpx 32rpx;
  display: flex;
  flex-direction: column;
  gap: 16rpx;
}

.order-card {
  background: var(--card);
  border-radius: 24rpx;
  padding: 24rpx;
  box-shadow: 0 2rpx 16rpx rgba(42, 37, 32, 0.06);
}

/* Card head */
.card-head {
  display: flex;
  align-items: center;
  justify-content: space-between;
  margin-bottom: 20rpx;
}

.student-info {
  display: flex;
  align-items: center;
  gap: 16rpx;
}

.avatar-circle {
  width: 72rpx;
  height: 72rpx;
  border-radius: 50%;
  background: linear-gradient(135deg, #F9D9C4, #E8A87C);
  display: flex;
  align-items: center;
  justify-content: center;
  flex-shrink: 0;
}

.avatar-text {
  font-size: 28rpx;
  font-weight: 700;
  color: #fff;
}

.student-name {
  display: block;
  font-size: 30rpx;
  font-weight: 700;
  color: var(--ink);
  margin-bottom: 4rpx;
}

.student-meta {
  display: block;
  font-size: 22rpx;
  color: var(--ink-3);
}

/* Status pill */
.status-pill {
  font-size: 22rpx;
  font-weight: 600;
  padding: 6rpx 18rpx;
  border-radius: 20rpx;
}

.status-pending {
  background: rgba(232, 184, 96, 0.18);
  color: #9A6820;
}

.status-approved {
  background: rgba(107, 127, 90, 0.15);
  color: #3A6A30;
}

.status-rejected {
  background: rgba(160, 71, 63, 0.12);
  color: #A0473F;
}

.status-cancelled {
  background: rgba(138, 126, 112, 0.12);
  color: var(--ink-3);
}

.divider {
  width: 100%;
  height: 1rpx;
  background: var(--line);
  margin-bottom: 20rpx;
}

/* Course row */
.course-row {
  display: flex;
  gap: 16rpx;
  align-items: flex-start;
  margin-bottom: 16rpx;
}

.course-thumb {
  width: 80rpx;
  height: 80rpx;
  border-radius: 14rpx;
  flex-shrink: 0;
}

.course-info { flex: 1; min-width: 0; }

.course-name {
  display: block;
  font-size: 28rpx;
  font-weight: 600;
  color: var(--ink);
  margin-bottom: 6rpx;
}

.course-meta {
  display: block;
  font-size: 22rpx;
  color: var(--ink-3);
  margin-bottom: 6rpx;
}

.time-row {
  display: flex;
  align-items: center;
  gap: 6rpx;
}

.time-icon { font-size: 22rpx; }
.time-text { font-size: 22rpx; color: var(--ink-2); }

/* Order meta */
.order-meta-row {
  display: flex;
  align-items: center;
  justify-content: space-between;
  margin-bottom: 12rpx;
}

.order-no {
  font-size: 22rpx;
  color: var(--ink-3);
}

.order-time {
  font-size: 22rpx;
  color: var(--ink-3);
}

/* Remark */
.remark-row, .reject-reason-row {
  background: var(--paper);
  border-radius: 12rpx;
  padding: 14rpx 16rpx;
  margin-bottom: 12rpx;
  display: flex;
  gap: 8rpx;
}

.remark-label, .reject-label {
  font-size: 22rpx;
  color: var(--ink-3);
  flex-shrink: 0;
}

.remark-text {
  font-size: 22rpx;
  color: var(--ink-2);
  flex: 1;
}

.reject-text {
  font-size: 22rpx;
  color: var(--berry);
  flex: 1;
}

/* Actions */
.card-actions {
  display: flex;
  gap: 12rpx;
  margin-top: 4rpx;
  padding-top: 16rpx;
  border-top: 1rpx solid var(--line);
}

.action-btn {
  flex: 1;
  text-align: center;
  padding: 18rpx;
  border-radius: 16rpx;
  font-size: 28rpx;
  font-weight: 600;
  transition: all 0.15s;

  &:active {
    transform: scale(0.97);
  }
}

.reject-btn {
  background: rgba(160, 71, 63, 0.1);
  color: var(--berry);
}

.approve-btn {
  background: var(--moss);
  color: #fff;
  box-shadow: 0 4rpx 12rpx rgba(107, 127, 90, 0.3);
}

/* Load more */
.load-more-btn {
  text-align: center;
  padding: 28rpx;
  font-size: 26rpx;
  color: var(--primary);
  font-weight: 500;
}

/* Modal */
.modal-mask {
  position: fixed;
  inset: 0;
  background: rgba(42, 37, 32, 0.4);
  display: flex;
  align-items: flex-end;
  z-index: 1000;
}

.modal-box {
  width: 100%;
  background: var(--card);
  border-radius: 32rpx 32rpx 0 0;
  padding-bottom: env(safe-area-inset-bottom, 0);
}

.modal-head {
  display: flex;
  align-items: center;
  justify-content: space-between;
  padding: 32rpx 32rpx 20rpx;
  border-bottom: 1rpx solid var(--line);
}

.modal-title {
  font-size: 32rpx;
  font-weight: 700;
  color: var(--ink);
}

.modal-close {
  font-size: 32rpx;
  color: var(--ink-3);
  width: 60rpx;
  height: 60rpx;
  display: flex;
  align-items: center;
  justify-content: center;
}

.modal-body {
  padding: 24rpx 32rpx;
}

.modal-hint {
  display: block;
  font-size: 24rpx;
  color: var(--ink-3);
  margin-bottom: 20rpx;
}

.quick-reasons {
  display: flex;
  flex-wrap: wrap;
  gap: 12rpx;
  margin-bottom: 20rpx;
}

.quick-reason-chip {
  font-size: 24rpx;
  padding: 10rpx 24rpx;
  border-radius: 16rpx;
  background: var(--paper-2);
  color: var(--ink-2);
  border: 1rpx solid var(--line);
  transition: all 0.15s;

  &.selected {
    background: var(--primary-soft);
    color: var(--primary-deep);
    border-color: var(--primary-soft);
  }
}

.reason-input {
  width: 100%;
  background: var(--paper-2);
  border: 1rpx solid var(--line);
  border-radius: 16rpx;
  padding: 20rpx;
  font-size: 26rpx;
  color: var(--ink);
  font-family: inherit;
  min-height: 120rpx;
  box-sizing: border-box;
}

.modal-foot {
  display: flex;
  gap: 16rpx;
  padding: 16rpx 32rpx 32rpx;
}

.modal-btn {
  flex: 1;
  text-align: center;
  padding: 24rpx;
  border-radius: 20rpx;
  font-size: 28rpx;
  font-weight: 600;
  transition: all 0.15s;

  &:active { transform: scale(0.97); }

  &.cancel {
    background: var(--paper-2);
    color: var(--ink-3);
  }

  &.confirm {
    background: var(--berry);
    color: #fff;
    box-shadow: 0 4rpx 12rpx rgba(160, 71, 63, 0.3);
  }
}

.bottom-space { height: 40rpx; }
</style>
