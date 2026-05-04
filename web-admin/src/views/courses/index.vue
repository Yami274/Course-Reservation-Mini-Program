<template>
  <div>
    <div class="page-header">
      <div>
        <div class="page-title">课程管理</div>
        <div style="font-size:13px;color:var(--ink-3);margin-top:2px;">共{{ total }}门课程</div>
      </div>
      <div style="flex:1"></div>
      <button class="adm-btn primary" @click="openAdd">
        <svg viewBox="0 0 24 24" width="14" height="14" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round"><path d="M12 5v14M5 12h14"/></svg>
        新增课程
      </button>
    </div>

    <div class="adm-card" style="padding:14px 18px;margin-bottom:16px;">
      <div style="display:flex;align-items:center;gap:10px;flex-wrap:wrap;">
        <div class="adm-search" style="width:260px;">
          <svg viewBox="0 0 20 20" width="14" height="14" fill="none" stroke="currentColor" stroke-width="1.7">
            <circle cx="9" cy="9" r="5.5"/><path d="M14 14l3.5 3.5" stroke-linecap="round"/>
          </svg>
          <input type="text" v-model="keyword" placeholder="课程名 / 讲师" />
        </div>
        <div class="adm-seg">
          <button :class="{ active: activeStatus === 'all' }" @click="activeStatus='all'">全部</button>
          <button :class="{ active: activeStatus === 'on' }" @click="activeStatus='on'">已上架</button>
          <button :class="{ active: activeStatus === 'draft' }" @click="activeStatus='draft'">草稿</button>
          <button :class="{ active: activeStatus === 'off' }" @click="activeStatus='off'">已下架</button>
        </div>
        <select class="adm-select" v-model="filterCategoryId">
          <option value="">全部分类</option>
          <option v-for="cat in categories" :key="cat.id" :value="cat.id">{{ cat.name }}</option>
        </select>
      </div>
    </div>

    <div class="adm-card">
      <div v-if="loading" style="text-align:center;padding:60px;color:#8A7E70;">加载中…</div>
      <table v-else class="adm-table">
        <thead>
          <tr>
            <th style="width:36px;"><input type="checkbox" class="adm-checkbox"/></th>
            <th>课程</th>
            <th>分类</th>
            <th>讲师</th>
            <th>创建时间</th>
            <th>状态</th>
            <th>操作</th>
          </tr>
        </thead>
        <tbody>
          <tr v-for="course in filteredCourses" :key="course.id">
            <td><input type="checkbox" class="adm-checkbox"/></td>
            <td>
              <div style="display:flex;align-items:center;gap:10px;">
                <div class="course-thumb" :style="{ background: course.thumbFallback }">
                  <img v-if="course.cover" :src="course.cover" class="course-thumb-img" />
                </div>
                <div>
                  <div style="font-size:13px;font-weight:500;color:var(--ink);">{{ course.name }}</div>
                  <div style="font-size:11px;color:var(--ink-3);">ID: {{ course.id }}</div>
                </div>
              </div>
            </td>
            <td><span class="adm-tag">{{ course.category }}</span></td>
            <td style="font-size:13px;color:var(--ink-2);">{{ course.teacherHint }}</td>
            <td style="font-size:12px;color:var(--ink-3);">{{ course.createdAt }}</td>
            <td>
              <span class="st-pill" :class="course.status === 'published' ? 'st-published' : 'st-draft'">
                {{ course.statusLabel }}
              </span>
            </td>
            <td>
              <div style="display:flex;gap:6px;">
                <button class="adm-btn sm ghost" @click="openEdit(course)">编辑</button>
                <button class="adm-btn sm ghost" @click="handleToggleStatus(course)">
                  {{ course.status === 'published' ? '下架' : '上架' }}
                </button>
                <button class="adm-btn sm ghost danger" @click="handleDelete(course.id)">删除</button>
              </div>
            </td>
          </tr>
        </tbody>
      </table>

      <div class="adm-pagination" v-if="total > pageSize">
        <button :disabled="page <= 1" @click="page--; loadCourses()">←</button>
        <button class="active">{{ page }}</button>
        <button :disabled="page * pageSize >= total" @click="page++; loadCourses()">→</button>
      </div>
    </div>

    <!-- Add/Edit Modal -->
    <div v-if="modal.show" class="modal-mask" @click.self="closeModal">
      <div class="modal-box" style="max-height:90vh;overflow-y:auto;">
        <div class="modal-head">
          <div class="modal-title">{{ modal.isEdit ? '编辑课程' : '新增课程' }}</div>
          <button class="modal-close" @click="closeModal">
            <svg viewBox="0 0 24 24" width="16" height="16" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round"><path d="M18 6L6 18M6 6l12 12"/></svg>
          </button>
        </div>
        <div class="modal-body">
          <div class="field-row">
            <div class="field-label">课程标题 <span class="req">*</span></div>
            <input class="adm-input" v-model="modal.form.title" placeholder="如：Scratch 少儿编程启蒙班" style="width:100%;" />
          </div>
          <div class="field-row">
            <div class="field-label">分类 <span class="req">*</span></div>
            <select class="adm-select" v-model="modal.form.category_id" style="width:100%;">
              <option :value="null">请选择分类</option>
              <option v-for="cat in categories" :key="cat.id" :value="cat.id">{{ cat.name }}</option>
            </select>
          </div>
          <div class="field-row">
            <div class="field-label">封面图片</div>
            <div style="display:flex;gap:8px;align-items:center;">
              <input class="adm-input" v-model="modal.form.cover" placeholder="粘贴图片URL或上传文件" style="flex:1;" />
              <label class="adm-btn sm ghost" style="cursor:pointer;white-space:nowrap;flex-shrink:0;">
                本地上传
                <input type="file" accept="image/*" style="display:none;" @change="handleCoverUpload" />
              </label>
            </div>
            <img v-if="modal.form.cover" :src="modal.form.cover" style="width:120px;height:68px;object-fit:cover;border-radius:8px;margin-top:8px;" />
          </div>
          <div class="field-row">
            <div class="field-label">课程介绍（HTML）</div>
            <textarea class="adm-textarea" v-model="modal.form.intro" placeholder="<p>课程介绍内容...</p>" rows="4"></textarea>
          </div>
          <div class="field-row">
            <div class="field-label">讲师</div>
            <div style="display:flex;flex-wrap:wrap;gap:6px;">
              <label v-for="tch in teachers" :key="tch.id" style="display:flex;align-items:center;gap:4px;font-size:13px;cursor:pointer;">
                <input type="checkbox" :value="tch.id" v-model="modal.form.teacher_ids" />
                {{ tch.name }}
              </label>
            </div>
          </div>
          <div class="field-row">
            <div class="field-label">上课地点</div>
            <div style="display:flex;flex-wrap:wrap;gap:6px;">
              <label v-for="loc in locationOptions" :key="loc.id" style="display:flex;align-items:center;gap:4px;font-size:13px;cursor:pointer;">
                <input type="checkbox" :value="loc.id" v-model="modal.form.location_ids" />
                {{ loc.name }}
              </label>
            </div>
          </div>
          <div class="field-row">
            <div class="field-label">状态</div>
            <div class="adm-seg" style="width:fit-content;">
              <button :class="{ active: modal.form.status === 'draft' }" @click="modal.form.status = 'draft'">草稿</button>
              <button :class="{ active: modal.form.status === 'published' }" @click="modal.form.status = 'published'">已上架</button>
              <button :class="{ active: modal.form.status === 'archived' }" @click="modal.form.status = 'archived'">已下架</button>
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
  </div>
</template>

<script setup>
import { ref, computed, onMounted, watch } from 'vue'
import { getCourses, createCourse, updateCourse, deleteCourse, updateCourseStatus, getCategories, getTeachers, getLocations, uploadFile } from '@/api/index.js'

const activeStatus = ref('all')
const keyword = ref('')
const courses = ref([])
const loading = ref(false)
const saving = ref(false)
const total = ref(0)
const page = ref(1)
const pageSize = 20

const categories = ref([])
const teachers = ref([])
const locationOptions = ref([])
const filterCategoryId = ref('')

const thumbBgs = [
  'linear-gradient(135deg,#F4D9B8,#D97757)',
  'linear-gradient(135deg,#C7D1B6,#6B7F5A)',
  'linear-gradient(135deg,#F4DFB1,#E8B860)',
  'linear-gradient(135deg,#E5BEB9,#D97757)',
  'linear-gradient(135deg,#BDD0DC,#7A9CB0)',
  'linear-gradient(135deg,#D5E3C3,#6B7F5A)',
]

const modal = ref({
  show: false,
  isEdit: false,
  editId: null,
  form: { title: '', category_id: null, cover: '', intro: '', teacher_ids: [], location_ids: [], status: 'draft' },
})

function statusLabel(s) {
  if (s === 'published') return '已上架'
  if (s === 'draft') return '草稿'
  if (s === 'archived') return '已下架'
  return s || '草稿'
}

function openAdd() {
  modal.value = {
    show: true, isEdit: false, editId: null,
    form: { title: '', category_id: null, cover: '', intro: '', teacher_ids: [], location_ids: [], status: 'draft' },
  }
}

async function openEdit(course) {
  try {
    const { getCourse } = await import('@/api/index.js')
    const detail = await getCourse(course.id)
    modal.value = {
      show: true, isEdit: true, editId: course.id,
      form: {
        title: detail.title || '',
        category_id: detail.category_id || detail.category?.id || null,
        cover: detail.cover || '',
        intro: detail.intro || '',
        teacher_ids: detail.teacher_ids || [],
        location_ids: detail.location_ids || [],
        status: detail.status || 'draft',
      },
    }
  } catch(e) {
    alert('加载课程详情失败: ' + (e?.message || '未知错误'))
  }
}

function closeModal() { modal.value.show = false }

async function handleSave() {
  if (!modal.value.form.title || !modal.value.form.category_id) {
    alert('请填写课程标题和分类')
    return
  }
  saving.value = true
  try {
    const payload = { ...modal.value.form }
    if (modal.value.isEdit) {
      await updateCourse(modal.value.editId, payload)
    } else {
      await createCourse(payload)
    }
    await loadCourses()
    closeModal()
  } catch(e) {
    alert(e?.message || '保存失败')
  } finally {
    saving.value = false
  }
}

async function loadMeta() {
  try {
    const [cats, tchs, locs] = await Promise.all([getCategories(), getTeachers(), getLocations()])
    categories.value = Array.isArray(cats) ? cats : (cats?.list || [])
    teachers.value = Array.isArray(tchs) ? tchs : (tchs?.list || [])
    locationOptions.value = Array.isArray(locs) ? locs : (locs?.list || [])
  } catch(e) { console.error('加载元数据失败', e) }
}

async function loadCourses() {
  loading.value = true
  try {
    const params = { page: page.value, pageSize }
    if (activeStatus.value !== 'all') {
      const map = { on: 'published', draft: 'draft', off: 'archived' }
      params.status = map[activeStatus.value]
    }
    if (keyword.value) params.keyword = keyword.value
    if (filterCategoryId.value) params.category_id = filterCategoryId.value
    const data = await getCourses(params)
    const list = data?.list || []
    total.value = data?.total || list.length
    courses.value = list.map((c, i) => ({
      id: c.id,
      name: c.title || '',
      cover: c.cover || '',
      category: c.category?.name || '',
      categoryId: c.category_id || c.category?.id,
      teacherIds: c.teacher_ids || [],
      teacherHint: Array.isArray(c.teacher_ids) && c.teacher_ids.length ? `讲师×${c.teacher_ids.length}` : '—',
      status: c.status,
      statusLabel: statusLabel(c.status),
      createdAt: c.created_at ? c.created_at.slice(0, 10) : '',
      thumbFallback: thumbBgs[i % thumbBgs.length],
    }))
  } catch(e) {
    console.error('课程加载失败', e)
  } finally {
    loading.value = false
  }
}

async function handleCoverUpload(e) {
  const file = e.target.files?.[0]
  if (!file) return
  try {
    const result = await uploadFile(file)
    modal.value.form.cover = result.url || result
  } catch(err) {
    alert('图片上传失败: ' + (err?.message || '未知错误'))
  }
}

async function handleDelete(id) {
  if (!confirm('确定删除该课程？此操作不可撤销。')) return
  try {
    await deleteCourse(id)
    await loadCourses()
  } catch(e) {
    alert(e?.message || '删除失败')
  }
}

async function handleToggleStatus(course) {
  const newStatus = course.status === 'published' ? 'archived' : 'published'
  try {
    await updateCourseStatus(course.id, newStatus)
    await loadCourses()
  } catch(e) {
    alert(e?.message || '操作失败')
  }
}

const filteredCourses = computed(() => courses.value)

let searchTimer = null
watch([activeStatus, keyword, filterCategoryId], () => {
  clearTimeout(searchTimer)
  searchTimer = setTimeout(() => {
    page.value = 1
    loadCourses()
  }, 300)
})

onMounted(() => {
  loadMeta()
  loadCourses()
})
</script>

<style scoped>
.course-thumb { width: 44px; height: 44px; border-radius: 8px; flex-shrink: 0; position: relative; overflow: hidden; }
.course-thumb-img { width: 100%; height: 100%; object-fit: cover; position: absolute; inset: 0; }

.modal-mask {
  position: fixed; inset: 0;
  background: rgba(42,37,32,0.32); backdrop-filter: blur(2px);
  display: flex; align-items: center; justify-content: center; z-index: 1000;
}
.modal-box {
  background: var(--card); border-radius: 18px;
  width: 560px; max-width: 92vw;
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
  outline: none; resize: vertical; line-height: 1.6;
  box-sizing: border-box;
}
.adm-textarea:focus { border-color: var(--primary); }
</style>
