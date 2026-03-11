import { useAuthStore } from '@/stores/auth'
import { login as apiLogin, logout as apiLogout } from '@/api/auth'
import type { AuthUser } from '@/types'

export function useAuth() {
  const authStore = useAuthStore()

  async function login(email: string, password: string): Promise<AuthUser> {
    const user = await apiLogin(email, password)
    authStore.setUser(user)
    return user
  }

  async function logout(): Promise<void> {
    await apiLogout()
    authStore.clearUser()
  }

  return { login, logout }
}
