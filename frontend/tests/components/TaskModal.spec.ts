import { describe, it, expect } from 'vitest'
import { mount } from '@vue/test-utils'
import TaskModal from '@/components/TaskModal.vue'
import type { Task } from '@/types'

const baseTask: Task = {
  id: 1,
  user_id: 1,
  title: '既存タスク',
  description: '既存の説明文',
  status: 'in_progress',
  priority: 'high',
  due_date: '2026-03-20',
  created_at: '2026-03-08T00:00:00.000000Z',
  updated_at: '2026-03-08T00:00:00.000000Z',
}

describe('TaskModal', () => {
  // 1. 作成モードで正しいタイトルが表示される
  it('作成モードで「タスク作成」が表示される', () => {
    const wrapper = mount(TaskModal, { props: { task: null } })

    expect(wrapper.text()).toContain('タスク作成')
  })

  // 2. 編集モードで正しいタイトルが表示される
  it('編集モードで「タスク編集」が表示される', () => {
    const wrapper = mount(TaskModal, { props: { task: baseTask } })

    expect(wrapper.text()).toContain('タスク編集')
  })

  // 3. 編集モードで既存データが初期値として設定される
  it('編集モードでフォームに既存データが入力済み', () => {
    const wrapper = mount(TaskModal, { props: { task: baseTask } })

    const titleInput = wrapper.find('input[type="text"]')
    expect((titleInput.element as HTMLInputElement).value).toBe('既存タスク')

    const statusSelect = wrapper.findAll('select')[0]
    expect((statusSelect.element as HTMLSelectElement).value).toBe('in_progress')

    const prioritySelect = wrapper.findAll('select')[1]
    expect((prioritySelect.element as HTMLSelectElement).value).toBe('high')
  })

  // 4. 編集モードで削除ボタンが表示される
  it('編集モードで削除ボタンが表示される', () => {
    const wrapper = mount(TaskModal, { props: { task: baseTask } })

    expect(wrapper.text()).toContain('削除')
  })

  // 5. 作成モードで削除ボタンが表示されない
  it('作成モードで削除ボタンが表示されない', () => {
    const wrapper = mount(TaskModal, { props: { task: null } })

    const buttons = wrapper.findAll('button')
    const deleteButton = buttons.find((b) => b.text() === '削除')
    expect(deleteButton).toBeUndefined()
  })

  // 6. タイトル未入力でバリデーションエラーが表示される
  it('タイトル未入力で保存するとバリデーションエラーが表示される', async () => {
    const wrapper = mount(TaskModal, { props: { task: null } })

    const titleInput = wrapper.find('input[type="text"]')
    await titleInput.setValue('')

    await wrapper.find('form').trigger('submit')

    expect(wrapper.text()).toContain('タイトルは必須です。')
  })

  // 7. 保存ボタンクリックでsubmitイベントが発火する
  it('タイトル入力後に保存するとsubmitイベントが発火する', async () => {
    const wrapper = mount(TaskModal, { props: { task: null } })

    await wrapper.find('input[type="text"]').setValue('新しいタスク')

    await wrapper.find('form').trigger('submit')

    expect(wrapper.emitted('submit')).toBeTruthy()
    const emittedData = wrapper.emitted('submit')![0][0] as { title: string }
    expect(emittedData.title).toBe('新しいタスク')
  })

  // 8. キャンセルボタンクリックでcloseイベントが発火する
  it('キャンセルボタンクリックでcloseイベントが発火する', async () => {
    const wrapper = mount(TaskModal, { props: { task: null } })

    const cancelButton = wrapper.findAll('button').find((b) => b.text() === 'キャンセル')
    await cancelButton!.trigger('click')

    expect(wrapper.emitted('close')).toBeTruthy()
  })
})
