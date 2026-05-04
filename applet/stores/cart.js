import { defineStore } from 'pinia'
import { ref, computed } from 'vue'

export const useCartStore = defineStore('cart', () => {
  // 选中的课程/时段/班型（暂存状态）
  const selectedCourse = ref(null)
  const selectedSlot = ref(null)
  const selectedClassType = ref('')

  // 预约草稿信息
  const bookingDraft = ref({
    studentName: '',
    studentAge: '',
    phone: '',
    notes: '',
  })

  const hasPendingBooking = computed(() => !!selectedCourse.value && !!selectedSlot.value)

  function selectCourse(course) {
    selectedCourse.value = course
    selectedSlot.value = null
    selectedClassType.value = ''
    bookingDraft.value = {
      studentName: '',
      studentAge: '',
      phone: '',
      notes: '',
    }
  }

  function selectSlot(slot) {
    selectedSlot.value = slot
  }

  function selectClassType(type) {
    selectedClassType.value = type
  }

  function updateDraft(field, value) {
    bookingDraft.value[field] = value
  }

  function clearSelection() {
    selectedCourse.value = null
    selectedSlot.value = null
    selectedClassType.value = ''
    bookingDraft.value = {
      studentName: '',
      studentAge: '',
      phone: '',
      notes: '',
    }
  }

  function getBookingPayload() {
    return {
      courseId: selectedCourse.value?.id,
      slotId: selectedSlot.value?.id,
      classType: selectedClassType.value,
      ...bookingDraft.value,
    }
  }

  return {
    selectedCourse,
    selectedSlot,
    selectedClassType,
    bookingDraft,
    hasPendingBooking,
    selectCourse,
    selectSlot,
    selectClassType,
    updateDraft,
    clearSelection,
    getBookingPayload,
  }
})
