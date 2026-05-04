<template>
  <div>
    <div class="page-header">
      <div>
        <div class="page-title">消息推送</div>
        <div style="font-size:13px;color:var(--ink-3);margin-top:2px;">微信订阅消息 · 审核结果通知</div>
      </div>
      <div style="flex:1"></div>
      <button class="adm-btn ghost" @click="loadHistory">
        <svg viewBox="0 0 24 24" width="14" height="14" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round">
          <path d="M23 4v6h-6M1 20v-6h6"/><path d="M3.51 9a9 9 0 0114.85-3.36L23 10M1 14l4.64 4.36A9 9 0 0020.49 15"/>
        </svg>
        刷新
      </button>
    </div>

    <div class="two-col-push" style="margin-bottom:20px;">
      <div class="adm-card push-composer">
        <div class="composer-title">
          <svg viewBox="0 0 24 24" width="15" height="15" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
            <path d="M22 2L11 13M22 2L15 22l-4-9-9-4 19-7z"/>
          </svg>
          发送订阅消息
        </div>

        <div class="field-row">
          <div class="field-label">通知类型</div>
          <div class="adm-seg" style="width:fit-content;">
            <button :class="{ active: pushForm.type === 'approve' }" @click="pushForm.type = 'approve'">审核通过</button>
            <button :class="{ active: pushForm.type === 'reject' }" @click="pushForm.type = 'reject'">审核拒绝</button>
            <button :class="{ active: pushForm.type === 'remind' }" @click="pushForm.type = 'remind'">开课提醒</button>
          </div>
        </div>

        <div class="field-row">
          <div class="field-label">选择订单（获取用户信息）</div>
          <div class="adm-search" style="width:100%;">
            <svg viewBox="0 0 20 20" width="14" height="14" fill="none" stroke="currentColor" stroke-width="1.7">
              <circle cx="9" cy="9" r="5.5"/><path d="M14 14l3.5 3.5" stroke-linecap="round"/>
            </svg>
            <input type="text" v-model="orderSearch" placeholder="订单号 / 学员姓名" @input="searchOrders" />
          </div>

          <div v-if="orderResults.length" class="order-picker">
            <div
              v-for="o in orderResults"
              :key="o.id"
              class="order-opt"
              :class="{ selected: pushForm.orderId === o.id }"
              @click="selectOrder(o)"
            >
              <div class="av-sm" :style="{ background: o.color, fontSize:'11px', width:'24px', height:'24px' }">{{ o.student[0] }}</div>
              <div style="flex:1;">
                <div style="font-size:13px;font-weight:500;">{{ o.student }}</div>
                <div style="font-size:11px;color:var(--ink-3);">{{ o.course }} · #{{ o.orderNo }}</div>
              </div>
              <span class="st-pill" :class="statusClass(o.status)">{{ statusLabel(o.status) }}</span>
            </div>
          </div>

          <div v-if="pushForm.orderId" class="selected-order">
            <div class="av-sm" :style="{ background: pushForm.orderColor }">{{ pushForm.orderStudent?.[0] }}</div>
            <div>
              <div style="font-size:13px;font-weight:500;">{{ pushForm.orderStudent }}</div>
              <div style="font-size:11px;color:var(--ink-3);">{{ pushForm.orderCourse }}</div>
            </div>
            <button class="adm-btn sm ghost" @click="clearOrder">更换</button>
          </div>
        </div>

        <button
          class="adm-btn primary"
          style="width:100%;justify-content:center;margin-top:4px;"
          :disabled="!pushForm.orderId || !pushForm.openid || sending"
          @click="handleSend"
        >
          {{ sending ? '发送中…' : '发送消息' }}
        </button>

        <div v-if="!pushForm.openid && pushForm.orderId" style="font-size:12px;color:var(--butter);padding:8px;background:rgba(232,184,96,0.1);border-radius:8px;">
          该用户尚无微信 openid，消息可能无法送达。请确保用户已通过微信登录。
        </div>
      </div>

      <div class="adm-card" style="padding:20px;">
        <div style="font-size:13px;font-weight:600;color:var(--ink);margin-bottom:16px;">使用说明</div>
        <div style="font-size:13px;color:var(--ink-2);line-height:1.8;">
          <p>1. 在下方发送记录中搜索并选择目标订单</p>
          <p>2. 选择通知类型（通过/拒绝/提醒）</p>
          <p>3. 点击发送，系统将通过微信订阅消息通知用户</p>
          <p style="margin-top:10px;font-size:12px;color:var(--ink-3);">
            需要在 .env 中配置 WECHAT_APPID 和 WECHAT_APPSECRET 才能正常发送。
          </p>
        </div>
      </div>
    </div>

    <!-- Send history -->
    <div class="adm-card">
      <div style="padding:16px 20px 12px;display:flex;align-items:center;gap:10px;border-bottom:0.5px solid var(--line);">
        <div style="font-size:14px;font-weight:600;color:var(--ink);">发送记录</div>
        <div style="flex:1"></div>
        <select class="adm-select" v-model="historyFilter" @change="loadHistory">
          <option value="">全部类型</option>
          <option value="approve">审核通过</option>
          <option value="reject">审核拒绝</option>
          <option value="remind">开课提醒</option>
        </select>
      </div>
      <div v-if="historyLoading" style="text-align:center;padding:40px;color:var(--ink-3);">加载中…</div>
      <table v-else class="adm-table">
        <thead>
          <tr>
            <th>时间</th>
            <th>类型</th>
            <th>学员</th>
            <th>课程</th>
            <th>状态</th>
          </tr>
        </thead>
        <tbody>
          <tr v-for="h in history" :key="h.id">
            <td style="font-size:12px;color:var(--ink-3);white-space:nowrap;">{{ h.sentAt }}</td>
            <td>
              <span class="push-type-tag" :class="h.type">
                {{ h.type === 'approve' ? '审核通过' : h.type === 'reject' ? '审核拒绝' : '开课提醒' }}
              </span>
            </td>
            <td>
              <div style="display:flex;align-items:center;gap:6px;">
                <div class="av-sm" :style="{ background: h.color, fontSize:'10px', width:'22px', height:'22px' }">{{ h.student?.[0] || '?' }}</div>
                <span style="font-size:13px;">{{ h.student }}</span>
              </div>
            </td>
            <td style="font-size:13px;color:var(--ink-2);">{{ h.course }}</td>
            <td>
              <span class="st-pill" :class="h.status === 'success' ? 'st-approved' : 'st-rejected'">
                {{ h.status === 'success' ? '成功' : '失败' }}
              </span>
            </td>
          </tr>
          <tr v-if="!historyLoading && history.length === 0">
            <td colspan="5" style="text-align:center;padding:40px;color:var(--ink-3);">暂无发送记录</td>
          </tr>
        </tbody>
      </table>

      <div v-if="historyTotal > 10" class="adm-pagination">
        <button :disabled="historyPage <= 1" @click="historyPage--; loadHistory()">←</button>
        <button class="active">{{ historyPage }}</button>
        <button :disabled="historyPage * 10 >= historyTotal" @click="historyPage++; loadHistory()">→</button>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref, onMounted } from 'vue'
import request, { sendMessage, getMessages } from '@/api/index.js'

const sending = ref(false)
const historyLoading = ref(false)
const historyFilter = ref('')
const historyPage = ref(1)
const historyTotal = ref(0)
const orderSearch = ref('')
const orderResults = ref([])
const history = ref([])

const pushForm = ref({
  type: 'approve',
  orderId: null,
  orderStudent: '',
  orderCourse: '',
  orderColor: '#D97757',
  openid: '',
})

const colorPool = ['#D97757', '#6B7F5A', '#E8B860', '#A0473F', '#7A9CB0']

function statusLabel(s) {
  return { pending: '待审核', approved: '已通过', rejected: '已拒绝', cancelled: '已取消' }[s] || s
}
function statusClass(s) {
  return { pending: 'st-pending', approved: 'st-approved', rejected: 'st-rejected', cancelled: 'st-cancelled' }[s] || ''
}

async function searchOrders() {
  if (!orderSearch.value.trim()) { orderResults.value = []; return }
  try {
    const data = await request.get('/admin/orders', { params: { keyword: orderSearch.value, pageSize: 8 } })
    const list = data?.list || []
    orderResults.value = list.map((o, i) => ({
      id: o.id,
      student: o.student?.name || '学员',
      course: o.course?.title || '',
      orderNo: String(o.id),
      status: o.status || 'pending',
      openid: o.user?.openid || '',
      color: colorPool[i % colorPool.length],
    }))
  } catch(e) {
    orderResults.value = []
  }
}

function selectOrder(o) {
  pushForm.value.orderId = o.id
  pushForm.value.orderStudent = o.student
  pushForm.value.orderCourse = o.course
  pushForm.value.orderColor = o.color
  pushForm.value.openid = o.openid || ''
  orderResults.value = []
  orderSearch.value = ''
}

function clearOrder() {
  pushForm.value.orderId = null
  pushForm.value.orderStudent = ''
  pushForm.value.orderCourse = ''
  pushForm.value.openid = ''
}

async function handleSend() {
  if (!pushForm.value.orderId) return
  sending.value = true
  try {
    const typeMessages = {
      approve: { thing1: { value: pushForm.value.orderCourse }, thing2: { value: '审核通过' }, time3: { value: new Date().toLocaleDateString() }, thing4: { value: '请按时参加课程' } },
      reject: { thing1: { value: pushForm.value.orderCourse }, thing2: { value: '审核未通过' }, time3: { value: new Date().toLocaleDateString() }, thing4: { value: '请联系客服了解详情' } },
      remind: { thing1: { value: pushForm.value.orderCourse }, thing2: { value: '即将开课' }, time3: { value: new Date().toLocaleDateString() }, thing4: { value: '请提前5分钟到达' } },
    }
    await sendMessage({
      user_openid: pushForm.value.openid || 'dev_test_openid',
      template_id: 'wx_audit_result',
      type: pushForm.value.type,
      student_name: pushForm.value.orderStudent,
      course_title: pushForm.value.orderCourse,
      data: typeMessages[pushForm.value.type] || typeMessages.approve,
    })
    await loadHistory()
    clearOrder()
    alert('消息已发送')
  } catch(e) {
    alert(e?.message || '发送失败')
  } finally {
    sending.value = false
  }
}

async function loadHistory() {
  historyLoading.value = true
  try {
    const params = { page: historyPage.value, pageSize: 10 }
    if (historyFilter.value) params.type = historyFilter.value
    const data = await getMessages(params)
    const list = data?.list || []
    historyTotal.value = data?.total || 0
    history.value = list.map((h, i) => ({
      id: h.id,
      sentAt: h.created_at || '',
      type: h.type || 'approve',
      student: h.student_name || '学员',
      course: h.course_title || '',
      status: h.status || 'success',
      color: colorPool[i % colorPool.length],
    }))
  } catch(e) {
    history.value = []
  } finally {
    historyLoading.value = false
  }
}

onMounted(loadHistory)
</script>

<style scoped>
.two-col-push { display: grid; grid-template-columns: 1.2fr 1fr; gap: 16px; }

.push-composer { padding: 22px; display: flex; flex-direction: column; gap: 16px; }

.composer-title {
  display: flex; align-items: center; gap: 7px;
  font-size: 14px; font-weight: 600; color: var(--ink);
}

.field-row { display: flex; flex-direction: column; gap: 7px; }
.field-label { font-size: 12px; font-weight: 600; color: var(--ink-2); }

.order-picker {
  background: var(--card); border: 0.5px solid var(--line);
  border-radius: 10px; overflow: hidden;
  box-shadow: 0 4px 16px rgba(42,37,32,0.1);
}

.order-opt {
  display: flex; align-items: center; gap: 8px;
  padding: 10px 14px; cursor: pointer;
  transition: background 0.12s;
  border-bottom: 0.5px solid var(--line-2);
}
.order-opt:last-child { border-bottom: none; }
.order-opt:hover { background: var(--paper-2); }
.order-opt.selected { background: var(--primary-soft); }

.selected-order {
  display: flex; align-items: center; gap: 10px;
  padding: 10px 14px;
  background: rgba(107,127,90,0.1); border-radius: 10px;
  border: 0.5px solid rgba(107,127,90,0.25);
}

.push-type-tag {
  display: inline-flex; align-items: center;
  padding: 2px 8px; border-radius: 5px;
  font-size: 12px; font-weight: 500;
}
.push-type-tag.approve { background: rgba(107,127,90,0.12); color: var(--moss); }
.push-type-tag.reject { background: rgba(160,71,63,0.1); color: var(--berry); }
.push-type-tag.remind { background: rgba(232,184,96,0.12); color: #8A6520; }
</style>
