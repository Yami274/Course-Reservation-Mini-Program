<template>
  <div v-if="route.path === '/login'">
    <router-view />
  </div>
  <div v-else class="admin-root">
    <Sidebar :pending-count="adminStore.dashboardStats.pendingCount" :warning-count="adminStore.dashboardStats.warningCount" />
    <div class="adm-main">
      <TopBar :title="pageTitle" :pending-count="adminStore.dashboardStats.pendingCount" />
      <div class="adm-content">
        <router-view />
      </div>
    </div>
  </div>
</template>

<script setup>
import { computed, onMounted } from 'vue'
import { useRoute } from 'vue-router'
import { useAdminStore } from '@/stores/admin.js'
import Sidebar from '@/components/layout/Sidebar.vue'
import TopBar from '@/components/layout/TopBar.vue'

const route = useRoute()
const adminStore = useAdminStore()

const pageTitles = {
  '/dashboard': '数据总览',
  '/courses': '课程管理',
  '/orders': '预约审核',
  '/students': '学员管理',
  '/teachers': '讲师管理',
  '/locations': '上课地点',
  '/categories': '分类管理',
  '/settings/banners': '轮播图配置',
  '/settings/notices': '公告管理',
  '/settings': '系统设置',
  '/push': '消息推送',
}

const pageTitle = computed(() => pageTitles[route.path] || '数据总览')

onMounted(() => {
  adminStore.fetchDashboardStats()
})
</script>
