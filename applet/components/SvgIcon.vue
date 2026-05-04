<template>
  <svg :width="size" :height="size" :viewBox="vb" fill="none"
    :style="{ display: 'inline-block', verticalAlign: 'middle', flexShrink: 0 }">

    <!-- Home -->
    <path v-if="name==='home'"
      d="M3 11l9-7 9 7v9a1 1 0 01-1 1h-5v-6h-6v6H4a1 1 0 01-1-1v-9z"
      :stroke="color" stroke-width="1.6" stroke-linejoin="round"
      :fill="filled?color:'none'" :fill-opacity="filled?0.18:0"/>

    <!-- Book / Course -->
    <template v-else-if="name==='book' || name==='course'">
      <path d="M4 5c2-1 4-1 7 0v15c-3-1-5-1-7 0V5z"
        :stroke="color" stroke-width="1.6" stroke-linejoin="round"
        :fill="filled?color:'none'" :fill-opacity="filled?0.18:0"/>
      <path d="M20 5c-2-1-4-1-7 0v15c3-1 5-1 7 0V5z"
        :stroke="color" stroke-width="1.6" stroke-linejoin="round"
        :fill="filled?color:'none'" :fill-opacity="filled?0.18:0"/>
    </template>

    <!-- Calendar / Order -->
    <template v-else-if="name==='calendar' || name==='order'">
      <rect x="3.5" y="5.5" width="17" height="15" rx="3"
        :stroke="color" stroke-width="1.6"
        :fill="filled?color:'none'" :fill-opacity="filled?0.18:0"/>
      <path d="M8 3v4M16 3v4M3.5 10h17" :stroke="color" stroke-width="1.6" stroke-linecap="round"/>
    </template>

    <!-- User / Mine -->
    <template v-else-if="name==='user' || name==='mine'">
      <circle cx="12" cy="8" r="4" :stroke="color" stroke-width="1.6"
        :fill="filled?color:'none'" :fill-opacity="filled?0.18:0"/>
      <path d="M4 21c1.5-4 5-6 8-6s6.5 2 8 6" :stroke="color" stroke-width="1.6" stroke-linecap="round"/>
    </template>

    <!-- Search (viewBox 0 0 20 20) -->
    <template v-else-if="name==='search'">
      <circle cx="9" cy="9" r="6" :stroke="color" stroke-width="1.6"/>
      <path d="M14 14l4 4" :stroke="color" stroke-width="1.6" stroke-linecap="round"/>
    </template>

    <!-- Mic -->
    <template v-else-if="name==='mic'">
      <rect x="9" y="3" width="6" height="11" rx="3" :stroke="color" stroke-width="1.6"/>
      <path d="M5 11a7 7 0 0014 0M12 18v3" :stroke="color" stroke-width="1.6" stroke-linecap="round"/>
    </template>

    <!-- Bell -->
    <path v-else-if="name==='bell'"
      d="M6 9a6 6 0 0112 0c0 4 1.5 6 2 7H4c.5-1 2-3 2-7zM10 19a2 2 0 004 0"
      :stroke="color" stroke-width="1.6" stroke-linejoin="round" stroke-linecap="round"/>

    <!-- Clock -->
    <template v-else-if="name==='clock'">
      <circle cx="12" cy="12" r="9" :stroke="color" stroke-width="1.6"/>
      <path d="M12 7v5l3 2" :stroke="color" stroke-width="1.6" stroke-linecap="round"/>
    </template>

    <!-- Pin / Location -->
    <template v-else-if="name==='pin'">
      <path d="M12 21s-7-7-7-12a7 7 0 0114 0c0 5-7 12-7 12z"
        :stroke="color" stroke-width="1.6" stroke-linejoin="round"/>
      <circle cx="12" cy="9" r="2.5" :stroke="color" stroke-width="1.6"/>
    </template>

    <!-- Chevron right -->
    <path v-else-if="name==='chevron'"
      d="M9 5l7 7-7 7" :stroke="color" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round"/>

    <!-- Chevron left -->
    <path v-else-if="name==='chevron-left'"
      d="M15 5l-7 7 7 7" :stroke="color" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round"/>

    <!-- Heart -->
    <path v-else-if="name==='heart'"
      d="M12 20s-7-4.5-7-10a4 4 0 017-2.6A4 4 0 0119 10c0 5.5-7 10-7 10z"
      :stroke="color" stroke-width="1.6" stroke-linejoin="round"
      :fill="filled?color:'none'"/>

    <!-- Share -->
    <template v-else-if="name==='share'">
      <circle cx="6" cy="12" r="2.5" :stroke="color" stroke-width="1.6"/>
      <circle cx="17" cy="6" r="2.5" :stroke="color" stroke-width="1.6"/>
      <circle cx="17" cy="18" r="2.5" :stroke="color" stroke-width="1.6"/>
      <path d="M8.2 11l6.6-3.5M8.2 13l6.6 3.5" :stroke="color" stroke-width="1.6"/>
    </template>

    <!-- Nav / Navigate -->
    <path v-else-if="name==='nav'"
      d="M21 3L3 11l8 2 2 8 8-18z" :stroke="color" stroke-width="1.6" stroke-linejoin="round"/>

    <!-- Phone -->
    <path v-else-if="name==='phone'"
      d="M5 4h3l2 5-2 1a11 11 0 006 6l1-2 5 2v3a2 2 0 01-2 2A16 16 0 013 6a2 2 0 012-2z"
      :stroke="color" stroke-width="1.6" stroke-linejoin="round"/>

    <!-- Star -->
    <path v-else-if="name==='star'"
      d="M12 3l2.7 5.6 6.1.9-4.4 4.3 1 6.1L12 17l-5.4 2.9 1-6.1L3.2 9.5l6.1-.9L12 3z"
      :stroke="color" stroke-width="1.4" stroke-linejoin="round"
      :fill="filled?color:'none'"/>

    <!-- Check -->
    <path v-else-if="name==='check'"
      d="M5 12l4.5 4.5L19 7" :stroke="color" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"/>

    <!-- Filter -->
    <path v-else-if="name==='filter'"
      d="M4 5h16M7 12h10M10 19h4" :stroke="color" stroke-width="1.8" stroke-linecap="round"/>

    <!-- Plus -->
    <path v-else-if="name==='plus'"
      d="M12 5v14M5 12h14" :stroke="color" stroke-width="2" stroke-linecap="round"/>

    <!-- Wechat -->
    <template v-else-if="name==='wechat'">
      <path :fill="color"
        d="M9 5C5.1 5 2 7.7 2 11c0 1.7.9 3.3 2.4 4.4L4 18l2.6-1.4c.5.1 1 .2 1.6.2.2-2.7 2.7-5 6-5.4C13.7 8.5 11.5 5 9 5zM6.5 9.5a1 1 0 110 2 1 1 0 010-2zm4 0a1 1 0 110 2 1 1 0 010-2z"/>
      <path :fill="color"
        d="M22 15.5c0-2.7-2.7-5-6-5s-6 2.3-6 5 2.7 5 6 5c.5 0 1 0 1.4-.1L20 22l-.4-1.8c1.4-1 2.4-2.4 2.4-4.7zm-8-1a.8.8 0 110 1.6.8.8 0 010-1.6zm4 0a.8.8 0 110 1.6.8.8 0 010-1.6z"/>
    </template>

  </svg>
</template>

<script setup>
const props = defineProps({
  name:   { type: String,  required: true },
  color:  { type: String,  default: 'currentColor' },
  size:   { type: [Number, String], default: 22 },
  filled: { type: Boolean, default: false },
})

const SEARCH_VBOX = ['search']
const vb = SEARCH_VBOX.includes(props.name) ? '0 0 20 20' : '0 0 24 24'
</script>
