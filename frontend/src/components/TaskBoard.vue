<script setup lang="ts">
import { ref, computed } from 'vue'
import type { Task, TaskStatus, TaskPriority } from '@/types'
import TaskCard from './TaskCard.vue'

const props = defineProps<{
  tasks: Task[]
}>()

const emit = defineEmits<{
  clickTask: [task: Task]
  changeStatus: [taskId: number, status: TaskStatus]
}>()

const filterStatus = ref<TaskStatus | ''>('')
const filterPriority = ref<TaskPriority | ''>('')
const searchKeyword = ref('')

const filteredTasks = computed(() => {
  return props.tasks.filter((task) => {
    if (filterStatus.value && task.status !== filterStatus.value) return false
    if (filterPriority.value && task.priority !== filterPriority.value) return false
    if (searchKeyword.value) {
      const kw = searchKeyword.value.toLowerCase()
      const inTitle = task.title.toLowerCase().includes(kw)
      const inDesc = task.description?.toLowerCase().includes(kw) ?? false
      if (!inTitle && !inDesc) return false
    }
    return true
  })
})

const columns: { status: TaskStatus; label: string; color: string }[] = [
  { status: 'todo', label: 'TODO', color: 'bg-gray-100' },
  { status: 'in_progress', label: '進行中', color: 'bg-blue-50' },
  { status: 'done', label: '完了', color: 'bg-green-50' },
]

function tasksByStatus(status: TaskStatus) {
  return filteredTasks.value.filter((t) => t.status === status)
}

const draggedTaskId = ref<number | null>(null)

function onDragStart(taskId: number) {
  draggedTaskId.value = taskId
}

function onDrop(status: TaskStatus) {
  if (draggedTaskId.value !== null) {
    const task = props.tasks.find((t) => t.id === draggedTaskId.value)
    if (task && task.status !== status) {
      emit('changeStatus', draggedTaskId.value, status)
    }
    draggedTaskId.value = null
  }
}
</script>

<template>
  <div>
    <!-- フィルター -->
    <div class="flex flex-wrap gap-3 mb-6">
      <input
        v-model="searchKeyword"
        type="text"
        placeholder="キーワード検索..."
        class="border border-gray-300 rounded px-3 py-1.5 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 w-48"
      />
      <select
        v-model="filterStatus"
        class="border border-gray-300 rounded px-3 py-1.5 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
      >
        <option value="">ステータス: 全て</option>
        <option value="todo">TODO</option>
        <option value="in_progress">進行中</option>
        <option value="done">完了</option>
      </select>
      <select
        v-model="filterPriority"
        class="border border-gray-300 rounded px-3 py-1.5 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
      >
        <option value="">優先度: 全て</option>
        <option value="high">高</option>
        <option value="medium">中</option>
        <option value="low">低</option>
      </select>
    </div>

    <!-- カンバンカラム -->
    <div class="grid grid-cols-3 gap-4">
      <div
        v-for="col in columns"
        :key="col.status"
        class="rounded-lg p-4 min-h-64"
        :class="col.color"
        @dragover.prevent
        @drop="onDrop(col.status)"
      >
        <div class="flex items-center justify-between mb-3">
          <h3 class="font-semibold text-gray-700">{{ col.label }}</h3>
          <span class="bg-white text-gray-500 text-xs px-2 py-0.5 rounded-full">
            {{ tasksByStatus(col.status).length }}
          </span>
        </div>
        <div class="space-y-2">
          <div
            v-for="task in tasksByStatus(col.status)"
            :key="task.id"
            draggable="true"
            @dragstart="onDragStart(task.id)"
          >
            <TaskCard :task="task" @click="emit('clickTask', task)" />
          </div>
        </div>
      </div>
    </div>
  </div>
</template>
