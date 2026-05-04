<template>
  <div>
    <div class="page-header">
      <div>
        <div class="page-title">分类管理</div>
        <div style="font-size:13px;color:var(--ink-3);margin-top:2px;">共{{ cats.length }}个分类</div>
      </div>
      <div style="flex:1"></div>
      <button class="adm-btn primary" @click="openAdd(null)">
        <svg viewBox="0 0 24 24" width="14" height="14" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round"><path d="M12 5v14M5 12h14"/></svg>
        新增分类
      </button>
    </div>

    <!-- Category tree table -->
    <div class="adm-card">
      <div v-if="loading" style="text-align:center;padding:60px;color:var(--ink-3);">加载中…</div>
      <table v-else class="adm-table">
        <thead>
          <tr>
            <th style="width:36px;"></th>
            <th>分类名称</th>
            <th>图标</th>
            <th>上级分类</th>
            <th>排序</th>
            <th>课程数</th>
            <th>操作</th>
          </tr>
        </thead>
        <tbody>
          <template v-for="cat in topLevel" :key="cat.id">
            <!-- Parent row -->
            <tr class="cat-row parent-row">
              <td>
                <button class="expand-btn" @click="toggleExpand(cat.id)" v-if="getChildren(cat.id).length">
                  <svg viewBox="0 0 24 24" width="12" height="12" fill="none" stroke="currentColor" stroke-width="2.5" stroke-linecap="round">
                    <path v-if="expanded.has(cat.id)" d="M6 15l6-6 6 6"/>
                    <path v-else d="M6 9l6 6 6-6"/>
                  </svg>
                </button>
                <span v-else style="display:inline-block;width:20px;"></span>
              </td>
              <td>
                <div style="display:flex;align-items:center;gap:10px;">
                  <div class="cat-icon-box">
                    {{ cat.icon || '🎨' }}
                  </div>
                  <span style="font-size:13px;font-weight:600;color:var(--ink);">{{ cat.name }}</span>
                  <span class="adm-tag" v-if="getChildren(cat.id).length">{{ getChildren(cat.id).length }}个子分类</span>
                </div>
              </td>
              <td style="font-size:18px;">{{ cat.icon || '—' }}</td>
              <td style="color:var(--ink-3);font-size:13px;">—</td>
              <td>
                <span class="adm-tag">{{ cat.sort || 0 }}</span>
              </td>
              <td style="font-size:13px;color:var(--ink-2);">{{ cat.courseCount || 0 }}</td>
              <td>
                <div style="display:flex;gap:6px;">
                  <button class="adm-btn sm ghost" @click="openAdd(cat)">+ 子分类</button>
                  <button class="adm-btn sm ghost" @click="openEdit(cat)">编辑</button>
                  <button class="adm-btn sm danger" @click="confirmDelete(cat)">删除</button>
                </div>
              </td>
            </tr>
            <!-- Child rows -->
            <template v-if="expanded.has(cat.id)">
              <tr v-for="child in getChildren(cat.id)" :key="child.id" class="cat-row child-row">
                <td></td>
                <td>
                  <div style="display:flex;align-items:center;gap:10px;padding-left:28px;">
                    <div class="cat-icon-box sm">
                      {{ child.icon || '✦' }}
                    </div>
                    <span style="font-size:13px;color:var(--ink);">{{ child.name }}</span>
                  </div>
                </td>
                <td style="font-size:16px;">{{ child.icon || '—' }}</td>
                <td style="font-size:13px;color:var(--ink-3);">{{ cat.name }}</td>
                <td><span class="adm-tag">{{ child.sort || 0 }}</span></td>
                <td style="font-size:13px;color:var(--ink-2);">{{ child.courseCount || 0 }}</td>
                <td>
                  <div style="display:flex;gap:6px;">
                    <button class="adm-btn sm ghost" @click="openEdit(child)">编辑</button>
                    <button class="adm-btn sm danger" @click="confirmDelete(child)">删除</button>
                  </div>
                </td>
              </tr>
            </template>
          </template>
          <tr v-if="!loading && cats.length === 0">
            <td colspan="7" style="text-align:center;padding:60px;color:var(--ink-3);">暂无分类，点击「新增分类」开始</td>
          </tr>
        </tbody>
      </table>
    </div>

    <!-- Add/Edit Modal -->
    <div v-if="modal.show" class="modal-mask" @click.self="closeModal">
      <div class="modal-box">
        <div class="modal-head">
          <div class="modal-title">{{ modal.isEdit ? '编辑分类' : (modal.parentId ? '新增子分类' : '新增分类') }}</div>
          <button class="modal-close" @click="closeModal">
            <svg viewBox="0 0 24 24" width="16" height="16" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round"><path d="M18 6L6 18M6 6l12 12"/></svg>
          </button>
        </div>
        <div class="modal-body">
          <div v-if="modal.parentId && !modal.isEdit" class="field-row">
            <div class="field-label">上级分类</div>
            <div class="field-val" style="color:var(--ink-2);">{{ getParentName(modal.parentId) }}</div>
          </div>
          <div class="field-row">
            <div class="field-label">分类名称 <span class="req">*</span></div>
            <input class="adm-input" v-model="modal.form.name" placeholder="如：启蒙绘画" style="width:100%;" />
          </div>
          <div class="field-row">
            <div class="field-label">图标 Emoji</div>
            <div style="display:flex;gap:8px;flex-wrap:wrap;align-items:center;">
              <input class="adm-input" v-model="modal.form.icon" placeholder="🎨" style="width:80px;text-align:center;font-size:20px;" maxlength="2" />
              <div style="font-size:12px;color:var(--ink-3);">输入1个 Emoji 字符</div>
            </div>
          </div>
          <div class="field-row">
            <div class="field-label">排序值</div>
            <input class="adm-input" v-model.number="modal.form.sort" type="number" min="0" placeholder="0" style="width:100px;" />
            <span style="font-size:12px;color:var(--ink-3);margin-left:8px;">数值越小排越前</span>
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
      <div class="modal-box" style="max-width:380px;">
        <div class="modal-head">
          <div class="modal-title">确认删除</div>
          <button class="modal-close" @click="deleteTarget = null">
            <svg viewBox="0 0 24 24" width="16" height="16" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round"><path d="M18 6L6 18M6 6l12 12"/></svg>
          </button>
        </div>
        <div class="modal-body">
          <div style="color:var(--ink-2);font-size:14px;line-height:1.6;">
            确认删除分类「<b>{{ deleteTarget.name }}</b>」？<br/>
            <span style="color:var(--berry);font-size:12px;" v-if="getChildren(deleteTarget.id).length > 0">⚠ 该分类包含子分类，删除将一并移除。</span>
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
import { getCategories, createCategory, updateCategory, deleteCategory } from '@/api/index.js'

const loading = ref(true)
const saving = ref(false)
const cats = ref([])
const expanded = ref(new Set())
const deleteTarget = ref(null)

const colorOptions = [
  '#F2C9B5', '#C7D1B6', '#B5D4E2', '#F9E0A2', '#D4B5E8',
  '#F4C0C0', '#B5D9C9', '#E8C9A0', '#C9D0E8', '#E8D9C0',
]

const modal = ref({
  show: false,
  isEdit: false,
  parentId: null,
  editId: null,
  form: { name: '', icon: '', sort: 0 },
})

const topLevel = computed(() => cats.value.filter(c => !c.parent_id))
function getChildren(pid) { return cats.value.filter(c => c.parent_id === pid) }
function getParentName(pid) { return cats.value.find(c => c.id === pid)?.name || '' }

function toggleExpand(id) {
  if (expanded.value.has(id)) expanded.value.delete(id)
  else expanded.value.add(id)
}

function openAdd(parent) {
  modal.value = {
    show: true,
    isEdit: false,
    parentId: parent?.id || null,
    editId: null,
    form: { name: '', icon: parent ? '✦' : '🎨', sort: 0 },
  }
}

function openEdit(cat) {
  modal.value = {
    show: true,
    isEdit: true,
    parentId: cat.parent_id || null,
    editId: cat.id,
    form: { name: cat.name, icon: cat.icon || '', sort: cat.sort || 0 },
  }
}

function closeModal() {
  modal.value.show = false
}

function confirmDelete(cat) {
  deleteTarget.value = cat
}

async function handleSave() {
  if (!modal.value.form.name.trim()) return
  saving.value = true
  try {
    const payload = {
      name: modal.value.form.name.trim(),
      icon: modal.value.form.icon,
      sort: modal.value.form.sort,
      parent_id: modal.value.parentId || 0,
    }
    if (modal.value.isEdit) {
      await updateCategory(modal.value.editId, payload)
    } else {
      await createCategory(payload)
    }
    await loadCats()
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
    await deleteCategory(deleteTarget.value.id)
    await loadCats()
    deleteTarget.value = null
  } catch(e) {
    alert(e?.message || '删除失败')
  }
}

async function loadCats() {
  loading.value = true
  try {
    const data = await getCategories()
    cats.value = Array.isArray(data) ? data : (data?.list || data || [])
    // Auto-expand top-level items that have children
    topLevel.value.forEach(c => {
      if (getChildren(c.id).length > 0) expanded.value.add(c.id)
    })
  } catch(e) {
    console.error('分类加载失败', e)
  } finally {
    loading.value = false
  }
}

onMounted(loadCats)
</script>

<style scoped>
.cat-row { transition: background 0.12s; }
.cat-row:hover td { background: rgba(42,37,32,0.015); }
.parent-row > td:first-child { padding-left: 14px; }
.child-row { background: rgba(42,37,32,0.012); }

.expand-btn {
  width: 20px; height: 20px;
  border: none; background: none; cursor: pointer;
  display: inline-flex; align-items: center; justify-content: center;
  border-radius: 4px; color: var(--ink-3); padding: 0;
}
.expand-btn:hover { background: rgba(42,37,32,0.08); color: var(--ink); }

.cat-icon-box {
  width: 32px; height: 32px;
  border-radius: 9px;
  display: flex; align-items: center; justify-content: center;
  font-size: 16px; flex-shrink: 0;
}
.cat-icon-box.sm { width: 26px; height: 26px; border-radius: 7px; font-size: 13px; }

.color-dot {
  width: 22px; height: 22px;
  border-radius: 50%;
  cursor: pointer; transition: transform 0.15s;
}
.color-dot:hover { transform: scale(1.18); }

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
.field-val { font-size: 13px; }
.req { color: var(--berry); }
</style>
