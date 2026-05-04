import { createRouter, createWebHashHistory } from 'vue-router'

const router = createRouter({
  history: createWebHashHistory(),
  routes: [
    { path: '/login', component: () => import('@/views/login/index.vue'), meta: { public: true } },
    { path: '/', redirect: '/dashboard' },
    { path: '/dashboard', component: () => import('@/views/dashboard/index.vue') },
    { path: '/courses', component: () => import('@/views/courses/index.vue') },
    { path: '/orders', component: () => import('@/views/orders/index.vue') },
    { path: '/students', component: () => import('@/views/students/index.vue') },
    { path: '/teachers', component: () => import('@/views/teachers/index.vue') },
    { path: '/locations', component: () => import('@/views/locations/index.vue') },
    { path: '/settings/banners', component: () => import('@/views/settings/banners/index.vue') },
    { path: '/categories', component: () => import('@/views/categories/index.vue') },
    { path: '/settings/notices', component: () => import('@/views/settings/notices/index.vue') },
    { path: '/push', component: () => import('@/views/push/index.vue') },
    { path: '/settings', redirect: '/settings/banners' },
  ]
})

router.beforeEach((to) => {
  const token = localStorage.getItem('admin_token')
  if (!to.meta.public && !token) return '/login'
})

export default router
