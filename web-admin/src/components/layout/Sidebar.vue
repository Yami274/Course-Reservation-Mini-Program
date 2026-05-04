<template>
  <aside class="adm-side">
    <!-- Brand -->
    <div class="brand">
      <div class="brand-logo">安</div>
      <div class="brand-info">
        <div class="brand-name">安然画室</div>
        <div class="brand-sub">讲师工作台 v1.0</div>
      </div>
    </div>

    <!-- Nav -->
    <nav class="sidebar-nav">
      <div class="nav-section-label">概览</div>
      <div
        v-for="item in navItems.overview"
        :key="item.path"
        class="adm-nav-item"
        :class="{ active: currentPath === item.path }"
        @click="navigate(item.path)"
      >
        <svg class="adm-nav-icon" viewBox="0 0 24 24" v-html="item.icon"></svg>
        <span>{{ item.label }}</span>
        <span v-if="item.badge" class="adm-nav-badge">{{ item.badge }}</span>
      </div>

      <div class="nav-section-label">教学</div>
      <div
        v-for="item in navItems.teaching"
        :key="item.path"
        class="adm-nav-item"
        :class="{ active: currentPath === item.path }"
        @click="navigate(item.path)"
      >
        <svg class="adm-nav-icon" viewBox="0 0 24 24" v-html="item.icon"></svg>
        <span>{{ item.label }}</span>
        <span v-if="item.badge" class="adm-nav-badge">{{ item.badge }}</span>
      </div>

      <div class="nav-section-label">运营</div>
      <div
        v-for="item in navItems.operation"
        :key="item.path"
        class="adm-nav-item"
        :class="{ active: currentPath === item.path }"
        @click="navigate(item.path)"
      >
        <svg class="adm-nav-icon" viewBox="0 0 24 24" v-html="item.icon"></svg>
        <span>{{ item.label }}</span>
        <span v-if="item.badge" class="adm-nav-badge">{{ item.badge }}</span>
      </div>

      <div class="nav-section-label">系统</div>
      <div
        v-for="item in navItems.system"
        :key="item.path"
        class="adm-nav-item"
        :class="{ active: currentPath === item.path }"
        @click="navigate(item.path)"
      >
        <svg class="adm-nav-icon" viewBox="0 0 24 24" v-html="item.icon"></svg>
        <span>{{ item.label }}</span>
        <span v-if="item.badge" class="adm-nav-badge">{{ item.badge }}</span>
      </div>
    </nav>

    <div style="flex:1"></div>

    <!-- Todo Card -->
    <div class="todo-card">
      <div class="todo-icon">
        <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="var(--primary-deep)" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
          <path d="M9 11l3 3 8-8M21 12v7a2 2 0 01-2 2H5a2 2 0 01-2-2V5a2 2 0 012-2h11"/>
        </svg>
      </div>
      <div class="todo-text">
        <div class="todo-line">{{ pendingCount }}条预约待审核</div>
        <div class="todo-line" style="color:var(--berry)">{{ warningCount }}个时段名额预警</div>
      </div>
      <button class="adm-btn primary sm" style="margin-top:10px;width:100%;justify-content:center;" @click="navigate('/orders')">
        立即处理
      </button>
    </div>
  </aside>
</template>

<script setup>
import { computed } from 'vue'
import { useRouter, useRoute } from 'vue-router'

const router = useRouter()
const route = useRoute()
const currentPath = computed(() => route.path)

const props = defineProps({
  pendingCount: { type: Number, default: 0 },
  warningCount: { type: Number, default: 0 }
})

const emit = defineEmits(['navigate'])

function navigate(path) {
  router.push(path)
  emit('navigate', path)
}

const navItems = computed(() => ({
  overview: [
    {
      path: '/dashboard',
      label: '数据总览',
      icon: '<rect x="3" y="3" width="7" height="7" rx="1.5" stroke="currentColor"/><rect x="14" y="3" width="7" height="7" rx="1.5" stroke="currentColor"/><rect x="3" y="14" width="7" height="7" rx="1.5" stroke="currentColor"/><rect x="14" y="14" width="7" height="7" rx="1.5" stroke="currentColor"/>',
    },
  ],
  teaching: [
    {
      path: '/courses',
      label: '课程管理',
      icon: '<path d="M4 19.5A2.5 2.5 0 016.5 17H20M4 19.5A2.5 2.5 0 014 17V5a2 2 0 012-2h12a2 2 0 012 2v12M4 19.5V21"/><path d="M9 10h6M9 13h4"/>',
    },
    {
      path: '/categories',
      label: '分类管理',
      icon: '<path d="M4 6h16M4 10h10M4 14h7M4 18h4"/>',
    },
    {
      path: '/teachers',
      label: '讲师管理',
      icon: '<circle cx="9" cy="7" r="4"/><path d="M3 21v-2a4 4 0 014-4h4a4 4 0 014 4v2"/><path d="M16 3.13a4 4 0 010 7.75M21 21v-2a4 4 0 00-3-3.85"/>',
    },
    {
      path: '/locations',
      label: '上课地点',
      icon: '<path d="M12 21s-8-4.5-8-11.8A8 8 0 0112 2a8 8 0 018 7.2C20 16.5 12 21 12 21z"/><circle cx="12" cy="10" r="3"/>',
    },
  ],
  operation: [
    {
      path: '/orders',
      label: '预约审核',
      badge: props.pendingCount > 0 ? props.pendingCount : null,
      icon: '<path d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2"/><path d="M9 12l2 2 4-4"/>',
    },
    {
      path: '/students',
      label: '学员管理',
      icon: '<circle cx="12" cy="8" r="4"/><path d="M4 20c0-4 3.6-7 8-7s8 3 8 7"/>',
    },
    {
      path: '/settings/banners',
      label: '轮播图配置',
      icon: '<rect x="2" y="6" width="20" height="12" rx="2"/><path d="M8 12h.01M12 12h.01M16 12h.01"/>',
    },
  ],
  system: [
    {
      path: '/push',
      label: '消息推送',
      icon: '<path d="M18 8A6 6 0 006 8c0 7-3 9-3 9h18s-3-2-3-9M13.73 21a2 2 0 01-3.46 0"/>',
    },
    {
      path: '/settings',
      label: '系统设置',
      icon: '<circle cx="12" cy="12" r="3"/><path d="M19.4 15a1.65 1.65 0 00.33 1.82l.06.06a2 2 0 010 2.83 2 2 0 01-2.83 0l-.06-.06a1.65 1.65 0 00-1.82-.33 1.65 1.65 0 00-1 1.51V21a2 2 0 01-4 0v-.09A1.65 1.65 0 009 19.4a1.65 1.65 0 00-1.82.33l-.06.06a2 2 0 01-2.83-2.83l.06-.06A1.65 1.65 0 004.68 15a1.65 1.65 0 00-1.51-1H3a2 2 0 010-4h.09A1.65 1.65 0 004.6 9a1.65 1.65 0 00-.33-1.82l-.06-.06a2 2 0 012.83-2.83l.06.06A1.65 1.65 0 009 4.68a1.65 1.65 0 001-1.51V3a2 2 0 014 0v.09a1.65 1.65 0 001 1.51 1.65 1.65 0 001.82-.33l.06-.06a2 2 0 012.83 2.83l-.06.06A1.65 1.65 0 0019.4 9a1.65 1.65 0 001.51 1H21a2 2 0 010 4h-.09a1.65 1.65 0 00-1.51 1z"/>',
    },
  ],
}))
</script>

<style scoped>
.brand {
  display: flex;
  align-items: center;
  gap: 10px;
  margin-bottom: 22px;
  padding: 0 4px;
}

.brand-logo {
  width: 38px;
  height: 38px;
  background: var(--primary);
  border-radius: 11px;
  display: flex;
  align-items: center;
  justify-content: center;
  font-family: "Fraunces", serif;
  font-size: 20px;
  font-weight: 700;
  color: #FFFCF5;
  flex-shrink: 0;
  box-shadow: 0 2px 8px rgba(217, 119, 87, 0.35);
}

.brand-name {
  font-size: 15px;
  font-weight: 700;
  color: var(--ink);
  letter-spacing: 0.02em;
}

.brand-sub {
  font-size: 10px;
  color: var(--ink-3);
  margin-top: 1px;
}

.sidebar-nav {
  display: flex;
  flex-direction: column;
  gap: 1px;
}

.todo-card {
  background: linear-gradient(135deg, var(--primary-soft) 0%, #F9DDD1 100%);
  border-radius: 14px;
  padding: 14px;
  border: 0.5px solid rgba(217, 119, 87, 0.2);
}

.todo-icon {
  width: 32px;
  height: 32px;
  background: rgba(255,255,255,0.6);
  border-radius: 8px;
  display: flex;
  align-items: center;
  justify-content: center;
  margin-bottom: 8px;
}

.todo-text {
  display: flex;
  flex-direction: column;
  gap: 3px;
}

.todo-line {
  font-size: 12px;
  font-weight: 500;
  color: var(--ink-2);
}
</style>
