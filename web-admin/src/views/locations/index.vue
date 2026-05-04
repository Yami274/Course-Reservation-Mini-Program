<template>
  <div>
    <div class="page-header">
      <div>
        <div class="page-title">上课地点</div>
        <div style="font-size:13px;color:var(--ink-3);margin-top:2px;">共 {{ locations.length }} 个地点</div>
      </div>
      <div style="flex:1"></div>
      <button class="adm-btn primary" @click="openAdd">
        <svg viewBox="0 0 24 24" width="14" height="14" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round"><path d="M12 5v14M5 12h14"/></svg>
        新增地点
      </button>
    </div>

    <div v-if="loading" style="text-align:center;padding:60px;color:var(--ink-3);">加载中…</div>

    <div v-else class="grid-3">
      <div v-for="(loc, i) in locations" :key="loc.id" class="adm-card location-card">
        <div class="map-preview" :style="{ background: mapColors[i % mapColors.length] }">
          <div class="map-pin" :style="{ background: pinColors[i % pinColors.length] }">
            <svg viewBox="0 0 24 24" width="12" height="12" fill="white">
              <path d="M12 2C8.13 2 5 5.13 5 9c0 5.25 7 13 7 13s7-7.75 7-13c0-3.87-3.13-7-7-7zm0 9.5c-1.38 0-2.5-1.12-2.5-2.5s1.12-2.5 2.5-2.5 2.5 1.12 2.5 2.5-1.12 2.5-2.5 2.5z"/>
            </svg>
          </div>
        </div>

        <div class="loc-body">
          <div class="loc-name">{{ loc.name }}</div>
          <div class="loc-address">
            <svg viewBox="0 0 24 24" width="12" height="12" fill="none" stroke="currentColor" stroke-width="1.7" stroke-linecap="round">
              <path d="M12 21s-8-4.5-8-11.8A8 8 0 0112 2a8 8 0 018 7.2C20 16.5 12 21 12 21z"/><circle cx="12" cy="10" r="2.5"/>
            </svg>
            {{ loc.address }}
          </div>
          <div class="loc-phone" v-if="loc.contact">
            <svg viewBox="0 0 24 24" width="12" height="12" fill="none" stroke="currentColor" stroke-width="1.7" stroke-linecap="round">
              <path d="M22 16.92v3a2 2 0 01-2.18 2 19.79 19.79 0 01-8.63-3.07A19.5 19.5 0 013.07 11 19.79 19.79 0 01.01 2.38 2 2 0 012 .18h3a2 2 0 012 1.72 12.84 12.84 0 00.7 2.81 2 2 0 01-.45 2.11L6.09 7.91a16 16 0 006 6l1.27-1.27a2 2 0 012.11-.45 12.84 12.84 0 002.81.7A2 2 0 0122 14.92z"/>
            </svg>
            {{ loc.contact }}
          </div>

          <div class="loc-actions">
            <button class="adm-btn sm ghost" @click="openEdit(loc)">编辑</button>
            <button class="adm-btn sm danger" @click="confirmDelete(loc)">删除</button>
          </div>
        </div>
      </div>

      <div v-if="!loading && locations.length === 0" style="grid-column:1/-1;text-align:center;padding:60px;color:var(--ink-3);">
        暂无地点，点击「新增地点」开始
      </div>
    </div>

    <!-- Add/Edit Modal -->
    <div v-if="modal.show" class="modal-mask" @click.self="closeModal">
      <div class="modal-box">
        <div class="modal-head">
          <div class="modal-title">{{ modal.isEdit ? '编辑地点' : '新增地点' }}</div>
          <button class="modal-close" @click="closeModal">
            <svg viewBox="0 0 24 24" width="16" height="16" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round"><path d="M18 6L6 18M6 6l12 12"/></svg>
          </button>
        </div>
        <div class="modal-body">
          <div class="field-row">
            <div class="field-label">名称 <span class="req">*</span></div>
            <input class="adm-input" v-model="modal.form.name" placeholder="如：万达校区" style="width:100%;" />
          </div>
          <div class="field-row">
            <div class="field-label">地址 <span class="req">*</span></div>
            <input class="adm-input" v-model="modal.form.address" placeholder="详细地址" style="width:100%;" />
          </div>
          <div class="field-row">
            <div class="field-label">联系电话</div>
            <input class="adm-input" v-model="modal.form.contact" placeholder="如：13800138000" style="width:100%;" />
          </div>
          <div style="display:flex;gap:12px;">
            <div class="field-row" style="flex:1;">
              <div class="field-label">纬度</div>
              <input class="adm-input" v-model.number="modal.form.latitude" type="number" step="0.000001" placeholder="30.572260" style="width:100%;" />
            </div>
            <div class="field-row" style="flex:1;">
              <div class="field-label">经度</div>
              <input class="adm-input" v-model.number="modal.form.longitude" type="number" step="0.000001" placeholder="104.066540" style="width:100%;" />
            </div>
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
          <div class="modal-title">确认删除</div>
          <button class="modal-close" @click="deleteTarget = null">
            <svg viewBox="0 0 24 24" width="16" height="16" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round"><path d="M18 6L6 18M6 6l12 12"/></svg>
          </button>
        </div>
        <div class="modal-body">
          <div style="color:var(--ink-2);font-size:14px;">确认删除地点「<b>{{ deleteTarget.name }}</b>」？</div>
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
import { getLocations, createLocation, updateLocation, deleteLocation } from '@/api/index.js'

const loading = ref(true)
const saving = ref(false)
const locations = ref([])
const deleteTarget = ref(null)

const mapColors = [
  'linear-gradient(135deg, #E8DFC8, #DDD0B0)',
  'linear-gradient(135deg, #D5E3C3, #C7D1B6)',
  'linear-gradient(135deg, #F4DFB1, #E8D9A0)',
]
const pinColors = ['#D97757', '#6B7F5A', '#E8B860']

const modal = ref({
  show: false,
  isEdit: false,
  editId: null,
  form: { name: '', address: '', contact: '', latitude: 0, longitude: 0 },
})

function openAdd() {
  modal.value = {
    show: true, isEdit: false, editId: null,
    form: { name: '', address: '', contact: '', latitude: 0, longitude: 0 },
  }
}

function openEdit(loc) {
  modal.value = {
    show: true, isEdit: true, editId: loc.id,
    form: { name: loc.name, address: loc.address, contact: loc.contact || '', latitude: loc.latitude || 0, longitude: loc.longitude || 0 },
  }
}

function closeModal() { modal.value.show = false }
function confirmDelete(loc) { deleteTarget.value = loc }

async function handleSave() {
  if (!modal.value.form.name || !modal.value.form.address) return
  saving.value = true
  try {
    const payload = { ...modal.value.form }
    if (modal.value.isEdit) {
      await updateLocation(modal.value.editId, payload)
    } else {
      await createLocation(payload)
    }
    await loadLocations()
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
    await deleteLocation(deleteTarget.value.id)
    await loadLocations()
    deleteTarget.value = null
  } catch(e) {
    alert(e?.message || '删除失败')
  }
}

async function loadLocations() {
  loading.value = true
  try {
    const data = await getLocations()
    locations.value = Array.isArray(data) ? data : (data?.list || [])
  } catch(e) {
    console.error('地点加载失败', e)
  } finally {
    loading.value = false
  }
}

onMounted(loadLocations)
</script>

<style scoped>
.location-card { overflow: hidden; display: flex; flex-direction: column; }

.map-preview {
  height: 100px; position: relative; overflow: hidden; flex-shrink: 0;
}

.map-pin {
  position: absolute; bottom: 24px; left: 50%;
  width: 28px; height: 28px;
  border-radius: 50% 50% 50% 0;
  transform: translateX(-50%) rotate(-45deg);
  display: flex; align-items: center; justify-content: center;
  box-shadow: 0 2px 8px rgba(0,0,0,0.22);
}
.map-pin svg { transform: rotate(45deg); }

.loc-body { padding: 16px; display: flex; flex-direction: column; gap: 7px; }
.loc-name { font-size: 14px; font-weight: 700; color: var(--ink); }

.loc-address, .loc-phone {
  display: flex; align-items: flex-start; gap: 6px;
  font-size: 12px; color: var(--ink-3); line-height: 1.4;
}
.loc-address svg, .loc-phone svg { flex-shrink: 0; margin-top: 1px; }
.loc-phone { font-family: monospace; font-size: 12px; }

.loc-actions {
  display: flex; gap: 8px; margin-top: 4px;
  padding-top: 10px; border-top: 0.5px solid var(--line-2);
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
</style>
