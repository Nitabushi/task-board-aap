import { describe, it, expect, beforeEach, vi } from 'vitest'
import { mount } from '@vue/test-utils'
import { createTestingPinia } from '@pinia/testing'
import UserTable from '@/components/UserTable.vue'
import { useAuthStore } from '@/stores/auth'
import type { User } from '@/types'

const makeUsers = (): User[] => [
  {
    id: 1,
    name: '管理者太郎',
    email: 'admin@example.com',
    role: 'admin',
    deleted_at: null,
    created_at: '2026-03-08T00:00:00.000000Z',
    updated_at: '2026-03-08T00:00:00.000000Z',
  },
  {
    id: 2,
    name: '一般花子',
    email: 'user1@example.com',
    role: 'user',
    deleted_at: null,
    created_at: '2026-03-08T00:00:00.000000Z',
    updated_at: '2026-03-08T00:00:00.000000Z',
  },
  {
    id: 3,
    name: '削除済み次郎',
    email: 'user2@example.com',
    role: 'user',
    deleted_at: '2026-03-08T12:00:00.000000Z',
    created_at: '2026-03-08T00:00:00.000000Z',
    updated_at: '2026-03-08T12:00:00.000000Z',
  },
]

describe('UserTable', () => {
  let pinia: ReturnType<typeof createTestingPinia>

  beforeEach(() => {
    pinia = createTestingPinia({ createSpy: vi.fn })
    const authStore = useAuthStore(pinia)
    authStore.user = { id: 1, name: '管理者太郎', email: 'admin@example.com', role: 'admin' }
  })

  function mountTable(users: User[] = makeUsers()) {
    return mount(UserTable, {
      props: { users },
      global: { plugins: [pinia] },
    })
  }

  // 1. ユーザー一覧が表示される
  it('ユーザー一覧が表示される', () => {
    const wrapper = mountTable()

    expect(wrapper.text()).toContain('管理者太郎')
    expect(wrapper.text()).toContain('一般花子')
    expect(wrapper.text()).toContain('削除済み次郎')
  })

  // 2. 論理削除済みユーザーがグレーアウトで表示される
  it('論理削除済みユーザーの行にopacity-50クラスが当たる', () => {
    const wrapper = mountTable()

    const rows = wrapper.findAll('tbody tr')
    const deletedRow = rows[2]
    expect(deletedRow.classes()).toContain('opacity-50')
  })

  // 3. 論理削除済みユーザーに編集・削除ボタンがない
  it('論理削除済みユーザー行に編集・削除ボタンが存在しない', () => {
    const wrapper = mountTable()

    const rows = wrapper.findAll('tbody tr')
    const deletedRow = rows[2]
    const buttons = deletedRow.findAll('button')
    const editBtn = buttons.find((b) => b.text() === '編集')
    const deleteBtn = buttons.find((b) => b.text() === '削除')
    expect(editBtn).toBeUndefined()
    expect(deleteBtn).toBeUndefined()
  })

  // 4. 自分自身に削除ボタンがない
  it('ログインユーザー自身の行に削除ボタンが存在しない', () => {
    const wrapper = mountTable()

    const rows = wrapper.findAll('tbody tr')
    // id:1 の管理者太郎がログイン中（beforeEach で設定）
    const selfRow = rows[0]
    const buttons = selfRow.findAll('button')
    const deleteBtn = buttons.find((b) => b.text() === '削除')
    expect(deleteBtn).toBeUndefined()
  })
})
