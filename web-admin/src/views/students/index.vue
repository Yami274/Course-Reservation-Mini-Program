<template>
  <div>
    <div class="page-header">
      <div>
        <div class="page-title">学员管理</div>
        <div style="font-size:13px;color:var(--ink-3);margin-top:2px;">共 {{ total }} 位学员</div>
      </div>
      <div style="flex:1"></div>
    </div>

    <div style="display:flex;align-items:center;gap:10px;margin-bottom:14px;flex-wrap:wrap;">
      <div class="adm-search" style="width:240px;">
        <svg viewBox="0 0 20 20" width="14" height="14" fill="none" stroke="currentColor" stroke-width="1.7">
          <circle cx="9" cy="9" r="5.5"/><path d="M14 14l3.5 3.5" stroke-linecap="round"/>
        </svg>
        <input type="text" v-model="keyword" placeholder="学员姓名 / 联系方式" @input="onSearch" />
      </div>
    </div>

    <div class="adm-card">
      <div v-if="loading" style="text-align:center;padding:60px;color:#8A7E70;">加载中…</div>
      <table v-else class="adm-table">
        <thead>
          <tr>
            <th style="width:36px;"><input type="checkbox" class="adm-checkbox"/></th>
            <th>学员</th>
            <th>家长 / 监护人</th>
            <th>联系电话</th>
            <th>注册时间</th>
            <th>已上课时</th>
            <th>最近上课</th>
            <th>备注</th>
          </tr>
        </thead>
        <tbody>
          <tr v-for="s in students" :key="s.id">
            <td><input type="checkbox" class="adm-checkbox"/></td>
            <td>
              <div style="display:flex;align-items:center;gap:8px;">
                <div class="av-sm" :style="{ background: s.color }">{{ s.name[0] }}</div>
                <div>
                  <div style="font-size:13px;font-weight:500;">{{ s.name }}</div>
                  <div style="font-size:11px;color:var(--ink-3);" v-if="s.age">{{ s.age }}岁</div>
                </div>
              </div>
            </td>
            <td style="font-size:13px;color:var(--ink-2);">{{ s.guardian }}</td>
            <td style="font-size:12px;font-family:monospace;color:var(--ink-3);">{{ s.phone }}</td>
            <td style="font-size:12px;color:var(--ink-3);">{{ s.registered }}</td>
            <td>
              <span style="font-family:'Fraunces',serif;font-size:15px;font-weight:600;color:var(--ink);">{{ s.lessons }}</span>
              <span style="font-size:11px;color:var(--ink-3);margin-left:2px;">节</span>
            </td>
            <td style="font-size:12px;color:var(--ink-3);">{{ s.lastClass }}</td>
            <td style="font-size:12px;color:var(--ink-3);max-width:120px;overflow:hidden;text-overflow:ellipsis;white-space:nowrap;">{{ s.notes || '—' }}</td>
          </tr>
          <tr v-if="!loading && students.length === 0">
            <td colspan="8" style="text-align:center;padding:60px;color:var(--ink-3);">暂无学员数据</td>
          </tr>
        </tbody>
      </table>

      <div class="adm-pagination" v-if="total > pageSize">
        <button :disabled="page <= 1" @click="page--; loadStudents()">←</button>
        <button class="active">{{ page }}</button>
        <button :disabled="page * pageSize >= total" @click="page++; loadStudents()">→</button>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref, onMounted } from 'vue'
import { getStudents } from '@/api/index.js'

const students = ref([])
const loading = ref(false)
const total = ref(0)
const page = ref(1)
const pageSize = 20
const keyword = ref('')

const colorPool = ['#D97757', '#6B7F5A', '#E8B860', '#A0473F', '#7A9CB0', '#8A7E70']

let searchTimer = null
function onSearch() {
  clearTimeout(searchTimer)
  searchTimer = setTimeout(() => {
    page.value = 1
    loadStudents()
  }, 300)
}

async function loadStudents() {
  loading.value = true
  try {
    const params = { page: page.value, pageSize }
    if (keyword.value) params.keyword = keyword.value
    const data = await getStudents(params)
    const list = data?.list || []
    total.value = data?.total || 0
    students.value = list.map((s, i) => ({
      id: s.id,
      name: s.name || '',
      age: s.age || 0,
      guardian: s.user?.nickname || '—',
      phone: s.phone || s.user?.phone || '—',
      registered: s.created_at ? s.created_at.slice(0, 10) : '',
      lessons: s.orderCount || 0,
      lastClass: s.lastClass || '—',
      notes: s.notes || '',
      color: colorPool[i % colorPool.length],
    }))
  } catch(e) {
    console.error('学员数据加载失败', e)
  } finally {
    loading.value = false
  }
}

onMounted(loadStudents)
</script>
