import { describe, it, expect, beforeEach, vi } from 'vitest'
import { setActivePinia, createPinia } from 'pinia'
import { useAuth } from '@/composables/useAuth'
import { useAuthStore } from '@/stores/auth'
import * as authApi from '@/api/auth'

vi.mock('@/api/auth')

describe('composables/useAuth', () => {
  beforeEach(() => {
    setActivePinia(createPinia())
    vi.clearAllMocks()
  })

  // 1. login()が成功時にユーザー情報をstoreにセットする
  it('login()が成功時にユーザー情報をstoreにセットする', async () => {
    const mockUser = { id: 1, name: 'テストユーザー', email: 'test@example.com', role: 'user' as const }
    vi.mocked(authApi.login).mockResolvedValue(mockUser)

    const { login } = useAuth()
    const authStore = useAuthStore()

    await login('test@example.com', 'password123')

    expect(authStore.user).toEqual(mockUser)
    expect(authStore.isAuthenticated).toBe(true)
  })

  // 2. login()が失敗時にエラーをスローする
  it('login()が失敗時にエラーをスローする', async () => {
    vi.mocked(authApi.login).mockRejectedValue(new Error('Invalid credentials'))

    const { login } = useAuth()
    const authStore = useAuthStore()

    await expect(login('test@example.com', 'wrongpass')).rejects.toThrow()

    expect(authStore.user).toBeNull()
  })

  // 3. logout()がstoreのユーザーをクリアする
  it('logout()がstoreのユーザーをクリアする', async () => {
    vi.mocked(authApi.logout).mockResolvedValue(undefined)

    const { logout } = useAuth()
    const authStore = useAuthStore()
    authStore.setUser({ id: 1, name: 'テスト', email: 'test@example.com', role: 'user' })

    await logout()

    expect(authStore.user).toBeNull()
    expect(authStore.isAuthenticated).toBe(false)
  })
})
