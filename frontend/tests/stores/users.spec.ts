import { describe, it, expect, beforeEach, vi } from 'vitest'
import { setActivePinia, createPinia } from 'pinia'
import { useUsersStore } from '@/stores/users'
import * as usersApi from '@/api/users'
import type { User } from '@/types'

vi.mock('@/api/users')

const makeUser = (overrides: Partial<User> = {}): User => ({
  id: 1,
  name: 'テストユーザー',
  email: 'test@example.com',
  role: 'user',
  deleted_at: null,
  created_at: '2026-03-08T00:00:00.000000Z',
  updated_at: '2026-03-08T00:00:00.000000Z',
  ...overrides,
})

describe('stores/users', () => {
  beforeEach(() => {
    setActivePinia(createPinia())
    vi.clearAllMocks()
  })

  // 1. fetchUsers()でusersが更新される
  it('fetchUsers()でusersが更新される', async () => {
    const mockUsers = [makeUser({ id: 1 }), makeUser({ id: 2, name: '2番目', email: 'second@example.com' })]
    vi.mocked(usersApi.fetchUsers).mockResolvedValue(mockUsers)

    const store = useUsersStore()
    await store.fetchUsers()

    expect(store.users).toHaveLength(2)
    expect(store.users[0].name).toBe('テストユーザー')
    expect(store.users[1].name).toBe('2番目')
  })

  // 1-b. fetchUsers()失敗でerrorが設定される
  it('fetchUsers()失敗でerrorが設定される', async () => {
    vi.mocked(usersApi.fetchUsers).mockRejectedValue(new Error('Network error'))

    const store = useUsersStore()
    await store.fetchUsers()

    expect(store.users).toHaveLength(0)
    expect(store.error).toBe('ユーザーの取得に失敗しました。')
  })

  // 2. createUser()でusersに追加される
  it('createUser()でusersに追加される', async () => {
    const existingUser = makeUser({ id: 1, name: '既存ユーザー' })
    const newUser = makeUser({ id: 2, name: '新規ユーザー', email: 'new@example.com' })
    vi.mocked(usersApi.createUser).mockResolvedValue(newUser)

    const store = useUsersStore()
    store.users = [existingUser]

    await store.createUser({ name: '新規ユーザー', email: 'new@example.com', password: 'password1', role: 'user' })

    expect(store.users).toHaveLength(2)
    expect(store.users[1].name).toBe('新規ユーザー')
  })

  // 3. updateUser()でusers内の該当ユーザーが更新される
  it('updateUser()でusers内の該当IDのユーザーが更新される', async () => {
    const original = makeUser({ id: 1, name: '元の名前' })
    const updated = makeUser({ id: 1, name: '更新後の名前', email: 'updated@example.com' })
    vi.mocked(usersApi.updateUser).mockResolvedValue(updated)

    const store = useUsersStore()
    store.users = [original]

    await store.updateUser(1, { name: '更新後の名前', email: 'updated@example.com', password: '', role: 'user' })

    expect(store.users[0].name).toBe('更新後の名前')
    expect(store.users[0].email).toBe('updated@example.com')
  })

  // 4. deleteUser()でfetchUsers()が再呼び出しされusersが更新される
  it('deleteUser()でfetchUsers()が再呼び出しされusersが更新される', async () => {
    const remainingUser = makeUser({ id: 2, name: '残るユーザー', email: 'remain@example.com' })
    vi.mocked(usersApi.deleteUser).mockResolvedValue(undefined)
    vi.mocked(usersApi.fetchUsers).mockResolvedValue([remainingUser])

    const store = useUsersStore()
    store.users = [makeUser({ id: 1 }), remainingUser]

    await store.deleteUser(1)

    expect(usersApi.deleteUser).toHaveBeenCalledWith(1)
    expect(usersApi.fetchUsers).toHaveBeenCalled()
    expect(store.users).toHaveLength(1)
    expect(store.users[0].id).toBe(2)
  })
})
