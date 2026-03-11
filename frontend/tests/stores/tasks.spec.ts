import { describe, it, expect, beforeEach, vi } from 'vitest'
import { setActivePinia, createPinia } from 'pinia'
import { useTasksStore } from '@/stores/tasks'
import * as tasksApi from '@/api/tasks'
import type { Task } from '@/types'

vi.mock('@/api/tasks')

const makeTask = (overrides: Partial<Task> = {}): Task => ({
  id: 1,
  user_id: 1,
  title: 'テストタスク',
  description: null,
  status: 'todo',
  priority: 'medium',
  due_date: null,
  created_at: '2026-03-08T00:00:00.000000Z',
  updated_at: '2026-03-08T00:00:00.000000Z',
  ...overrides,
})

describe('stores/tasks', () => {
  beforeEach(() => {
    setActivePinia(createPinia())
    vi.clearAllMocks()
  })

  // 1. fetchTasks()でtasksが更新される
  it('fetchTasks()でtasksが更新される', async () => {
    const mockTasks = [makeTask({ id: 1 }), makeTask({ id: 2, title: '2番目' })]
    vi.mocked(tasksApi.fetchTasks).mockResolvedValue(mockTasks)

    const store = useTasksStore()
    await store.fetchTasks()

    expect(store.tasks).toHaveLength(2)
    expect(store.tasks[0].title).toBe('テストタスク')
    expect(store.tasks[1].title).toBe('2番目')
  })

  // 1-b. fetchTasks()失敗でerrorが設定される
  it('fetchTasks()失敗でerrorが設定される', async () => {
    vi.mocked(tasksApi.fetchTasks).mockRejectedValue(new Error('Network error'))

    const store = useTasksStore()
    await store.fetchTasks()

    expect(store.tasks).toHaveLength(0)
    expect(store.error).toBe('タスクの取得に失敗しました。')
  })

  // 2. createTask()でtasksに追加される
  it('createTask()でtasksの先頭に追加される', async () => {
    const existingTask = makeTask({ id: 1, title: '既存タスク' })
    const newTask = makeTask({ id: 2, title: '新規タスク' })
    vi.mocked(tasksApi.createTask).mockResolvedValue(newTask)

    const store = useTasksStore()
    store.tasks = [existingTask]
    await store.createTask({
      title: '新規タスク',
      description: null,
      status: 'todo',
      priority: 'medium',
      due_date: null,
    })

    expect(store.tasks).toHaveLength(2)
    expect(store.tasks[0].title).toBe('新規タスク')
    expect(store.tasks[1].title).toBe('既存タスク')
  })

  // 3. updateTask()でtasks内の該当タスクが更新される
  it('updateTask()でtasks内の該当IDのタスクが更新される', async () => {
    const original = makeTask({ id: 1, title: '元のタイトル' })
    const updated = makeTask({ id: 1, title: '更新後タイトル', status: 'done' })
    vi.mocked(tasksApi.updateTask).mockResolvedValue(updated)

    const store = useTasksStore()
    store.tasks = [original]
    await store.updateTask(1, {
      title: '更新後タイトル',
      description: null,
      status: 'done',
      priority: 'medium',
      due_date: null,
    })

    expect(store.tasks[0].title).toBe('更新後タイトル')
    expect(store.tasks[0].status).toBe('done')
  })

  // 4. deleteTask()でtasksから除去される
  it('deleteTask()でtasksから該当タスクが除去される', async () => {
    vi.mocked(tasksApi.deleteTask).mockResolvedValue()

    const store = useTasksStore()
    store.tasks = [makeTask({ id: 1 }), makeTask({ id: 2, title: '残るタスク' })]
    await store.deleteTask(1)

    expect(store.tasks).toHaveLength(1)
    expect(store.tasks[0].id).toBe(2)
  })

  // updateTaskStatus()でstatusが更新される
  it('updateTaskStatus()でtasks内のstatusが更新される', async () => {
    const updated = makeTask({ id: 1, status: 'in_progress' })
    vi.mocked(tasksApi.updateTaskStatus).mockResolvedValue(updated)

    const store = useTasksStore()
    store.tasks = [makeTask({ id: 1, status: 'todo' })]
    await store.updateTaskStatus(1, 'in_progress')

    expect(store.tasks[0].status).toBe('in_progress')
  })
})
