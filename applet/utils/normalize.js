/**
 * 后端数据字段适配工具
 * 将后端返回的原始 DB 字段映射成前端模板所需的视图模型字段
 */

const THUMB_COLORS = [
  'linear-gradient(135deg, #F9D9C4, #E8A87C, #D97757)',
  'linear-gradient(135deg, #C7D1B6, #8AAA70, #6B7F5A)',
  'linear-gradient(135deg, #F4DFB1, #E8B860, #C89840)',
  'linear-gradient(135deg, #FADADD, #E8909A, #A0473F)',
  'linear-gradient(135deg, #BFD5E3, #7A9CB0, #5A7C90)',
]

const TAG_STYLES = [
  { bg: '#F4DFB1', color: '#8A5020' },
  { bg: '#C7D1B6', color: '#3A5A28' },
  { bg: '#F4C9C9', color: '#8A2828' },
  { bg: '#BFD5E3', color: '#2A4A5A' },
  { bg: '#E8DFF8', color: '#4A2A7A' },
]

const IMG_BASE = 'http://localhost:3000'

function resolveImageUrl(url) {
  if (!url) return ''
  if (url.startsWith('http://') || url.startsWith('https://')) return url
  if (url.startsWith('/')) return IMG_BASE + url
  return url
}
function pickByIndex(arr, id) {
  return arr[(id || 0) % arr.length]
}

/**
 * 将后端课程对象映射为前端视图模型
 * 兼容列表接口和详情接口两种形状
 */
export function normalizeCourse(raw) {
  if (!raw) return null
  const id = raw.id || 0
  const thumbBg = pickByIndex(THUMB_COLORS, id)
  const tagStyle = pickByIndex(TAG_STYLES, id)

  // 讲师：详情接口返回 teachers[]，列表接口没有讲师信息
  const teacher = raw.teachers?.[0] || raw.teacher || raw.instructor || null

  // 价格：课程本身没有价格，取第一个班型
  const firstType = (raw.courseTypes || raw.course_types || [])[0]
  const price = firstType?.price ?? raw.price ?? 0
  const priceText = price ? `¥${price}` : '免费'

  // 余席：取所有班型下所有时段的余席之和
  let seatsLeft = 0
  let timeSlot = ''
  let ageRange = raw.age_range || raw.ageRange || ''
  const types = raw.courseTypes || raw.course_types || []
  for (const t of types) {
    for (const s of (t.schedules || [])) {
      if (s.status !== 'cancelled') {
        seatsLeft += Math.max(0, (s.max_count || 0) - (s.booked_count || 0))
      }
      if (!timeSlot && s.status !== 'cancelled') {
        timeSlot = formatScheduleTime(s)
      }
    }
  }
  // 列表接口没有 courseTypes
  if (seatsLeft === 0 && raw.remaining_spots != null) {
    seatsLeft = raw.remaining_spots
  }

  // 从课程标题或intro中推断年龄段
  if (!ageRange) {
    // Try intro first
    if (raw.intro) {
      const m = raw.intro.match(/(\d+[-–—]\d+)\s*岁/)
      if (m) ageRange = m[1] + '岁'
    }
    // Fallback: infer from title keywords (adult keywords checked first)
    if (!ageRange) {
      const title = raw.title || ''
      if (/成人|人体|夜间|周末|禅意|松烟/.test(title)) ageRange = '成人'
      else if (/速写|油画/.test(title)) ageRange = '成人'
      else if (/国画|水彩|花鸟|书法|进阶/.test(title)) ageRange = '7-12岁'
      else if (/手作|黏土|一笔一画|硬笔/.test(title)) ageRange = '5-9岁'
      else if (/启蒙|小小|萌新/.test(title)) ageRange = '4-6岁'
    }
  }

  return {
    id,
    name: raw.title || raw.name || '',
    category: raw.category?.name || raw.category || '',
    ageRange,
    timeSlot,
    teacherName: teacher?.name || '',
    teacherTitle: teacher?.title || '',
    teacherAvatarBg: 'linear-gradient(135deg, #F4DFB1, #E8A87C)',
    intro: raw.intro || raw.description || '',
    features: raw.features || [],
    priceText,
    price,
    thumbBg,
    tagBg: tagStyle.bg,
    tagColor: tagStyle.color,
    seatsLeft,
    isHot: id % 3 === 1, // 简单热门标记，可按业务调整
    cover: resolveImageUrl(raw.cover) || '',
    status: raw.status || '',
    courseTypes: types,
    teachers: raw.teachers || [],
    locations: raw.locations || [],
    bannerBg: thumbBg,
  }
}

/**
 * 格式化时段显示：从 date/start_time/end_time 拼出可读字符串
 */
export function formatScheduleTime(schedule) {
  if (!schedule) return ''
  if (schedule.time_slot) return schedule.time_slot
  const date = schedule.date || ''
  const start = (schedule.start_time || '').slice(0, 5)
  const end = (schedule.end_time || '').slice(0, 5)
  if (!date) return start ? `${start}${end ? ' - ' + end : ''}` : ''
  // "05/18 09:30 - 11:00"
  const [, mm, dd] = date.split('-')
  return `${mm}/${dd} ${start}${end ? ' - ' + end : ''}`
}

/**
 * 格式化订单，适配后端返回字段
 */
export function normalizeOrder(o) {
  if (!o) return null
  const student = o.student || null
  const course  = o.course  || null
  const teacher = course?.teachers?.[0] || null
  const loc     = course?.locations?.[0] || null

  // 格式化创建时间
  const rawDate = o.created_at || o.createdAt || ''
  const createTime = rawDate
    ? new Date(rawDate).toLocaleString('zh', {
        year: 'numeric', month: '2-digit', day: '2-digit',
        hour: '2-digit', minute: '2-digit',
      }).replace(/\//g, '-')
    : ''

  return {
    id: o.id,
    courseId: o.course_id || course?.id || o.courseId || null,
    orderNo: o.order_no || o.orderNo || String(o.id),
    courseName: course?.title || course?.name || o.courseName || '',
    classType: (o.courseType || o.course_type)?.name || o.classType || '',
    timeSlot: formatScheduleTime(o.schedule) || o.timeSlot || '',
    status: o.status || 'pending',
    thumbBg: pickByIndex(THUMB_COLORS, o.id || 0),
    cover: resolveImageUrl(course?.cover || o.cover || ''),
    rejectReason: o.audit_remark || o.reject_reason || o.rejectReason || '',
    // Student fields
    studentName: student?.name || o.studentName || '',
    studentAge: student?.age != null ? student.age : (o.studentAge ?? ''),
    phone: student?.phone || o.phone || '',
    // Location
    location: loc ? `${loc.name || ''}${loc.address ? ' · ' + loc.address : ''}` : (o.location || ''),
    // Teacher
    teacherName: teacher?.name || o.teacherName || '',
    // Timestamps
    createTime,
    createdAt: o.created_at || o.createdAt || '',
    // Raw refs for detail usage
    student,
    course,
    schedule: o.schedule || null,
    courseType: o.courseType || o.course_type || null,
  }
}
