<template>
  <div>
    <div class="page-header">
      <div>
        <div class="page-title">讲师管理</div>
        <div style="font-size:13px;color:var(--ink-3);margin-top:2px;">共 {{ teachers.length }} 位讲师</div>
      </div>
      <div style="flex:1"></div>
      <button class="adm-btn primary" @click="openAdd">
        <svg viewBox="0 0 24 24" width="14" height="14" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round"><path d="M12 5v14M5 12h14"/></svg>
        新增讲师
      </button>
    </div>

    <div v-if="loading" style="text-align:center;padding:60px;color:var(--ink-3);">加载中…</div>

    <div v-else class="grid-2">
      <div v-for="t in teachers" :key="t.id" class="adm-card teacher-card">
        <div class="tc-actions">
          <button class="adm-btn sm ghost" @click="openEdit(t)">
            <svg viewBox="0 0 24 24" width="12" height="12" fill="none" stroke="currentColor" stroke-width="1.6" stroke-linejoin="round"><path d="M4 20h4l10-10-4-4L4 16v4z"/></svg>
            编辑
          </button>
          <button class="adm-btn sm ghost danger" @click="handleDelete(t.id, t.name)">删除</button>
        </div>

        <div class="tc-identity">
          <div class="tc-avatar" :style="{ background: t.bg }">
            <span>{{ t.name[0] }}</span>
          </div>
          <div class="tc-info">
            <div class="tc-name">{{ t.name }}</div>
            <div class="tc-role">{{ t.role }}</div>
          </div>
        </div>

        <div v-if="t.intro" style="font-size:12px;color:var(--ink-3);line-height:1.6;margin-top:8px;padding-top:12px;border-top:0.5px solid var(--line);">{{ stripHtml(t.intro) }}</div>
      </div>

      <div v-if="!loading && teachers.length === 0" style="grid-column:1/-1;text-align:center;padding:60px;color:var(--ink-3);">
        暂无讲师，点击「新增讲师」开始
      </div>
    </div>

    <!-- Add/Edit Modal -->
    <div v-if="modal.show" class="modal-mask" @click.self="closeModal">
      <div class="modal-box">
        <div class="modal-head">
          <div class="modal-title">{{ modal.isEdit ? '编辑讲师' : '新增讲师' }}</div>
          <button class="modal-close" @click="closeModal">
            <svg viewBox="0 0 24 24" width="16" height="16" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round"><path d="M18 6L6 18M6 6l12 12"/></svg>
          </button>
        </div>
        <div class="modal-body">
          <div class="field-row">
            <div class="field-label">姓名 <span class="req">*</span></div>
            <input class="adm-input" v-model="modal.form.name" placeholder="讲师姓名" style="width:100%;" />
          </div>
          <div class="field-row">
            <div class="field-label">头衔/职称</div>
            <input class="adm-input" v-model="modal.form.title" placeholder="如：资深编程讲师 / 5年教学经验" style="width:100%;" />
          </div>
          <div class="field-row">
            <div class="field-label">头像图片</div>
            <div style="display:flex;gap:8px;align-items:center;">
              <input class="adm-input" v-model="modal.form.avatar" placeholder="粘贴图片URL或上传文件" style="flex:1;" />
              <label class="adm-btn sm ghost" style="cursor:pointer;white-space:nowrap;flex-shrink:0;">
                本地上传
                <input type="file" accept="image/*" style="display:none;" @change="handleAvatarUpload" />
              </label>
            </div>
            <img v-if="modal.form.avatar" :src="modal.form.avatar" style="width:80px;height:80px;object-fit:cover;border-radius:50%;margin-top:8px;" />
          </div>
          <div class="field-row">
            <div class="field-label">简介</div>
            <textarea class="adm-textarea" v-model="modal.form.intro" placeholder="讲师背景、擅长领域…" rows="3"></textarea>
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
  </div>
</template>

<script setup>
import { ref, onMounted } from 'vue'
import { getTeachers, createTeacher, updateTeacher, deleteTeacher, uploadFile } from '@/api/index.js'
import { stripHtml } from '@/utils/format.js'

const teachers = ref([])
const loading = ref(false)
const saving = ref(false)

const bgPool = [
  { bg: 'linear-gradient(135deg, #E5BEB9, #A0473F)', color: '#A0473F' },
  { bg: 'linear-gradient(135deg, #C7D1B6, #6B7F5A)', color: '#6B7F5A' },
  { bg: 'linear-gradient(135deg, #F4DFB1, #E8B860)', color: '#B8893A' },
  { bg: 'linear-gradient(135deg, #BDD0DC, #7A9CB0)', color: '#7A9CB0' },
]

const modal = ref({
  show: false,
  isEdit: false,
  editId: null,
  form: { name: '', title: '', avatar: '', intro: '' },
})

function openAdd() {
  modal.value = {
    show: true, isEdit: false, editId: null,
    form: { name: '', title: '', avatar: '', intro: '' },
  }
}

function openEdit(t) {
  modal.value = {
    show: true, isEdit: true, editId: t.id,
    form: { name: t.name, title: t.role !== '讲师' ? t.role : '', avatar: t.avatar || '', intro: t.intro || '' },
  }
}

function closeModal() { modal.value.show = false }

async function handleSave() {
  if (!modal.value.form.name.trim()) { alert('请输入讲师姓名'); return }
  saving.value = true
  try {
    const payload = { ...modal.value.form, name: modal.value.form.name.trim() }
    if (modal.value.isEdit) {
      await updateTeacher(modal.value.editId, payload)
    } else {
      await createTeacher(payload)
    }
    await loadTeachers()
    closeModal()
  } catch(e) {
    alert(e?.message || '保存失败')
  } finally {
    saving.value = false
  }
}

async function handleAvatarUpload(e) {
  const file = e.target.files?.[0]
  if (!file) return
  try {
    const result = await uploadFile(file)
    modal.value.form.avatar = result.url || result
  } catch(err) {
    alert('头像上传失败: ' + (err?.message || '未知错误'))
  }
}

async function handleDelete(id, name) {
  if (!confirm(`确定删除讲师「${name}」？`)) return
  try {
    await deleteTeacher(id)
    await loadTeachers()
  } catch(e) {
    alert(e?.message || '删除失败')
  }
}

async function loadTeachers() {
  loading.value = true
  try {
    const data = await getTeachers()
    const list = Array.isArray(data) ? data : (data?.list || [])
    teachers.value = list.map((t, i) => {
      const palette = bgPool[i % bgPool.length]
      return {
        id: t.id,
        name: t.name || '',
        role: t.title || '讲师',
        intro: t.intro || '',
        avatar: t.avatar || '',
        bg: palette.bg,
      }
    })
  } catch(e) {
    console.error('讲师加载失败', e)
  } finally {
    loading.value = false
  }
}

onMounted(loadTeachers)
</script>

<style scoped>
.teacher-card { padding: 22px; position: relative; }
.tc-actions { position: absolute; top: 16px; right: 16px; display: flex; gap: 6px; }
.tc-identity { display: flex; align-items: center; gap: 16px; }
.tc-avatar {
  width: 76px; height: 76px; border-radius: 50%;
  display: flex; align-items: center; justify-content: center; flex-shrink: 0;
  box-shadow: 0 4px 16px rgba(0,0,0,0.12);
}
.tc-avatar span { font-family: "Fraunces", serif; font-size: 32px; font-weight: 700; color: rgba(255,255,255,0.92); }
.tc-name { font-family: "Fraunces", serif; font-size: 20px; font-weight: 700; color: var(--ink); }
.tc-role { font-size: 12px; color: var(--ink-3); margin-top: 3px; }

.modal-mask {
  position: fixed; inset: 0;
  background: rgba(42,37,32,0.32); backdrop-filter: blur(2px);
  display: flex; align-items: center; justify-content: center; z-index: 1000;
}
.modal-box {
  background: var(--card); border-radius: 18px;
  width: 480px; max-width: 92vw;
  box-shadow: 0 16px 48px rgba(42,37,32,0.22); overflow: hidden;
}
.modal-head { display: flex; align-items: center; padding: 18px 22px 14px; border-bottom: 0.5px solid var(--line); }
.modal-title { font-size: 15px; font-weight: 700; color: var(--ink); flex: 1; }
.modal-close {
  width: 28px; height: 28px; border-radius: 8px;
  border: none; background: none; cursor: pointer;
  display: flex; align-items: center; justify-content: center; color: var(--ink-3);
}
.modal-close:hover { background: rgba(42,37,32,0.07); color: var(--ink); }
.modal-body { padding: 18px 22px; display: flex; flex-direction: column; gap: 14px; }
.modal-foot { display: flex; justify-content: flex-end; gap: 8px; padding: 14px 22px 18px; border-top: 0.5px solid var(--line); }
.field-row { display: flex; flex-direction: column; gap: 6px; }
.field-label { font-size: 12px; font-weight: 600; color: var(--ink-2); }
.req { color: var(--berry); }
.adm-textarea {
  width: 100%; padding: 8px 12px; background: var(--card);
  border: 0.5px solid var(--line); border-radius: 9px;
  font-size: 13px; color: var(--ink); font-family: inherit;
  outline: none; resize: vertical; line-height: 1.6; box-sizing: border-box;
}
.adm-textarea:focus { border-color: var(--primary); }
</style>
