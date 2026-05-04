<template>
  <header class="adm-top">
    <!-- Breadcrumb -->
    <div class="breadcrumb">
      <span class="bc-root">讲师工作台</span>
      <span class="bc-sep">/</span>
      <span class="bc-current">{{ title }}</span>
    </div>

    <!-- Search -->
    <div class="adm-search search-bar">
      <svg viewBox="0 0 20 20" width="15" height="15" fill="none" stroke="currentColor" stroke-width="1.7">
        <circle cx="9" cy="9" r="5.5"/>
        <path d="M14 14l3.5 3.5" stroke-linecap="round"/>
      </svg>
      <input type="text" placeholder="搜索课程、订单号、学员姓名…" />
      <span class="cmd-badge">⌘K</span>
    </div>

    <div style="flex:1"></div>

    <!-- Right actions -->
    <div class="top-actions">
      <!-- Bell -->
      <button class="icon-btn" title="消息推送" @click="$router.push('/push')">
        <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.6" stroke-linejoin="round">
          <path d="M6 9a6 6 0 0112 0c0 4 1.5 6 2 7H4c.5-1 2-3 2-7z"/>
          <path d="M10 19a2 2 0 004 0"/>
        </svg>
        <span class="bell-dot" v-if="pendingCount > 0"></span>
      </button>

      <!-- Settings -->
      <button class="icon-btn" title="系统设置" @click="$router.push('/settings')">
        <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.6">
          <circle cx="12" cy="12" r="3"/>
          <path d="M19.4 15a1.65 1.65 0 00.33 1.82l.06.06a2 2 0 010 2.83 2 2 0 01-2.83 0l-.06-.06a1.65 1.65 0 00-1.82-.33 1.65 1.65 0 00-1 1.51V21a2 2 0 01-4 0v-.09A1.65 1.65 0 009 19.4a1.65 1.65 0 00-1.82.33l-.06.06a2 2 0 01-2.83-2.83l.06-.06A1.65 1.65 0 004.68 15a1.65 1.65 0 00-1.51-1H3a2 2 0 010-4h.09A1.65 1.65 0 004.6 9a1.65 1.65 0 00-.33-1.82l-.06-.06a2 2 0 012.83-2.83l.06.06A1.65 1.65 0 009 4.68a1.65 1.65 0 001-1.51V3a2 2 0 014 0v.09a1.65 1.65 0 001 1.51 1.65 1.65 0 001.82-.33l.06-.06a2 2 0 012.83 2.83l-.06.06A1.65 1.65 0 0019.4 9a1.65 1.65 0 001.51 1H21a2 2 0 010 4h-.09a1.65 1.65 0 00-1.51 1z"/>
        </svg>
      </button>

      <div class="top-divider"></div>

      <!-- User -->
      <div class="user-chip">
        <div class="user-avatar">安</div>
        <div class="user-info">
          <div class="user-name">安然</div>
          <div class="user-role">主理人</div>
        </div>
      </div>
    </div>
  </header>
</template>

<script setup>
import { useRouter } from 'vue-router'
const router = useRouter()

defineProps({
  title: {
    type: String,
    default: '数据总览'
  },
  pendingCount: {
    type: Number,
    default: 0
  }
})
</script>

<style scoped>
.breadcrumb {
  display: flex;
  align-items: center;
  gap: 6px;
  font-size: 13px;
  white-space: nowrap;
}

.bc-root {
  color: var(--ink-3);
}

.bc-sep {
  color: var(--ink-3);
  font-size: 11px;
}

.bc-current {
  color: var(--ink);
  font-weight: 600;
}

.search-bar {
  max-width: 380px;
  width: 100%;
}

.cmd-badge {
  font-size: 10px;
  color: var(--ink-3);
  background: rgba(42,37,32,0.07);
  padding: 2px 6px;
  border-radius: 5px;
  white-space: nowrap;
  font-family: monospace;
}

.top-actions {
  display: flex;
  align-items: center;
  gap: 6px;
}

.icon-btn {
  width: 36px;
  height: 36px;
  border-radius: 10px;
  border: 0.5px solid var(--line);
  background: var(--card);
  cursor: pointer;
  display: flex;
  align-items: center;
  justify-content: center;
  color: var(--ink-2);
  position: relative;
  transition: background 0.15s;
}

.icon-btn:hover { background: var(--primary-soft); }

.icon-btn svg {
  width: 17px;
  height: 17px;
}

.bell-dot {
  position: absolute;
  top: 7px;
  right: 8px;
  width: 6px;
  height: 6px;
  background: var(--primary);
  border-radius: 50%;
  border: 1.5px solid var(--paper-2);
}

.top-divider {
  width: 0.5px;
  height: 22px;
  background: var(--line);
  margin: 0 4px;
}

.user-chip {
  display: flex;
  align-items: center;
  gap: 9px;
  padding: 4px 10px 4px 4px;
  border-radius: 999px;
  border: 0.5px solid var(--line);
  background: var(--card);
  cursor: pointer;
  transition: background 0.15s;
}

.user-chip:hover { background: var(--primary-soft); }

.user-avatar {
  width: 30px;
  height: 30px;
  border-radius: 50%;
  background: var(--primary);
  display: flex;
  align-items: center;
  justify-content: center;
  font-size: 13px;
  font-weight: 700;
  color: #FFFCF5;
  font-family: "Fraunces", serif;
}

.user-name {
  font-size: 13px;
  font-weight: 600;
  color: var(--ink);
  line-height: 1.2;
}

.user-role {
  font-size: 10px;
  color: var(--ink-3);
}
</style>
