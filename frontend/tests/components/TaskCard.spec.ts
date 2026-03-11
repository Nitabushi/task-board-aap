import { describe, it, expect } from 'vitest'
import { mount } from '@vue/test-utils'
import TaskCard from '@/components/TaskCard.vue'
import type { Task } from '@/types'

const baseTask: Task = {
  id: 1,
  user_id: 1,
  title: 'テストタスク',
  description: 'テスト説明文',
  status: 'todo',
  priority: 'high',
  due_date: '2026-03-14',
  created_at: '2026-03-08T00:00:00.000000Z',
  updated_at: '2026-03-08T00:00:00.000000Z',
}

describe('TaskCard', () => {
  // 1. タスク情報を正しく表示する
  it('タスク情報を正しく表示する', () => {
    const wrapper = mount(TaskCard, { props: { task: baseTask } })

    expect(wrapper.text()).toContain('テストタスク')
    expect(wrapper.text()).toContain('高')
    expect(wrapper.text()).toContain('2026-03-14')
  })

  // 2. 優先度バッジの色が正しく表示される
  it('優先度バッジの色が正しく表示される（高=赤、中=黄、低=緑）', () => {
    const highWrapper = mount(TaskCard, { props: { task: { ...baseTask, priority: 'high' } } })
    expect(highWrapper.find('.bg-red-100').exists()).toBe(true)
    expect(highWrapper.text()).toContain('高')

    const mediumWrapper = mount(TaskCard, {
      props: { task: { ...baseTask, priority: 'medium' } },
    })
    expect(mediumWrapper.find('.bg-yellow-100').exists()).toBe(true)
    expect(mediumWrapper.text()).toContain('中')

    const lowWrapper = mount(TaskCard, { props: { task: { ...baseTask, priority: 'low' } } })
    expect(lowWrapper.find('.bg-green-100').exists()).toBe(true)
    expect(lowWrapper.text()).toContain('低')
  })

  // 3. due_dateがnullの場合は期限日が非表示
  it('due_dateがnullの場合は期限日が非表示', () => {
    const wrapper = mount(TaskCard, { props: { task: { ...baseTask, due_date: null } } })

    expect(wrapper.text()).not.toContain('期限:')
  })

  // 4. カードクリックでemitが発火する
  it('カードクリックでclickイベントが発火する', async () => {
    const wrapper = mount(TaskCard, { props: { task: baseTask } })

    await wrapper.trigger('click')

    expect(wrapper.emitted('click')).toBeTruthy()
    expect(wrapper.emitted('click')![0]).toEqual([baseTask])
  })
})
