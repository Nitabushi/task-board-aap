<script setup lang="ts">
import { useAuthStore } from '@/stores/auth'
import { useRouter } from 'vue-router'
import { logout } from '@/api/auth'

const authStore = useAuthStore()
const router = useRouter()

async function handleLogout() {
  try {
    await logout()
  } finally {
    authStore.clearUser()
    router.push({ name: 'login' })
  }
}
</script>

<template>
  <header class="bg-blue-600 text-white shadow">
    <div class="max-w-7xl mx-auto px-4 py-3 flex items-center justify-between">
      <div class="flex items-center gap-6">
        <h1 class="text-xl font-bold">Task Board</h1>
        <nav class="flex gap-4">
          <RouterLink
            to="/tasks"
            class="hover:text-blue-200 transition-colors"
            active-class="text-blue-200 underline"
          >
            タスク
          </RouterLink>
          <RouterLink
            v-if="authStore.isAdmin"
            to="/admin/users"
            class="hover:text-blue-200 transition-colors"
            active-class="text-blue-200 underline"
          >
            ユーザー管理
          </RouterLink>
        </nav>
      </div>
      <div class="flex items-center gap-4">
        <span class="text-sm">{{ authStore.user?.name }}</span>
        <button
          class="bg-white text-blue-600 px-3 py-1 rounded text-sm hover:bg-blue-50 transition-colors"
          @click="handleLogout"
        >
          ログアウト
        </button>
      </div>
    </div>
  </header>
</template>
