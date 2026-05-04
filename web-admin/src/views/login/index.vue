<template>
  <div style="min-height:100vh;background:#F5EDE0;display:flex;align-items:center;justify-content:center;">
    <div style="background:#FFFCF5;border-radius:24px;padding:48px 40px;width:380px;box-shadow:0 20px 60px rgba(120,80,40,0.12),0 0 0 0.5px rgba(42,37,32,0.08);">
      <!-- brand -->
      <div style="text-align:center;margin-bottom:36px;">
        <div style="width:56px;height:56px;border-radius:16px;background:#D97757;color:#FFFCF5;font-size:28px;font-weight:700;display:flex;align-items:center;justify-content:center;margin:0 auto 14px;box-shadow:0 4px 14px rgba(217,119,87,0.3);">安</div>
        <div style="font-size:20px;font-weight:700;color:#2A2520;">安然画室</div>
        <div style="font-size:13px;color:#8A7E70;margin-top:4px;">讲师工作台</div>
      </div>
      <!-- form -->
      <div style="margin-bottom:16px;">
        <label style="display:block;margin-bottom:6px;font-size:13px;color:#2A2520;font-weight:500;">用户名</label>
        <input v-model="form.username" class="adm-input" style="width:100%;box-sizing:border-box;" placeholder="请输入用户名" @keyup.enter="handleLogin"/>
      </div>
      <div style="margin-bottom:28px;">
        <label style="display:block;margin-bottom:6px;font-size:13px;color:#2A2520;font-weight:500;">密码</label>
        <input v-model="form.password" type="password" class="adm-input" style="width:100%;box-sizing:border-box;" placeholder="请输入密码" @keyup.enter="handleLogin"/>
      </div>
      <button class="adm-btn primary" style="width:100%;height:42px;border-radius:12px;font-size:15px;" :disabled="loading" @click="handleLogin">
        {{ loading ? '登录中…' : '登录' }}
      </button>
      <div v-if="error" style="margin-top:14px;font-size:13px;color:#A0473F;text-align:center;">{{ error }}</div>
      <div style="margin-top:20px;font-size:12px;color:#8A7E70;text-align:center;">默认账号：admin / admin123</div>
    </div>
  </div>
</template>

<script setup>
import { ref, reactive } from 'vue'
import { useRouter } from 'vue-router'
import { useAdminStore } from '@/stores/admin.js'

const router = useRouter()
const adminStore = useAdminStore()
const form = reactive({ username: 'admin', password: 'admin123' })
const loading = ref(false)
const error = ref('')

async function handleLogin() {
  if (!form.username || !form.password) { error.value = '请输入用户名和密码'; return }
  loading.value = true; error.value = ''
  try {
    await adminStore.login(form.username, form.password)
    router.push('/dashboard')
  } catch(e) {
    error.value = e?.message || '登录失败，请检查账号密码'
  } finally { loading.value = false }
}
</script>
