import { defineStore } from 'pinia'
import { ref, computed } from 'vue'
import type { AuthUser } from '@/types'
import { fetchCurrentUser } from '@/api/auth'

export const useAuthStore = defineStore('auth', () => {
  const user = ref<AuthUser | null>(null)
  const checked = ref(false)

  const isAuthenticated = computed(() => user.value !== null)
  const isAdmin = computed(() => user.value?.role === 'admin')

  async function fetchUser() {
    try {
      user.value = await fetchCurrentUser()
    } catch {
      user.value = null
    } finally {
      checked.value = true
    }
  }

  function setUser(u: AuthUser | null) {
    user.value = u
    if (u !== null) checked.value = true
  }

  function clearUser() {
    user.value = null
  }

  return { user, checked, isAuthenticated, isAdmin, fetchUser, setUser, clearUser }
})
