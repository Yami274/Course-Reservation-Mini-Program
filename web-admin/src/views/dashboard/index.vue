<template>
  <div>
    <!-- Page Header -->
    <div class="page-header">
      <div>
        <div class="page-title">数据总览</div>
        <div style="font-size:13px;color:var(--ink-3);margin-top:2px;">{{ greeting }}，今天是 {{ today }}</div>
      </div>
      <div style="flex:1"></div>
      <div class="adm-seg">
        <button :class="{ active: period === 'week' }" @click="switchPeriod('week')">本周</button>
        <button :class="{ active: period === 'month' }" @click="switchPeriod('month')">本月</button>
      </div>
      <button class="adm-btn primary" @click="$router.push('/courses')">
        <svg viewBox="0 0 24 24" width="14" height="14" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round">
          <path d="M12 5v14M5 12h14"/>
        </svg>
        新增课程
      </button>
    </div>

    <!-- Stat Cards -->
    <div class="grid-4" style="margin-bottom:20px;">
      <div class="adm-card stat-card">
        <div class="stat-label">今日预约</div>
        <div class="stat-num" style="color:var(--primary)">{{ stats.todayOrders ?? 0 }}</div>
        <div class="stat-delta positive">{{ periodLabel }}预约 {{ stats.periodOrders ?? 0 }}</div>
        <svg class="stat-spark" viewBox="0 0 80 32" preserveAspectRatio="none">
          <defs>
            <linearGradient id="g1" x1="0" y1="0" x2="0" y2="1">
              <stop offset="0%" stop-color="#D97757" stop-opacity="0.22"/>
              <stop offset="100%" stop-color="#D97757" stop-opacity="0"/>
            </linearGradient>
          </defs>
          <path d="M0,28 C10,22 20,18 30,14 C40,10 50,8 60,6 C65,5 70,4 80,3" fill="none" stroke="#D97757" stroke-width="1.8" stroke-linecap="round"/>
          <path d="M0,28 C10,22 20,18 30,14 C40,10 50,8 60,6 C65,5 70,4 80,3 L80,32 L0,32Z" fill="url(#g1)"/>
        </svg>
      </div>

      <div class="adm-card stat-card" @click="$router.push('/orders')" style="cursor:pointer;">
        <div class="stat-label">待审核</div>
        <div class="stat-num" style="color:var(--butter)">{{ stats.pendingCount ?? 0 }}</div>
        <div class="stat-delta" style="color:var(--ink-3)">需要处理</div>
        <svg class="stat-spark" viewBox="0 0 80 32" preserveAspectRatio="none">
          <defs>
            <linearGradient id="g2" x1="0" y1="0" x2="0" y2="1">
              <stop offset="0%" stop-color="#E8B860" stop-opacity="0.22"/>
              <stop offset="100%" stop-color="#E8B860" stop-opacity="0"/>
            </linearGradient>
          </defs>
          <path d="M0,20 C15,16 25,24 40,18 C55,12 65,20 80,14" fill="none" stroke="#E8B860" stroke-width="1.8" stroke-linecap="round"/>
          <path d="M0,20 C15,16 25,24 40,18 C55,12 65,20 80,14 L80,32 L0,32Z" fill="url(#g2)"/>
        </svg>
      </div>

      <div class="adm-card stat-card" @click="$router.push('/students')" style="cursor:pointer;">
        <div class="stat-label">活跃学员</div>
        <div class="stat-num" style="color:var(--moss)">{{ stats.totalStudents ?? 0 }}</div>
        <div class="stat-delta positive" style="color:var(--moss)">注册学员</div>
        <svg class="stat-spark" viewBox="0 0 80 32" preserveAspectRatio="none">
          <defs>
            <linearGradient id="g3" x1="0" y1="0" x2="0" y2="1">
              <stop offset="0%" stop-color="#6B7F5A" stop-opacity="0.22"/>
              <stop offset="100%" stop-color="#6B7F5A" stop-opacity="0"/>
            </linearGradient>
          </defs>
          <path d="M0,26 C20,22 30,18 45,12 C55,8 65,10 80,6" fill="none" stroke="#6B7F5A" stroke-width="1.8" stroke-linecap="round"/>
          <path d="M0,26 C20,22 30,18 45,12 C55,8 65,10 80,6 L80,32 L0,32Z" fill="url(#g3)"/>
        </svg>
      </div>

      <div class="adm-card stat-card" @click="$router.push('/courses')" style="cursor:pointer;">
        <div class="stat-label">在售课程</div>
        <div class="stat-num" style="color:var(--berry)">{{ stats.totalCourses ?? 0 }}</div>
        <div class="stat-delta" :style="{ color: stats.warningCount > 0 ? 'var(--berry)' : 'var(--moss)' }">
          {{ stats.warningCount > 0 ? `${stats.warningCount}个名额预警` : '名额充足' }}
        </div>
        <svg class="stat-spark" viewBox="0 0 80 32" preserveAspectRatio="none">
          <defs>
            <linearGradient id="g4" x1="0" y1="0" x2="0" y2="1">
              <stop offset="0%" stop-color="#A0473F" stop-opacity="0.22"/>
              <stop offset="100%" stop-color="#A0473F" stop-opacity="0"/>
            </linearGradient>
          </defs>
          <path d="M0,18 C10,16 20,22 35,20 C50,18 60,14 80,16" fill="none" stroke="#A0473F" stroke-width="1.8" stroke-linecap="round"/>
          <path d="M0,18 C10,16 20,22 35,20 C50,18 60,14 80,16 L80,32 L0,32Z" fill="url(#g4)"/>
        </svg>
      </div>
    </div>

    <!-- Trend + Ranking -->
    <div class="two-col-17" style="margin-bottom:20px;">
      <!-- Trend Chart -->
      <div class="adm-card" style="padding:22px;">
        <div style="display:flex;align-items:center;gap:12px;margin-bottom:6px;">
          <div style="font-size:14px;font-weight:600;color:var(--ink);">预约趋势 · 近30天</div>
          <div style="font-size:12px;color:var(--ink-3);flex:1;">
            共{{ trendTotal }}单
            <span v-if="trendDelta > 0" style="color:var(--moss)">↗ {{ trendDelta }}%</span>
          </div>
        </div>

        <svg class="trend-chart" viewBox="0 0 600 160" preserveAspectRatio="none">
          <defs>
            <linearGradient id="trendGrad" x1="0" y1="0" x2="0" y2="1">
              <stop offset="0%" stop-color="#D97757" stop-opacity="0.28"/>
              <stop offset="100%" stop-color="#D97757" stop-opacity="0.02"/>
            </linearGradient>
          </defs>
          <!-- Grid lines -->
          <line x1="0" y1="32" x2="600" y2="32" stroke="rgba(42,37,32,0.06)" stroke-width="1"/>
          <line x1="0" y1="64" x2="600" y2="64" stroke="rgba(42,37,32,0.06)" stroke-width="1"/>
          <line x1="0" y1="96" x2="600" y2="96" stroke="rgba(42,37,32,0.06)" stroke-width="1"/>
          <line x1="0" y1="128" x2="600" y2="128" stroke="rgba(42,37,32,0.06)" stroke-width="1"/>
          <template v-if="trendComputed">
            <text v-for="(yl, i) in trendComputed.yLabels" :key="'y'+i" x="4" :y="yl.y - 2" font-size="9" fill="rgba(42,37,32,0.4)">{{ yl.label }}</text>
            <path :d="trendComputed.areaD" fill="url(#trendGrad)"/>
            <path :d="trendComputed.pathD" fill="none" stroke="#D97757" stroke-width="2.2" stroke-linecap="round" stroke-linejoin="round"/>
            <circle
              v-for="(p, i) in trendComputed.keyPoints" :key="'p'+i"
              :cx="p.x" :cy="p.y"
              :r="i === trendComputed.keyPoints.length - 1 ? 4 : 3.5"
              fill="#D97757" stroke="#FFFCF5"
              :stroke-width="i === trendComputed.keyPoints.length - 1 ? 2 : 1.5"
            />
            <text
              v-for="(xl, i) in trendComputed.xLabels" :key="'x'+i"
              :x="xl.x" y="158" font-size="9" fill="rgba(42,37,32,0.4)" text-anchor="middle"
            >{{ xl.label }}</text>
          </template>
          <template v-else>
            <text x="300" y="85" font-size="11" fill="rgba(42,37,32,0.3)" text-anchor="middle">暂无趋势数据</text>
          </template>
        </svg>
      </div>

      <!-- Ranking -->
      <div class="adm-card" style="padding:22px;">
        <div style="font-size:14px;font-weight:600;color:var(--ink);margin-bottom:18px;">课程排行 · TOP5</div>
        <div class="rank-list">
          <div v-for="(item, i) in rankItems" :key="i" class="rank-item">
            <div class="rank-index" :style="{ background: item.color + '22', color: item.color }">{{ i + 1 }}</div>
            <div class="rank-info">
              <div class="rank-name">{{ item.name }}</div>
              <div class="rank-bar-wrap">
                <div class="rank-bar" :style="{ width: Math.max(4, (item.count / maxRankCount * 100)) + '%', background: item.color }"></div>
              </div>
            </div>
            <div class="rank-count" :style="{ color: item.color }">{{ item.count }}</div>
          </div>
        </div>
      </div>
    </div>

    <!-- Pending + Quick Actions -->
    <div class="two-col-15" style="margin-bottom:12px;">
      <!-- Pending bookings table -->
      <div class="adm-card">
        <div style="padding:16px 20px 12px;display:flex;align-items:center;gap:10px;border-bottom:0.5px solid var(--line);">
          <div style="font-size:14px;font-weight:600;color:var(--ink);">待审核预约</div>
          <span class="st-pill st-pending">{{ stats.pendingCount ?? 0 }} 待处理</span>
          <div style="flex:1"></div>
          <button class="adm-btn sm ghost" style="color:var(--ink-3);" @click="$router.push('/orders')">查看全部 →</button>
        </div>
        <table class="adm-table">
          <thead>
            <tr>
              <th>学员</th>
              <th>课程 / 班型</th>
              <th>预约时段</th>
              <th>提交时间</th>
              <th>操作</th>
            </tr>
          </thead>
          <tbody>
            <tr v-for="item in pendingOrders" :key="item.id">
              <td>
                <div style="display:flex;align-items:center;gap:8px;">
                  <div class="av-sm" :style="{ background: item.color }">{{ item.name[0] }}</div>
                  <div>
                    <div style="font-size:13px;font-weight:500;">{{ item.name }}</div>
                    <div style="font-size:11px;color:var(--ink-3);">{{ item.age }}</div>
                  </div>
                </div>
              </td>
              <td>
                <div style="font-size:13px;font-weight:500;">{{ item.course }}</div>
                <div style="font-size:11px;color:var(--ink-3);">{{ item.type }}</div>
              </td>
              <td style="font-size:13px;white-space:nowrap;">{{ item.time }}</td>
              <td style="font-size:12px;color:var(--ink-3);">{{ item.submitted }}</td>
              <td>
                <div style="display:flex;gap:6px;">
                  <button class="adm-btn sm danger" @click="handleReject(item.id)">拒绝</button>
                  <button class="adm-btn sm success" @click="handleApprove(item.id)">通过</button>
                </div>
              </td>
            </tr>
          </tbody>
        </table>
      </div>

      <!-- Quick actions -->
      <div class="adm-card" style="padding:20px;">
        <div style="font-size:14px;font-weight:600;color:var(--ink);margin-bottom:16px;">快捷操作</div>
        <div style="display:flex;flex-direction:column;gap:10px;">
          <button class="adm-btn ghost" style="justify-content:flex-start;width:100%;" @click="$router.push('/orders')">
            <svg viewBox="0 0 24 24" width="14" height="14" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linecap="round"><path d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2"/></svg>
            待审核预约 ({{ stats.pendingCount }})
          </button>
          <button class="adm-btn ghost" style="justify-content:flex-start;width:100%;" @click="$router.push('/courses')">
            <svg viewBox="0 0 24 24" width="14" height="14" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linecap="round"><path d="M12 6.253v13m0-13C10.832 5.477 9.246 5 7.5 5S4.168 5.477 3 6.253v13C4.168 18.477 5.754 18 7.5 18s3.332.477 4.5 1.253m0-13C13.168 5.477 14.754 5 16.5 5c1.747 0 3.332.477 4.5 1.253v13C19.832 18.477 18.247 18 16.5 18c-1.746 0-3.332.477-4.5 1.253"/></svg>
            管理课程 ({{ stats.totalCourses }}门)
          </button>
          <button class="adm-btn ghost" style="justify-content:flex-start;width:100%;" @click="$router.push('/push')">
            <svg viewBox="0 0 24 24" width="14" height="14" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linecap="round"><path d="M22 2L11 13M22 2L15 22l-4-9-9-4 19-7z"/></svg>
            发送消息推送
          </button>
          <button class="adm-btn ghost" style="justify-content:flex-start;width:100%;" @click="$router.push('/settings')">
            <svg viewBox="0 0 24 24" width="14" height="14" fill="none" stroke="currentColor" stroke-width="1.8"><circle cx="12" cy="12" r="3"/><path d="M19.4 15a1.65 1.65 0 00.33 1.82l.06.06a2 2 0 010 2.83 2 2 0 01-2.83 0l-.06-.06a1.65 1.65 0 00-1.82-.33 1.65 1.65 0 00-1 1.51V21a2 2 0 01-4 0v-.09A1.65 1.65 0 009 19.4a1.65 1.65 0 00-1.82.33l-.06.06a2 2 0 01-2.83-2.83l.06-.06A1.65 1.65 0 004.68 15a1.65 1.65 0 00-1.51-1H3a2 2 0 010-4h.09A1.65 1.65 0 004.6 9a1.65 1.65 0 00-.33-1.82l-.06-.06a2 2 0 012.83-2.83l.06.06A1.65 1.65 0 009 4.68a1.65 1.65 0 001-1.51V3a2 2 0 014 0v.09a1.65 1.65 0 001 1.51 1.65 1.65 0 001.82-.33l.06-.06a2 2 0 012.83 2.83l-.06.06A1.65 1.65 0 0019.4 9a1.65 1.65 0 001.51 1H21a2 2 0 010 4h-.09a1.65 1.65 0 00-1.51 1z"/></svg>
            系统设置
          </button>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref, computed, onMounted } from 'vue'
import { useRouter } from 'vue-router'
import { getDashboard, getOrders, auditOrder } from '@/api/index.js'
import { useAdminStore } from '@/stores/admin.js'

const router = useRouter()
const adminStore = useAdminStore()

const period = ref('month')

const today = computed(() => {
  const d = new Date()
  return `${d.getMonth()+1}月${d.getDate()}日 星期${'日一二三四五六'[d.getDay()]}`
})

const periodLabel = computed(() => period.value === 'week' ? '本周' : '本月')

const greeting = computed(() => {
  const h = new Date().getHours()
  if (h < 6) return '夜深了'
  if (h < 9) return '早上好'
  if (h < 12) return '上午好'
  if (h < 14) return '中午好'
  if (h < 18) return '下午好'
  return '晚上好'
})

const stats = ref({ todayOrders: 0, periodOrders: 0, pendingCount: 0, totalStudents: 0, totalCourses: 0, warningCount: 0, trend: [] })
const loading = ref(false)
const pendingOrders = ref([])

function switchPeriod(p) {
  period.value = p
  loadDashboard()
}

const trendTotal = computed(() => {
  return (stats.value.trend || []).reduce((s, d) => s + Number(d.count), 0)
})

const trendDelta = computed(() => {
  const data = stats.value.trend || []
  if (data.length < 8) return 0
  const mid = Math.floor(data.length / 2)
  const prev = data.slice(0, mid).reduce((s, d) => s + Number(d.count), 0)
  const curr = data.slice(mid).reduce((s, d) => s + Number(d.count), 0)
  if (prev === 0) return curr > 0 ? 100 : 0
  return Math.round((curr - prev) / prev * 100)
})

const trendComputed = computed(() => {
  const data = stats.value.trend
  if (!data || data.length < 2) return null

  const LEFT = 20, RIGHT = 580, BOTTOM = 148, H = 140
  const counts = data.map(d => Number(d.count))
  const maxCount = Math.max(...counts, 1)
  const niceMax = Math.ceil(maxCount / 4) * 4 || 4

  const toX = (i) => +(LEFT + (i / (data.length - 1)) * (RIGHT - LEFT)).toFixed(1)
  const toY = (v) => +(BOTTOM - (v / niceMax) * H).toFixed(1)

  const pts = data.map((d, i) => ({ x: toX(i), y: toY(Number(d.count)), date: d.date }))

  let pathD = `M${pts[0].x},${pts[0].y}`
  for (let i = 1; i < pts.length; i++) {
    const cpx = +((pts[i - 1].x + pts[i].x) / 2).toFixed(1)
    pathD += ` C${cpx},${pts[i - 1].y} ${cpx},${pts[i].y} ${pts[i].x},${pts[i].y}`
  }
  const areaD = `${pathD} L${RIGHT},155 L${LEFT},155 Z`

  const step = Math.max(1, Math.floor((pts.length - 1) / 4))
  const keyIdxs = new Set()
  for (let i = 0; i < pts.length; i += step) keyIdxs.add(i)
  keyIdxs.add(pts.length - 1)
  const keyPoints = [...keyIdxs].sort((a, b) => a - b).map(i => pts[i])

  const lStep = Math.max(1, Math.floor((pts.length - 1) / 4))
  const lIdxs = new Set([0, pts.length - 1])
  for (let i = lStep; i < pts.length - 1; i += lStep) lIdxs.add(i)
  const xLabels = [...lIdxs].sort((a, b) => a - b).map(i => {
    const parts = (pts[i].date || '').split('-')
    const label = parts.length >= 3 ? `${+parts[1]}/${+parts[2]}` : (i === pts.length - 1 ? '今日' : '')
    return { x: pts[i].x, label }
  })

  const gridYs = [32, 64, 96, 128]
  const yLabels = gridYs.map(y => ({
    y,
    label: String(Math.round(((BOTTOM - y) / H) * niceMax))
  }))

  return { pathD, areaD, keyPoints, xLabels, yLabels }
})

const colorPool = ['#D97757', '#6B7F5A', '#E8B860', '#A0473F', '#7A9CB0']

const maxRankCount = computed(() => {
  const m = Math.max(...rankItems.value.map(i => i.count), 1)
  return m
})

const rankItems = computed(() => {
  const items = [
    { name: '今日预约', count: stats.value.todayOrders || 0, color: '#D97757' },
    { name: '待审核预约', count: stats.value.pendingCount || 0, color: '#E8B860' },
    { name: '活跃学员', count: stats.value.totalStudents || 0, color: '#6B7F5A' },
    { name: '在售课程', count: stats.value.totalCourses || 0, color: '#A0473F' },
    { name: periodLabel.value + '预约', count: stats.value.periodOrders || 0, color: '#7A9CB0' },
  ]
  return items.sort((a, b) => b.count - a.count)
})

async function loadDashboard() {
  loading.value = true
  try {
    const data = await getDashboard({ params: { period: period.value } })
    stats.value = {
      todayOrders: data?.todayOrders ?? 0,
      periodOrders: data?.periodOrders ?? 0,
      pendingCount: data?.pendingCount ?? 0,
      totalStudents: data?.totalStudents ?? 0,
      totalCourses: data?.totalCourses ?? 0,
      warningCount: data?.warningCount ?? 0,
      trend: data?.trend || [],
    }
    // 同步到全局 store（供侧边栏和顶栏使用）
    adminStore.dashboardStats = {
      pendingCount: data?.pendingCount ?? 0,
      warningCount: data?.warningCount ?? 0,
    }
  } catch(e) {
    console.error('数据总览加载失败', e)
  } finally {
    loading.value = false
  }
}

async function loadPendingOrders() {
  try {
    const data = await getOrders({ status: 'pending', page: 1, pageSize: 10 })
    const list = data?.list || []
    pendingOrders.value = list.map((o, i) => ({
      id: o.id,
      name: o.student?.name || '学员',
      age: o.student?.age != null ? `${o.student.age}岁` : '',
      course: o.course?.title || '',
      type: o.courseType?.name || '',
      time: (() => {
        const s = o.schedule
        if (!s) return ''
        const [, mm, dd] = (s.date || '').split('-')
        const start = (s.start_time || '').slice(0, 5)
        return mm && dd ? `${mm}/${dd} ${start}` : start
      })(),
      submitted: o.created_at ? o.created_at.slice(0, 10) : '',
      color: colorPool[i % colorPool.length],
    }))
  } catch(e) {
    console.error('待审核订单加载失败', e)
  }
}

async function handleApprove(orderId) {
  try {
    await auditOrder(orderId, { action: 'approve' })
    await loadPendingOrders()
    await loadDashboard()
  } catch(e) {
    alert(e?.message || '操作失败')
  }
}

async function handleReject(orderId) {
  const remark = prompt('请输入拒绝原因（可为空）')
  if (remark === null) return
  try {
    await auditOrder(orderId, { action: 'reject', remark })
    await loadPendingOrders()
    await loadDashboard()
  } catch(e) {
    alert(e?.message || '操作失败')
  }
}

onMounted(() => {
  loadDashboard()
  loadPendingOrders()
})
</script>

<style scoped>
.stat-label { font-size: 12px; color: var(--ink-3); font-weight: 500; }
.stat-delta { font-size: 12px; color: var(--ink-3); margin-top: 4px; }
.stat-delta.positive { color: var(--moss); }
.stat-spark {
  position: absolute;
  bottom: 0; right: 0;
  width: 100px; height: 52px;
  opacity: 0.7;
}

.stat-card {
  position: relative;
  overflow: hidden;
}

.stat-card .stat-num {
  font-family: "Fraunces", serif;
  font-size: 32px;
  font-weight: 800;
  margin: 10px 0 4px;
}

.two-col-17 {
  display: grid;
  grid-template-columns: 1.7fr 1fr;
  gap: 16px;
}

.two-col-15 {
  display: grid;
  grid-template-columns: 1.5fr 1fr;
  gap: 16px;
}

.trend-chart {
  width: 100%;
  height: 160px;
  margin-top: 12px;
  display: block;
}

.rank-list { display: flex; flex-direction: column; gap: 14px; }

.rank-item {
  display: flex;
  align-items: center;
  gap: 10px;
}

.rank-index {
  width: 22px;
  height: 22px;
  border-radius: 7px;
  display: flex;
  align-items: center;
  justify-content: center;
  font-size: 11px;
  font-weight: 700;
  flex-shrink: 0;
}

.rank-info { flex: 1; }

.rank-name {
  font-size: 12px;
  color: var(--ink);
  font-weight: 500;
  margin-bottom: 5px;
  white-space: nowrap;
  overflow: hidden;
  text-overflow: ellipsis;
}

.rank-bar-wrap {
  height: 4px;
  background: rgba(42,37,32,0.07);
  border-radius: 2px;
  overflow: hidden;
}

.rank-bar {
  height: 100%;
  border-radius: 2px;
  transition: width 0.6s ease;
}

.rank-count {
  font-family: "Fraunces", serif;
  font-size: 15px;
  font-weight: 600;
  width: 28px;
  text-align: right;
  flex-shrink: 0;
}

.av-sm {
  width: 28px;
  height: 28px;
  border-radius: 50%;
  display: flex;
  align-items: center;
  justify-content: center;
  font-size: 11px;
  font-weight: 700;
  color: #FFFCF5;
  flex-shrink: 0;
}

.schedule-list { display: flex; flex-direction: column; gap: 0; }

.schedule-item {
  display: flex;
  align-items: center;
  gap: 12px;
  padding: 12px 0;
  border-bottom: 0.5px solid var(--line-2);
  position: relative;
}

.schedule-item:last-child { border-bottom: none; }

.sch-time {
  font-family: monospace;
  font-size: 13px;
  font-weight: 600;
  color: var(--ink-2);
  width: 42px;
  flex-shrink: 0;
}

.sch-line {
  width: 3px;
  height: 32px;
  border-radius: 2px;
  flex-shrink: 0;
}

.sch-info { flex: 1; }

.sch-name {
  font-size: 13px;
  font-weight: 500;
  color: var(--ink);
}

.sch-seats {
  font-size: 11px;
  margin-top: 2px;
}

.sch-dot {
  width: 8px;
  height: 8px;
  border-radius: 50%;
  flex-shrink: 0;
}
</style>
