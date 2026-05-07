<template>
  <view :class="iconClass" :style="sizeStyle" />
</template>

<script setup>
import { computed } from 'vue'

const VAR_COLORS = {
  'var(--ink)': '#2A2520',
  'var(--ink-2)': '#5A4F44',
  'var(--ink-3)': '#8A7E70',
  'var(--primary)': '#D97757',
  'var(--primary-soft)': '#F2C9B5',
  'var(--primary-deep)': '#B5573A',
  'var(--moss)': '#6B7F5A',
  'var(--moss-soft)': '#C7D1B6',
  'var(--berry)': '#A0473F',
  'var(--sky)': '#7A9CB0',
  'var(--butter)': '#E8B860',
  'var(--paper)': '#F5EDE0',
  'var(--card)': '#FFFCF5',
}

function resolveColor(c) {
  return VAR_COLORS[c] || c
}

const props = defineProps({
  name:   { type: String,  required: true },
  color:  { type: String,  default: 'currentColor' },
  size:   { type: [Number, String], default: 22 },
  filled: { type: Boolean, default: false },
})

const iconClass = computed(() => {
  const c = resolveColor(props.color).replace('#', '')
  const suffix = props.filled ? '-on' : ''
  return `s-icon s-${props.name}-${c}${suffix}`
})

const sizeStyle = computed(() => {
  const sz = typeof props.size === 'number' ? props.size + 'rpx' : props.size
  return { width: sz, height: sz }
})
</script>
