import { describe, it, expect, beforeEach, vi } from 'vitest'
import { setActivePinia, createPinia } from 'pinia'
import { useAuthStore } from '@/stores/auth'
import * as authApi from '@/api/auth'

vi.mock('@/api/auth')

describe('stores/auth', () => {
  beforeEach(() => {
    setActivePinia(createPinia())
    vi.clearAllMocks()
  })

  // 1. 初期状態でuserがnull・checkedがfalse
  it('初期状態でuserがnull・checkedがfalse', () => {
    const store = useAuthStore()

    expect(store.user).toBeNull()
    expect(store.checked).toBe(false)
    expect(store.isAuthenticated).toBe(false)
    expect(store.isAdmin).toBe(false)
  })

  // 2. fetchUser()成功でuser・checkedが更新される
  it('fetchUser()成功でuserとcheckedが更新される', async () => {
    const mockUser = { id: 1, name: '管理者太郎', email: 'admin@example.com', role: 'admin' as const }
    vi.mocked(authApi.fetchCurrentUser).mockResolvedValue(mockUser)

    const store = useAuthStore()
    await store.fetchUser()

    expect(store.user).toEqual(mockUser)
    expect(store.checked).toBe(true)
    expect(store.isAuthenticated).toBe(true)
  })

  // 2-b. fetchUser()失敗でuserがnull・checkedはtrue
  it('fetchUser()失敗でuserがnullのままcheckedがtrueになる', async () => {
    vi.mocked(authApi.fetchCurrentUser).mockRejectedValue(new Error('Unauthorized'))

    const store = useAuthStore()
    await store.fetchUser()

    expect(store.user).toBeNull()
    expect(store.checked).toBe(true)
  })

  // 3. isAdmin computedが正しく動作する
  it('isAdmin: adminロールのときtrueを返す', () => {
    const store = useAuthStore()
    store.setUser({ id: 1, name: '管理者', email: 'admin@example.com', role: 'admin' })

    expect(store.isAdmin).toBe(true)
  })

  it('isAdmin: userロールのときfalseを返す', () => {
    const store = useAuthStore()
    store.setUser({ id: 2, name: '一般', email: 'user@example.com', role: 'user' })

    expect(store.isAdmin).toBe(false)
  })

  // clearUser()でuserがnullになる
  it('clearUser()でuserがnullになる', () => {
    const store = useAuthStore()
    store.setUser({ id: 1, name: '管理者', email: 'admin@example.com', role: 'admin' })
    store.clearUser()

    expect(store.user).toBeNull()
    expect(store.isAuthenticated).toBe(false)
  })
})
