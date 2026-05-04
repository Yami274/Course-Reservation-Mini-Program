<template>
  <div>
    <!-- Page Header -->
    <div class="page-header">
      <div>
        <div class="page-title">预约审核</div>
        <div style="font-size:13px;color:var(--ink-3);margin-top:2px;">共{{ total }}条记录</div>
      </div>
      <div style="flex:1"></div>
      <button class="adm-btn ghost">
        <svg viewBox="0 0 24 24" width="14" height="14" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round">
          <path d="M12 4v12M7 11l5 5 5-5M5 20h14"/>
        </svg>
        导出 Excel
      </button>
      <button class="adm-btn primary">
        <svg viewBox="0 0 24 24" width="14" height="14" fill="none" stroke="currentColor" stroke-width="2.2" stroke-linecap="round" stroke-linejoin="round">
          <path d="M5 12l4.5 4.5L19 7"/>
        </svg>
        批量通过
      </button>
    </div>

    <!-- Status tabs + filters -->
    <div class="adm-card" style="padding:0 18px;margin-bottom:16px;display:flex;align-items:center;gap:0;border-bottom:none;">
      <div class="status-tabs">
        <button
          v-for="tab in tabs"
          :key="tab.key"
          class="status-tab"
          :class="{ active: activeTab === tab.key }"
          @click="activeTab = tab.key"
        >
          {{ tab.label }}
        </button>
      </div>
      <div style="flex:1"></div>
    </div>

    <!-- Table -->
    <div class="adm-card">
      <div v-if="loading" style="text-align:center;padding:60px;color:#8A7E70;">加载中…</div>
      <table v-else class="adm-table">
        <thead>
          <tr>
            <th style="width:36px;"><input type="checkbox" class="adm-checkbox"/></th>
            <th>订单号</th>
            <th>学员</th>
            <th>联系人</th>
            <th>课程 / 班型</th>
            <th>预约时段</th>
            <th>提交时间</th>
            <th>状态</th>
            <th>操作</th>
          </tr>
        </thead>
        <tbody>
          <tr v-for="order in filteredOrders" :key="order.id">
            <td><input type="checkbox" class="adm-checkbox"/></td>
            <td>
              <span style="font-family:monospace;font-size:12px;color:var(--ink-3);">{{ order.orderNo || order.id }}</span>
            </td>
            <td>
              <div style="display:flex;align-items:center;gap:7px;">
                <div class="av-sm" :style="{ background: order.color }">{{ order.student[0] }}</div>
                <div>
                  <div style="font-size:13px;font-weight:500;">{{ order.student }}</div>
                  <div style="font-size:11px;color:var(--ink-3);">{{ order.age }}</div>
                </div>
              </div>
            </td>
            <td>
              <div style="font-size:13px;">{{ order.contact }}</div>
              <div style="font-size:11px;color:var(--ink-3);font-family:monospace;">{{ order.phone }}</div>
            </td>
            <td>
              <div style="font-size:13px;font-weight:500;">{{ order.course }}</div>
              <div style="font-size:11px;color:var(--ink-3);">{{ order.type }}</div>
            </td>
            <td style="font-size:13px;white-space:nowrap;color:var(--ink-2);">{{ order.slot }}</td>
            <td style="font-size:12px;color:var(--ink-3);white-space:nowrap;">{{ order.submittedAt }}</td>
            <td>
              <span class="st-pill" :class="statusClass(order.status)">{{ order.status }}</span>
            </td>
            <td>
              <div style="display:flex;gap:6px;">
                <template v-if="order.status === '待审核'">
                  <button class="adm-btn sm danger" @click="handleReject(order.id)">拒绝</button>
                  <button class="adm-btn sm success" @click="handleApprove(order.id)">通过</button>
                </template>
                <template v-else>
                  <button class="adm-btn sm ghost">详情</button>
                </template>
              </div>
            </td>
          </tr>
        </tbody>
      </table>

      <div class="adm-pagination" v-if="total > pageSize">
        <button :disabled="page <= 1" @click="page--; loadOrders()">←</button>
        <button class="active">{{ page }}</button>
        <button :disabled="page * pageSize >= total" @click="page++; loadOrders()">→</button>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref, computed, onMounted, watch } from 'vue'
import { getOrders, auditOrder, cancelOrder } from '@/api/index.js'

const activeTab = ref('pending')
const orders = ref([])
const loading = ref(false)
const total = ref(0)
const page = ref(1)
const pageSize = 20

const colorPool = ['#D97757', '#6B7F5A', '#E8B860', '#A0473F', '#7A9CB0', '#8A7E70']

const tabs = [
  { key: 'all',       label: '全部' },
  { key: 'pending',   label: '待审核' },
  { key: 'approved',  label: '已通过' },
  { key: 'rejected',  label: '已拒绝' },
  { key: 'cancelled', label: '已取消' },
]

const statusApiMap = { all: '', pending: 'pending', approved: 'approved', rejected: 'rejected', cancelled: 'cancelled' }
const statusLabelMap = { pending: '待审核', approved: '已通过', rejected: '已拒绝', cancelled: '已取消' }
const statusClassMap = { '待审核': 'st-pending', '已通过': 'st-approved', '已拒绝': 'st-rejected', '已取消': 'st-cancelled' }

function statusClass(status) {
  return statusClassMap[status] || ''
}

async function loadOrders() {
  loading.value = true
  try {
    const params = { page: page.value, pageSize }
    const apiStatus = statusApiMap[activeTab.value]
    if (apiStatus) params.status = apiStatus
    const data = await getOrders(params)
    const list = data?.list || []
    total.value = data?.total || list.length
    orders.value = list.map((o, i) => {
      const s = o.schedule
      let slot = ''
      if (s) {
        const [, mm, dd] = (s.date || '').split('-')
        const start = (s.start_time || '').slice(0, 5)
        slot = mm ? `${mm}/${dd} ${start}` : start
      }
      return {
        id: o.id,
        orderNo: String(o.id),
        student: o.student?.name || '',
        age: o.student?.age != null ? `${o.student.age}岁` : '',
        contact: o.user?.nickname || '',
        phone: o.student?.phone || o.user?.phone || '',
        course: o.course?.title || '',
        type: o.courseType?.name || '',
        slot,
        submittedAt: o.created_at || '',
        status: statusLabelMap[o.status] || o.status || '',
        color: colorPool[i % colorPool.length],
      }
    })
  } catch(e) {
    console.error('订单加载失败', e)
  } finally {
    loading.value = false
  }
}

async function handleApprove(orderId) {
  try {
    await auditOrder(orderId, { action: 'approve' })
    await loadOrders()
  } catch(e) {
    alert(e?.message || '操作失败')
  }
}

async function handleReject(orderId) {
  const remark = prompt('请输入拒绝原因（可为空）')
  if (remark === null) return
  try {
    await auditOrder(orderId, { action: 'reject', remark })
    await loadOrders()
  } catch(e) {
    alert(e?.message || '操作失败')
  }
}

const filteredOrders = computed(() => orders.value)

watch(activeTab, () => {
  page.value = 1
  loadOrders()
})

onMounted(loadOrders)
</script>

<style scoped>
.status-tabs {
  display: flex;
  align-items: stretch;
}

.status-tab {
  display: flex;
  align-items: center;
  gap: 6px;
  padding: 14px 16px;
  border: none;
  background: transparent;
  font-size: 13px;
  font-weight: 500;
  color: var(--ink-3);
  cursor: pointer;
  border-bottom: 2px solid transparent;
  transition: all 0.15s;
  font-family: inherit;
  white-space: nowrap;
}

.status-tab.active {
  color: var(--primary);
  border-bottom-color: var(--primary);
}

.status-tab:hover:not(.active) {
  color: var(--ink-2);
}

.tab-badge {
  font-size: 10px;
  font-weight: 600;
  padding: 1px 6px;
  border-radius: 999px;
  background: rgba(42,37,32,0.08);
  color: var(--ink-3);
}

.tab-badge.primary {
  background: var(--primary);
  color: white;
}
</style>
