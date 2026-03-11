<script setup lang="ts">
import type { Task } from '@/types'

const props = defineProps<{
  task: Task
}>()

const emit = defineEmits<{
  click: [task: Task]
}>()

const priorityLabel: Record<string, string> = {
  high: '高',
  medium: '中',
  low: '低',
}

const priorityClass: Record<string, string> = {
  high: 'bg-red-100 text-red-700',
  medium: 'bg-yellow-100 text-yellow-700',
  low: 'bg-green-100 text-green-700',
}
</script>

<template>
  <div
    class="bg-white rounded-lg shadow p-4 cursor-pointer hover:shadow-md transition-shadow border border-gray-100"
    @click="emit('click', props.task)"
  >
    <div class="flex items-start justify-between gap-2 mb-2">
      <h3 class="font-medium text-gray-900 text-sm leading-snug">{{ task.title }}</h3>
      <span
        class="flex-shrink-0 text-xs px-2 py-0.5 rounded-full font-medium"
        :class="priorityClass[task.priority]"
      >
        {{ priorityLabel[task.priority] }}
      </span>
    </div>
    <p v-if="task.description" class="text-gray-500 text-xs mb-2 line-clamp-2">
      {{ task.description }}
    </p>
    <p v-if="task.due_date" class="text-gray-400 text-xs">期限: {{ task.due_date }}</p>
  </div>
</template>
