import { describe, it, expect, beforeEach, vi } from 'vitest'
import { setActivePinia, createPinia } from 'pinia'
import { useTasks } from '@/composables/useTasks'
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

describe('composables/useTasks', () => {
  beforeEach(() => {
    setActivePinia(createPinia())
    vi.clearAllMocks()
  })

  // 1. fetchTasks()がAPIを呼び出しstoreを更新する
  it('fetchTasks()がAPIを呼び出しstoreを更新する', async () => {
    const mockTasks = [makeTask({ id: 1 }), makeTask({ id: 2, title: '2番目' })]
    vi.mocked(tasksApi.fetchTasks).mockResolvedValue(mockTasks)

    const { fetchTasks } = useTasks()
    const store = useTasksStore()

    await fetchTasks()

    expect(tasksApi.fetchTasks).toHaveBeenCalledOnce()
    expect(store.tasks).toEqual(mockTasks)
  })

  // 2. createTask()が成功時にstoreに追加される
  it('createTask()が成功時にstoreに追加される', async () => {
    const newTask = makeTask({ id: 1, title: '新規タスク' })
    vi.mocked(tasksApi.createTask).mockResolvedValue(newTask)

    const { createTask } = useTasks()
    const store = useTasksStore()

    await createTask({ title: '新規タスク', description: null, status: 'todo', priority: 'medium', due_date: null })

    expect(store.tasks).toHaveLength(1)
    expect(store.tasks[0].title).toBe('新規タスク')
  })

  // 3. updateTask()が成功時にstoreが更新される
  it('updateTask()が成功時にstoreが更新される', async () => {
    const original = makeTask({ id: 1, title: '元タイトル' })
    const updated = makeTask({ id: 1, title: '更新後タイトル' })
    vi.mocked(tasksApi.updateTask).mockResolvedValue(updated)

    const { updateTask } = useTasks()
    const store = useTasksStore()
    store.tasks = [original]

    await updateTask(1, { title: '更新後タイトル', description: null, status: 'todo', priority: 'medium', due_date: null })

    expect(store.tasks[0].title).toBe('更新後タイトル')
  })

  // 4. deleteTask()が成功時にstoreから削除される
  it('deleteTask()が成功時にstoreから削除される', async () => {
    vi.mocked(tasksApi.deleteTask).mockResolvedValue(undefined)

    const { deleteTask } = useTasks()
    const store = useTasksStore()
    store.tasks = [makeTask({ id: 1 }), makeTask({ id: 2, title: '残るタスク' })]

    await deleteTask(1)

    expect(store.tasks).toHaveLength(1)
    expect(store.tasks[0].id).toBe(2)
  })
})
