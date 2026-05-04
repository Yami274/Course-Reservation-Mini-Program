<template>
  <div>
    <div class="page-header">
      <div>
        <div class="page-title">运营配置 · 轮播图</div>
        <div style="font-size:13px;color:var(--ink-3);margin-top:2px;">共 {{ banners.length }} 张 · 拖拽排序以调整展示顺序</div>
      </div>
      <div style="flex:1"></div>
      <button class="adm-btn primary" @click="openAdd">
        <svg viewBox="0 0 24 24" width="14" height="14" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round"><path d="M12 5v14M5 12h14"/></svg>
        新增轮播图
      </button>
    </div>

    <div class="tip-card">
      <svg viewBox="0 0 24 24" width="16" height="16" fill="none" stroke="#8A6520" stroke-width="1.8" stroke-linecap="round" style="flex-shrink:0;margin-top:1px;">
        <circle cx="12" cy="12" r="10"/><path d="M12 8v4M12 16h.01"/>
      </svg>
      <span>建议尺寸 <strong>750×360</strong> · 图片大小 ≤200KB · 建议同时展示不超过 <strong>5张</strong></span>
    </div>

    <div v-if="loading" style="text-align:center;padding:60px;color:var(--ink-3);">加载中…</div>

    <div v-else class="grid-2">
      <div v-for="(banner, i) in banners" :key="banner.id" class="adm-card banner-card">
        <div class="banner-preview" :style="{ background: gradients[i % gradients.length] }">
          <img v-if="banner.image" :src="banner.image" class="banner-img" />
          <div v-if="banner.image" class="banner-img-overlay"></div>
          <div v-else class="banner-placeholder">暂无图片</div>
          <div class="banner-text-overlay">
            <div class="banner-preview-title" v-if="banner.title">{{ banner.title }}</div>
            <div class="banner-preview-sub" v-if="banner.subtitle">{{ banner.subtitle }}</div>
          </div>
          <span class="banner-status st-pill" :class="banner.status === 'active' ? 'st-published' : 'st-draft'">
            {{ banner.status === 'active' ? '启用' : '停用' }}
          </span>
          <div class="order-badge">{{ banner.sort }}</div>
        </div>

        <div class="banner-meta">
          <div class="banner-link" v-if="banner.link_url">
            <svg viewBox="0 0 24 24" width="12" height="12" fill="none" stroke="currentColor" stroke-width="1.7" stroke-linecap="round">
              <path d="M10 13a5 5 0 007.54.54l3-3a5 5 0 00-7.07-7.07l-1.72 1.71M14 11a5 5 0 00-7.54-.54l-3 3a5 5 0 007.07 7.07l1.71-1.71"/>
            </svg>
            <span>{{ banner.link_url }}</span>
          </div>
          <div v-else style="font-size:12px;color:var(--ink-3);">无跳转链接</div>
        </div>

        <div class="banner-actions">
          <button class="adm-btn sm ghost" @click="moveUp(i)" :disabled="i === 0">↑</button>
          <button class="adm-btn sm ghost" @click="moveDown(i)" :disabled="i === banners.length - 1">↓</button>
          <button class="adm-btn sm ghost" style="flex:1;justify-content:center;" @click="openEdit(banner)">编辑</button>
          <button class="adm-btn sm ghost danger" @click="confirmDelete(banner)">删除</button>
        </div>
      </div>

      <div v-if="!loading && banners.length === 0" style="grid-column:1/-1;text-align:center;padding:60px;color:var(--ink-3);">
        暂无轮播图，点击「新增轮播图」开始
      </div>
    </div>

    <!-- Add/Edit Modal -->
    <div v-if="modal.show" class="modal-mask" @click.self="closeModal">
      <div class="modal-box">
        <div class="modal-head">
          <div class="modal-title">{{ modal.isEdit ? '编辑轮播图' : '新增轮播图' }}</div>
          <button class="modal-close" @click="closeModal">
            <svg viewBox="0 0 24 24" width="16" height="16" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round"><path d="M18 6L6 18M6 6l12 12"/></svg>
          </button>
        </div>
        <div class="modal-body">
          <div class="field-row">
            <div class="field-label">轮播图片 <span class="req">*</span></div>
            <div style="display:flex;gap:8px;align-items:center;">
              <input class="adm-input" v-model="modal.form.image" placeholder="粘贴图片URL或上传文件" style="flex:1;" />
              <label class="adm-btn sm ghost" style="cursor:pointer;white-space:nowrap;flex-shrink:0;">
                本地上传
                <input type="file" accept="image/*" style="display:none;" @change="handleImageUpload" />
              </label>
            </div>
            <img v-if="modal.form.image" :src="modal.form.image" style="width:120px;height:68px;object-fit:cover;border-radius:8px;margin-top:8px;" />
          </div>
          <div class="field-row">
            <div class="field-label">轮播标题</div>
            <input class="adm-input" v-model="modal.form.title" placeholder="如：春日色彩\n绘画工坊" style="width:100%;" />
          </div>
          <div class="field-row">
            <div class="field-label">轮播副标题</div>
            <input class="adm-input" v-model="modal.form.subtitle" placeholder="如：4-12岁 · 周末班招募中" style="width:100%;" />
          </div>
          <div class="field-row">
            <div class="field-label">跳转链接</div>
            <input class="adm-input" v-model="modal.form.link_url" placeholder="/pages/course/detail?id=1" style="width:100%;" />
          </div>
          <div class="field-row">
            <div class="field-label">排序值</div>
            <input class="adm-input" v-model.number="modal.form.sort" type="number" min="0" placeholder="0" style="width:100px;" />
            <span style="font-size:12px;color:var(--ink-3);margin-left:8px;">数值越小排越前</span>
          </div>
          <div class="field-row">
            <div class="field-label">状态</div>
            <label class="toggle-wrap">
              <div class="toggle" :class="{ on: modal.form.status === 'active' }" @click="modal.form.status = modal.form.status === 'active' ? 'inactive' : 'active'">
                <div class="toggle-knob"></div>
              </div>
              <span style="font-size:13px;color:var(--ink-2);">{{ modal.form.status === 'active' ? '启用' : '停用' }}</span>
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
          <div class="modal-title">确认删除轮播图</div>
          <button class="modal-close" @click="deleteTarget = null">
            <svg viewBox="0 0 24 24" width="16" height="16" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round"><path d="M18 6L6 18M6 6l12 12"/></svg>
          </button>
        </div>
        <div class="modal-body">
          <div style="color:var(--ink-2);font-size:14px;">确认删除此轮播图吗？此操作不可撤销。</div>
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
import { ref, onMounted } from 'vue'
import { getBanners, createBanner, updateBanner, deleteBanner, uploadFile } from '@/api/index.js'

const loading = ref(true)
const saving = ref(false)
const banners = ref([])
const deleteTarget = ref(null)

const gradients = [
  'linear-gradient(135deg, #F4D9B8, #D97757)',
  'linear-gradient(135deg, #C7D1B6, #6B7F5A)',
  'linear-gradient(135deg, #F4DFB1, #B8893A)',
  'linear-gradient(135deg, #E5BEB9, #A0473F)',
  'linear-gradient(135deg, #BDD0DC, #7A9CB0)',
]

const modal = ref({
  show: false,
  isEdit: false,
  editId: null,
  form: { image: '', title: '', subtitle: '', link_url: '', sort: 0, status: 'active' },
})

function openAdd() {
  modal.value = {
    show: true, isEdit: false, editId: null,
    form: { image: '', title: '', subtitle: '', link_url: '', sort: banners.value.length, status: 'active' },
  }
}

function openEdit(b) {
  modal.value = {
    show: true, isEdit: true, editId: b.id,
    form: { image: b.image || '', title: b.title || '', subtitle: b.subtitle || '', link_url: b.link_url || '', sort: b.sort || 0, status: b.status || 'active' },
  }
}

function closeModal() { modal.value.show = false }
function confirmDelete(b) { deleteTarget.value = b }

async function handleSave() {
  if (!modal.value.form.image) return
  saving.value = true
  try {
    const payload = { ...modal.value.form }
    if (modal.value.isEdit) {
      await updateBanner(modal.value.editId, payload)
    } else {
      await createBanner(payload)
    }
    await loadBanners()
    closeModal()
  } catch(e) {
    alert(e?.message || '保存失败')
  } finally {
    saving.value = false
  }
}

async function handleImageUpload(e) {
  const file = e.target.files?.[0]
  if (!file) return
  try {
    const result = await uploadFile(file)
    modal.value.form.image = result.url || result
  } catch(err) {
    alert('图片上传失败: ' + (err?.message || '未知错误'))
  }
}

async function doDelete() {
  if (!deleteTarget.value) return
  try {
    await deleteBanner(deleteTarget.value.id)
    await loadBanners()
    deleteTarget.value = null
  } catch(e) {
    alert(e?.message || '删除失败')
  }
}

async function moveUp(i) {
  if (i === 0) return
  const a = banners.value[i]
  const b = banners.value[i - 1]
  try {
    await Promise.all([
      updateBanner(a.id, { ...a, sort: b.sort }),
      updateBanner(b.id, { ...b, sort: a.sort }),
    ])
    await loadBanners()
  } catch(e) {
    alert(e?.message || '排序失败')
  }
}

async function moveDown(i) {
  if (i === banners.value.length - 1) return
  const a = banners.value[i]
  const b = banners.value[i + 1]
  try {
    await Promise.all([
      updateBanner(a.id, { ...a, sort: b.sort }),
      updateBanner(b.id, { ...b, sort: a.sort }),
    ])
    await loadBanners()
  } catch(e) {
    alert(e?.message || '排序失败')
  }
}

async function loadBanners() {
  loading.value = true
  try {
    const data = await getBanners()
    banners.value = (Array.isArray(data) ? data : (data?.list || [])).sort((a, b) => (a.sort || 0) - (b.sort || 0))
  } catch(e) {
    console.error('轮播图加载失败', e)
  } finally {
    loading.value = false
  }
}

onMounted(loadBanners)
</script>

<style scoped>
.tip-card {
  display: flex; align-items: flex-start; gap: 10px;
  padding: 12px 16px;
  background: rgba(232,184,96,0.14);
  border: 0.5px solid rgba(232,184,96,0.4);
  border-radius: 12px;
  margin-bottom: 20px;
  font-size: 13px; color: #7A5820; line-height: 1.5;
}

.banner-card { overflow: hidden; display: flex; flex-direction: column; }

.banner-preview {
  height: 156px; position: relative; overflow: hidden;
  display: flex; align-items: center; justify-content: center;
}

.banner-img { width: 100%; height: 100%; object-fit: cover; }

.banner-img-overlay {
  position: absolute; inset: 0;
  background: linear-gradient(135deg, rgba(42,37,32,0.45) 0%, rgba(42,37,32,0.15) 100%);
  pointer-events: none;
}

.banner-text-overlay {
  position: absolute; bottom: 14px; left: 14px; right: 42px;
  z-index: 2; pointer-events: none;
}

.banner-preview-title {
  font-size: 16px; font-weight: 700; color: #FFFCF5;
  white-space: pre-line; line-height: 1.15; margin-bottom: 2px;
}

.banner-preview-sub {
  font-size: 11px; color: rgba(255,252,245,0.85);
}

.banner-placeholder {
  font-size: 14px; color: rgba(255,255,255,0.6); font-weight: 500;
}

.banner-status {
  position: absolute; top: 12px; left: 14px;
}

.order-badge {
  position: absolute; top: 12px; right: 14px;
  width: 22px; height: 22px;
  background: rgba(0,0,0,0.25); border-radius: 6px;
  display: flex; align-items: center; justify-content: center;
  font-size: 11px; font-weight: 700; color: rgba(255,255,255,0.9);
}

.banner-meta {
  padding: 12px 16px 8px;
}

.banner-link {
  display: flex; align-items: center; gap: 6px;
  font-size: 12px; color: var(--ink-3);
}
.banner-link span { font-family: monospace; color: var(--sky); font-size: 11px; word-break: break-all; }

.banner-actions {
  display: flex; gap: 6px;
  padding: 8px 14px 14px;
  border-top: 0.5px solid var(--line-2);
}

/* Modal */
.modal-mask {
  position: fixed; inset: 0;
  background: rgba(42,37,32,0.32);
  backdrop-filter: blur(2px);
  display: flex; align-items: center; justify-content: center;
  z-index: 1000;
}
.modal-box {
  background: var(--card); border-radius: 18px;
  width: 480px; max-width: 92vw;
  box-shadow: 0 16px 48px rgba(42,37,32,0.22);
  overflow: hidden;
}
.modal-head { display: flex; align-items: center; padding: 18px 22px 14px; border-bottom: 0.5px solid var(--line); }
.modal-title { font-size: 15px; font-weight: 700; color: var(--ink); flex: 1; }
.modal-close {
  width: 28px; height: 28px; border-radius: 8px;
  border: none; background: none; cursor: pointer;
  display: flex; align-items: center; justify-content: center;
  color: var(--ink-3);
}
.modal-close:hover { background: rgba(42,37,32,0.07); color: var(--ink); }
.modal-body { padding: 18px 22px; display: flex; flex-direction: column; gap: 14px; }
.modal-foot { display: flex; justify-content: flex-end; gap: 8px; padding: 14px 22px 18px; border-top: 0.5px solid var(--line); }
.field-row { display: flex; flex-direction: column; gap: 6px; }
.field-label { font-size: 12px; font-weight: 600; color: var(--ink-2); }
.req { color: var(--berry); }

.toggle-wrap { display: flex; align-items: center; gap: 10px; cursor: pointer; }
.toggle {
  width: 36px; height: 20px;
  background: rgba(42,37,32,0.15);
  border-radius: 10px; position: relative;
  transition: background 0.2s; cursor: pointer; flex-shrink: 0;
}
.toggle.on { background: var(--moss); }
.toggle-knob {
  position: absolute; width: 14px; height: 14px;
  background: #fff; border-radius: 50%;
  top: 3px; left: 3px; transition: left 0.2s;
  box-shadow: 0 1px 3px rgba(0,0,0,0.18);
}
.toggle.on .toggle-knob { left: 19px; }
</style>
