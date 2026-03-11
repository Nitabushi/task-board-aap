import { describe, it, expect } from 'vitest'
import { mount } from '@vue/test-utils'
import UserModal from '@/components/UserModal.vue'
import type { User } from '@/types'

const baseUser: User = {
  id: 2,
  name: '一般花子',
  email: 'user1@example.com',
  role: 'user',
  deleted_at: null,
  created_at: '2026-03-08T00:00:00.000000Z',
  updated_at: '2026-03-08T00:00:00.000000Z',
}

describe('UserModal', () => {
  // 1. 作成モードでパスワードが必須表示
  it('作成モードでパスワードフィールドに必須マーク（*）が表示される', () => {
    const wrapper = mount(UserModal, { props: { user: null } })

    expect(wrapper.text()).toContain('ユーザー作成')
    // パスワードラベルに * が含まれ、「空欄で変更なし」が表示されない
    const passwordLabel = wrapper.findAll('label').find((l) => l.text().includes('パスワード'))
    expect(passwordLabel?.text()).toContain('*')
    expect(wrapper.text()).not.toContain('空欄で変更なし')
  })

  // 2. 編集モードでパスワードが任意表示
  it('編集モードでパスワードフィールドに「空欄で変更なし」が表示される', () => {
    const wrapper = mount(UserModal, { props: { user: baseUser } })

    expect(wrapper.text()).toContain('ユーザー編集')
    expect(wrapper.text()).toContain('空欄で変更なし')
  })

  // 3. バリデーションエラーが表示される
  it('名前未入力で保存するとバリデーションエラーが表示される', async () => {
    const wrapper = mount(UserModal, { props: { user: null } })

    // 名前フィールドを空のままにしてメールだけ入力
    const inputs = wrapper.findAll('input')
    await inputs[1].setValue('test@example.com') // email
    await inputs[2].setValue('password123') // password

    await wrapper.find('form').trigger('submit')

    expect(wrapper.text()).toContain('名前は必須です。')
  })

  // 3-b. サーバーエラーが表示される
  it('setServerErrors()でサーバーバリデーションエラーが表示される', async () => {
    const wrapper = mount(UserModal, { props: { user: null } })

    const vm = wrapper.vm as unknown as { setServerErrors: (e: Record<string, string[]>) => void }
    vm.setServerErrors({ email: ['このメールアドレスはすでに使用されています。'] })
    await wrapper.vm.$nextTick()

    expect(wrapper.text()).toContain('このメールアドレスはすでに使用されています。')
  })

  // キャンセルボタンでcloseイベント
  it('キャンセルボタンクリックでcloseイベントが発火する', async () => {
    const wrapper = mount(UserModal, { props: { user: null } })

    const cancelButton = wrapper.findAll('button').find((b) => b.text() === 'キャンセル')
    await cancelButton!.trigger('click')

    expect(wrapper.emitted('close')).toBeTruthy()
  })
})
