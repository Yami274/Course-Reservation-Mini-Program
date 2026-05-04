<template>
  <div>
    <div class="page-header">
      <div>
        <div class="page-title">公告管理</div>
        <div style="font-size:13px;color:var(--ink-3);margin-top:2px;">小程序首页滚动公告条</div>
      </div>
      <div style="flex:1"></div>
      <button class="adm-btn primary" @click="openAdd">
        <svg viewBox="0 0 24 24" width="14" height="14" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round"><path d="M12 5v14M5 12h14"/></svg>
        新增公告
      </button>
    </div>

    <!-- Preview strip -->
    <div class="notice-preview">
      <div class="preview-label">
        <svg viewBox="0 0 24 24" width="13" height="13" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
          <path d="M15 17h5l-1.405-1.405A2.032 2.032 0 0118 14.158V11a6 6 0 00-5-5.917V4a1 1 0 00-2 0v1.083A6 6 0 006 11v3.159c0 .538-.214 1.055-.595 1.436L4 17h5m6 0v1a3 3 0 01-6 0v-1m6 0H9"/>
        </svg>
        小程序预览
      </div>
      <div class="marquee-wrap">
        <div class="marquee-track" :style="{ '--notice-count': activeNotices.length }">
          <span v-for="(n, i) in activeNotices" :key="i" class="notice-item">
            📢 {{ n.content }}
          </span>
          <span v-if="!activeNotices.length" style="color:var(--ink-3);">暂无启用的公告</span>
        </div>
      </div>
    </div>

    <!-- Notice cards -->
    <div v-if="loading" style="text-align:center;padding:60px;color:var(--ink-3);">加载中…</div>
    <div v-else class="notice-grid">
      <div v-for="notice in notices" :key="notice.id" class="notice-card adm-card">
        <div class="nc-head">
          <div class="nc-status" :class="notice.is_active ? 'active' : 'inactive'">
            <span class="nc-dot"></span>
            {{ notice.is_active ? '启用中' : '已停用' }}
          </div>
          <div style="flex:1"></div>
          <div style="font-size:11px;color:var(--ink-3);">排序 {{ notice.sort || 0 }}</div>
        </div>
        <div class="nc-content">{{ notice.content }}</div>
        <div class="nc-meta">
          <span v-if="notice.start_date || notice.end_date">
            {{ notice.start_date || '——' }} 至 {{ notice.end_date || '长期' }}
          </span>
          <span v-else style="color:var(--ink-3);">无有效期限制</span>
        </div>
        <div class="nc-actions">
          <button class="adm-btn sm ghost" @click="toggleActive(notice)">
            {{ notice.is_active ? '停用' : '启用' }}
          </button>
          <button class="adm-btn sm ghost" @click="openEdit(notice)">编辑</button>
          <button class="adm-btn sm danger" @click="confirmDelete(notice)">删除</button>
        </div>
      </div>

      <div v-if="!loading && notices.length === 0" style="grid-column:1/-1;text-align:center;padding:60px;color:var(--ink-3);">
        暂无公告，点击「新增公告」创建
      </div>
    </div>

    <!-- Add/Edit modal -->
    <div v-if="modal.show" class="modal-mask" @click.self="closeModal">
      <div class="modal-box">
        <div class="modal-head">
          <div class="modal-title">{{ modal.isEdit ? '编辑公告' : '新增公告' }}</div>
          <button class="modal-close" @click="closeModal">
            <svg viewBox="0 0 24 24" width="16" height="16" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round"><path d="M18 6L6 18M6 6l12 12"/></svg>
          </button>
        </div>
        <div class="modal-body">
          <div class="field-row">
            <div class="field-label">公告内容 <span class="req">*</span></div>
            <textarea
              class="adm-textarea"
              v-model="modal.form.content"
              placeholder="请输入公告文字内容，建议不超过50字"
              rows="3"
            ></textarea>
            <div style="font-size:11px;color:var(--ink-3);text-align:right;">{{ modal.form.content?.length || 0 }} / 100</div>
          </div>
          <div class="field-row">
            <div class="field-label">有效期（可留空表示长期有效）</div>
            <div style="display:flex;align-items:center;gap:10px;">
              <input class="adm-input" type="date" v-model="modal.form.start_date" style="flex:1;" />
              <span style="color:var(--ink-3);font-size:13px;">至</span>
              <input class="adm-input" type="date" v-model="modal.form.end_date" style="flex:1;" />
            </div>
          </div>
          <div class="field-row">
            <div class="field-label">排序</div>
            <input class="adm-input" type="number" v-model.number="modal.form.sort" min="0" placeholder="0" style="width:100px;" />
            <span style="font-size:12px;color:var(--ink-3);margin-left:8px;">数值越小越靠前</span>
          </div>
          <div class="field-row">
            <div class="field-label">状态</div>
            <label class="toggle-wrap">
              <input type="checkbox" v-model="modal.form.is_active" style="display:none;" />
              <div class="toggle" :class="{ on: modal.form.is_active }" @click="modal.form.is_active = !modal.form.is_active">
                <div class="toggle-knob"></div>
              </div>
              <span style="font-size:13px;color:var(--ink-2);">{{ modal.form.is_active ? '启用' : '停用' }}</span>
            </label>
          </div>
        </div>
        <div class="modal-foot">
          <button class="adm-btn ghost" @click="closeModal">取消</button>
          <button class="adm-btn primary" :disabled="saving" @click="handleSave">
            {{ saving ? '保存中…' : '保存' }}
          </button>
        </div>
      </div>
    </div>

    <!-- Delete confirm -->
    <div v-if="deleteTarget" class="modal-mask" @click.self="deleteTarget = null">
      <div class="modal-box" style="max-width:360px;">
        <div class="modal-head">
          <div class="modal-title">确认删除公告</div>
          <button class="modal-close" @click="deleteTarget = null">
            <svg viewBox="0 0 24 24" width="16" height="16" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round"><path d="M18 6L6 18M6 6l12 12"/></svg>
          </button>
        </div>
        <div class="modal-body">
          <div style="color:var(--ink-2);font-size:14px;line-height:1.6;">
            确认删除该公告吗？此操作不可撤销。<br/>
            <span style="font-size:12px;color:var(--ink-3);">「{{ deleteTarget.content?.slice(0, 30) }}…」</span>
          </div>
        </div>
        <div class="modal-foot">
          <button class="adm-btn ghost" @click="deleteTarget = null">取消</button>
          <button class="adm-btn danger" style="background:var(--berry);color:#fff;border:none;" @click="doDelete">确认删除</button>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref, computed, onMounted } from 'vue'
import { getNotices, createNotice, updateNotice, deleteNotice } from '@/api/index.js'

const loading = ref(true)
const saving = ref(false)
const notices = ref([])
const deleteTarget = ref(null)

const activeNotices = computed(() => notices.value.filter(n => n.is_active))

const modal = ref({
  show: false,
  isEdit: false,
  editId: null,
  form: { content: '', start_date: '', end_date: '', sort: 0, is_active: true },
})

function openAdd() {
  modal.value = {
    show: true, isEdit: false, editId: null,
    form: { content: '', start_date: '', end_date: '', sort: 0, is_active: true },
  }
}

function openEdit(notice) {
  modal.value = {
    show: true, isEdit: true, editId: notice.id,
    form: {
      content: notice.content,
      start_date: notice.start_date || '',
      end_date: notice.end_date || '',
      sort: notice.sort || 0,
      is_active: !!notice.is_active,
    },
  }
}

function closeModal() { modal.value.show = false }

async function toggleActive(notice) {
  try {
    const newStatus = notice.is_active ? 'inactive' : 'active'
    await updateNotice(notice.id, { status: newStatus })
    await loadNotices()
  } catch(e) {
    alert(e?.message || '操作失败')
  }
}

function confirmDelete(notice) { deleteTarget.value = notice }

async function handleSave() {
  if (!modal.value.form.content.trim()) return
  saving.value = true
  try {
    const payload = {
      content: modal.value.form.content.trim(),
      start_date: modal.value.form.start_date || undefined,
      end_date: modal.value.form.end_date || undefined,
      sort: modal.value.form.sort,
      status: modal.value.form.is_active ? 'active' : 'inactive',
    }
    if (!payload.start_date) delete payload.start_date
    if (!payload.end_date) delete payload.end_date
    if (modal.value.isEdit) {
      await updateNotice(modal.value.editId, payload)
    } else {
      await createNotice(payload)
    }
    await loadNotices()
    closeModal()
  } catch(e) {
    alert(e?.message || '保存失败')
  } finally {
    saving.value = false
  }
}

async function doDelete() {
  if (!deleteTarget.value) return
  try {
    await deleteNotice(deleteTarget.value.id)
    await loadNotices()
    deleteTarget.value = null
  } catch(e) {
    alert(e?.message || '删除失败')
  }
}

async function loadNotices() {
  loading.value = true
  try {
    const data = await getNotices()
    const list = Array.isArray(data) ? data : (data?.list || [])
    notices.value = list.map(n => ({ ...n, is_active: n.status === 'active' }))
  } catch(e) {
    console.error('公告加载失败', e)
  } finally {
    loading.value = false
  }
}

onMounted(loadNotices)
</script>

<style scoped>
.notice-preview {
  background: var(--paper-2);
  border: 0.5px solid var(--line);
  border-radius: 14px;
  padding: 12px 18px;
  margin-bottom: 20px;
  display: flex;
  align-items: center;
  gap: 14px;
  overflow: hidden;
}

.preview-label {
  display: flex;
  align-items: center;
  gap: 5px;
  font-size: 12px;
  font-weight: 600;
  color: var(--ink-3);
  white-space: nowrap;
  flex-shrink: 0;
}

.marquee-wrap {
  flex: 1;
  overflow: hidden;
}

.marquee-track {
  display: flex;
  gap: 40px;
  animation: scroll-notice 20s linear infinite;
  white-space: nowrap;
  width: max-content;
}

.notice-item {
  font-size: 13px;
  color: var(--ink-2);
}

@keyframes scroll-notice {
  from { transform: translateX(0); }
  to { transform: translateX(-50%); }
}

.notice-grid {
  display: grid;
  grid-template-columns: repeat(auto-fill, minmax(320px, 1fr));
  gap: 14px;
}

.notice-card {
  padding: 18px;
  display: flex;
  flex-direction: column;
  gap: 12px;
}

.nc-head {
  display: flex;
  align-items: center;
  gap: 8px;
}

.nc-status {
  display: flex;
  align-items: center;
  gap: 6px;
  font-size: 12px;
  font-weight: 500;
  padding: 3px 9px;
  border-radius: 999px;
}

.nc-status.active {
  background: rgba(107, 127, 90, 0.15);
  color: var(--moss);
}

.nc-status.inactive {
  background: rgba(42, 37, 32, 0.08);
  color: var(--ink-3);
}

.nc-dot {
  width: 6px; height: 6px;
  border-radius: 50%;
  background: currentColor;
  flex-shrink: 0;
}

.nc-content {
  font-size: 14px;
  color: var(--ink);
  line-height: 1.6;
  flex: 1;
}

.nc-meta {
  font-size: 12px;
  color: var(--ink-3);
}

.nc-actions {
  display: flex;
  gap: 6px;
  padding-top: 4px;
  border-top: 0.5px solid var(--line-2);
}

.adm-textarea {
  width: 100%;
  padding: 10px 12px;
  background: var(--card);
  border: 0.5px solid var(--line);
  border-radius: 9px;
  font-size: 13px;
  color: var(--ink);
  font-family: inherit;
  outline: none;
  resize: vertical;
  line-height: 1.6;
  transition: border-color 0.15s;
}
.adm-textarea:focus { border-color: var(--primary); }

.toggle-wrap {
  display: flex;
  align-items: center;
  gap: 10px;
  cursor: pointer;
}

.toggle {
  width: 36px; height: 20px;
  background: rgba(42,37,32,0.15);
  border-radius: 10px;
  position: relative;
  transition: background 0.2s;
  cursor: pointer;
  flex-shrink: 0;
}

.toggle.on { background: var(--moss); }

.toggle-knob {
  position: absolute;
  width: 14px; height: 14px;
  background: #fff;
  border-radius: 50%;
  top: 3px; left: 3px;
  transition: left 0.2s;
  box-shadow: 0 1px 3px rgba(0,0,0,0.18);
}

.toggle.on .toggle-knob { left: 19px; }

/* Modal */
.modal-mask {
  position: fixed; inset: 0;
  background: rgba(42,37,32,0.32);
  backdrop-filter: blur(2px);
  display: flex; align-items: center; justify-content: center;
  z-index: 1000;
}
.modal-box {
  background: var(--card);
  border-radius: 18px;
  width: 480px; max-width: 92vw;
  box-shadow: 0 16px 48px rgba(42,37,32,0.22);
  overflow: hidden;
}
.modal-head {
  display: flex; align-items: center;
  padding: 18px 22px 14px;
  border-bottom: 0.5px solid var(--line);
}
.modal-title { font-size: 15px; font-weight: 700; color: var(--ink); flex: 1; }
.modal-close {
  width: 28px; height: 28px; border-radius: 8px;
  border: none; background: none; cursor: pointer;
  display: flex; align-items: center; justify-content: center;
  color: var(--ink-3);
}
.modal-close:hover { background: rgba(42,37,32,0.07); color: var(--ink); }
.modal-body { padding: 18px 22px; display: flex; flex-direction: column; gap: 14px; }
.modal-foot {
  display: flex; justify-content: flex-end; gap: 8px;
  padding: 14px 22px 18px;
  border-top: 0.5px solid var(--line);
}
.field-row { display: flex; flex-direction: column; gap: 6px; }
.field-label { font-size: 12px; font-weight: 600; color: var(--ink-2); letter-spacing: 0.03em; }
.req { color: var(--berry); }
</style>
