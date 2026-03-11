import { describe, it, expect } from 'vitest'
import { mount } from '@vue/test-utils'
import TaskBoard from '@/components/TaskBoard.vue'
import type { Task } from '@/types'

const makeTasks = (): Task[] => [
  {
    id: 1,
    user_id: 1,
    title: 'TODOタスク',
    description: null,
    status: 'todo',
    priority: 'high',
    due_date: null,
    created_at: '2026-03-08T00:00:00.000000Z',
    updated_at: '2026-03-08T00:00:00.000000Z',
  },
  {
    id: 2,
    user_id: 1,
    title: '進行中タスク',
    description: '説明文あり',
    status: 'in_progress',
    priority: 'medium',
    due_date: null,
    created_at: '2026-03-08T00:00:00.000000Z',
    updated_at: '2026-03-08T00:00:00.000000Z',
  },
  {
    id: 3,
    user_id: 1,
    title: '完了タスク',
    description: null,
    status: 'done',
    priority: 'low',
    due_date: null,
    created_at: '2026-03-08T00:00:00.000000Z',
    updated_at: '2026-03-08T00:00:00.000000Z',
  },
]

describe('TaskBoard', () => {
  // 1. 3つのカラム（TODO/進行中/完了）が表示される
  it('3つのカラム（TODO/進行中/完了）が表示される', () => {
    const wrapper = mount(TaskBoard, { props: { tasks: makeTasks() } })

    expect(wrapper.text()).toContain('TODO')
    expect(wrapper.text()).toContain('進行中')
    expect(wrapper.text()).toContain('完了')
  })

  // 2. タスクが正しいカラムに表示される
  it('タスクがstatusに対応するカラムに表示される', () => {
    const wrapper = mount(TaskBoard, { props: { tasks: makeTasks() } })

    expect(wrapper.text()).toContain('TODOタスク')
    expect(wrapper.text()).toContain('進行中タスク')
    expect(wrapper.text()).toContain('完了タスク')
  })

  // 3. ステータスフィルタでタスクが絞り込まれる
  it('ステータスフィルタでタスクが絞り込まれる', async () => {
    const wrapper = mount(TaskBoard, { props: { tasks: makeTasks() } })

    const selects = wrapper.findAll('select')
    const statusSelect = selects[0]
    await statusSelect.setValue('todo')

    expect(wrapper.text()).toContain('TODOタスク')
    expect(wrapper.text()).not.toContain('進行中タスク')
    expect(wrapper.text()).not.toContain('完了タスク')
  })

  // 4. 優先度フィルタでタスクが絞り込まれる
  it('優先度フィルタでタスクが絞り込まれる', async () => {
    const wrapper = mount(TaskBoard, { props: { tasks: makeTasks() } })

    const selects = wrapper.findAll('select')
    const prioritySelect = selects[1]
    await prioritySelect.setValue('high')

    expect(wrapper.text()).toContain('TODOタスク')
    expect(wrapper.text()).not.toContain('進行中タスク')
    expect(wrapper.text()).not.toContain('完了タスク')
  })

  // 5. 検索キーワードでタスクが絞り込まれる
  it('検索キーワードでタスクが絞り込まれる', async () => {
    const wrapper = mount(TaskBoard, { props: { tasks: makeTasks() } })

    const searchInput = wrapper.find('input[type="text"]')
    await searchInput.setValue('進行中')

    expect(wrapper.text()).not.toContain('TODOタスク')
    expect(wrapper.text()).toContain('進行中タスク')
    expect(wrapper.text()).not.toContain('完了タスク')
  })

  // 5-b. 説明文でも検索できる
  it('説明文のキーワードでも検索できる', async () => {
    const wrapper = mount(TaskBoard, { props: { tasks: makeTasks() } })

    const searchInput = wrapper.find('input[type="text"]')
    await searchInput.setValue('説明文あり')

    expect(wrapper.text()).not.toContain('TODOタスク')
    expect(wrapper.text()).toContain('進行中タスク')
  })

  // 6. フィルタと検索の組み合わせが機能する
  it('ステータスフィルタと検索キーワードを同時に適用できる', async () => {
    const tasks: Task[] = [
      ...makeTasks(),
      {
        id: 4,
        user_id: 1,
        title: 'TODO高優先',
        description: null,
        status: 'todo',
        priority: 'high',
        due_date: null,
        created_at: '2026-03-08T00:00:00.000000Z',
        updated_at: '2026-03-08T00:00:00.000000Z',
      },
    ]
    const wrapper = mount(TaskBoard, { props: { tasks } })

    const selects = wrapper.findAll('select')
    await selects[0].setValue('todo')

    const searchInput = wrapper.find('input[type="text"]')
    await searchInput.setValue('高優先')

    expect(wrapper.text()).not.toContain('TODOタスク')
    expect(wrapper.text()).toContain('TODO高優先')
    expect(wrapper.text()).not.toContain('進行中タスク')
  })
})
