<script setup lang="ts">
import { ref, computed, watch } from 'vue'
import type { Task, TaskFormData } from '@/types'

const props = defineProps<{
  task?: Task | null
}>()

const emit = defineEmits<{
  submit: [data: TaskFormData]
  delete: [task: Task]
  close: []
}>()

const isEdit = computed(() => !!props.task)

const form = ref<TaskFormData>({
  title: '',
  description: null,
  status: 'todo',
  priority: 'medium',
  due_date: null,
})

const errors = ref<Record<string, string>>({})
const submitting = ref(false)

watch(
  () => props.task,
  (task) => {
    if (task) {
      form.value = {
        title: task.title,
        description: task.description,
        status: task.status,
        priority: task.priority,
        due_date: task.due_date,
      }
    } else {
      form.value = {
        title: '',
        description: null,
        status: 'todo',
        priority: 'medium',
        due_date: null,
      }
    }
    errors.value = {}
  },
  { immediate: true },
)

function validate(): boolean {
  errors.value = {}
  if (!form.value.title.trim()) {
    errors.value.title = 'タイトルは必須です。'
  }
  return Object.keys(errors.value).length === 0
}

async function handleSubmit() {
  if (!validate()) return
  submitting.value = true
  try {
    emit('submit', { ...form.value })
  } finally {
    submitting.value = false
  }
}

function setServerErrors(errs: Record<string, string[]>) {
  errors.value = {}
  for (const [key, msgs] of Object.entries(errs)) {
    errors.value[key] = msgs[0]
  }
}

defineExpose({ setServerErrors })
</script>

<template>
  <div class="fixed inset-0 bg-black/50 flex items-center justify-center z-50">
    <div class="bg-white rounded-lg shadow-xl p-6 w-full max-w-lg mx-4 max-h-[90vh] overflow-y-auto">
      <div class="flex items-center justify-between mb-4">
        <h2 class="text-lg font-semibold">{{ isEdit ? 'タスク編集' : 'タスク作成' }}</h2>
        <button class="text-gray-400 hover:text-gray-600 text-xl leading-none" @click="emit('close')">
          ✕
        </button>
      </div>

      <form class="space-y-4" @submit.prevent="handleSubmit">
        <!-- タイトル -->
        <div>
          <label class="block text-sm font-medium text-gray-700 mb-1">
            タイトル <span class="text-red-500">*</span>
          </label>
          <input
            v-model="form.title"
            type="text"
            maxlength="255"
            placeholder="タスクタイトルを入力"
            class="w-full border border-gray-300 rounded px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
            :class="{ 'border-red-500': errors.title }"
          />
          <p v-if="errors.title" class="text-red-500 text-xs mt-1">{{ errors.title }}</p>
        </div>

        <!-- 説明文 -->
        <div>
          <label class="block text-sm font-medium text-gray-700 mb-1">説明文</label>
          <textarea
            v-model="form.description"
            maxlength="1000"
            rows="3"
            placeholder="説明文を入力（任意）"
            class="w-full border border-gray-300 rounded px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
          />
          <p v-if="errors.description" class="text-red-500 text-xs mt-1">{{ errors.description }}</p>
        </div>

        <!-- ステータス -->
        <div>
          <label class="block text-sm font-medium text-gray-700 mb-1">
            ステータス <span class="text-red-500">*</span>
          </label>
          <select
            v-model="form.status"
            class="w-full border border-gray-300 rounded px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
          >
            <option value="todo">TODO</option>
            <option value="in_progress">進行中</option>
            <option value="done">完了</option>
          </select>
        </div>

        <!-- 優先度 -->
        <div>
          <label class="block text-sm font-medium text-gray-700 mb-1">
            優先度 <span class="text-red-500">*</span>
          </label>
          <select
            v-model="form.priority"
            class="w-full border border-gray-300 rounded px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
          >
            <option value="high">高</option>
            <option value="medium">中</option>
            <option value="low">低</option>
          </select>
        </div>

        <!-- 期限日 -->
        <div>
          <label class="block text-sm font-medium text-gray-700 mb-1">期限日</label>
          <input
            v-model="form.due_date"
            type="date"
            class="w-full border border-gray-300 rounded px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
          />
        </div>

        <!-- アクション -->
        <div class="flex justify-between pt-2">
          <button
            v-if="isEdit && task"
            type="button"
            class="px-4 py-2 text-red-500 border border-red-300 rounded text-sm hover:bg-red-50 transition-colors"
            @click="emit('delete', task!)"
          >
            削除
          </button>
          <div class="flex gap-3 ml-auto">
            <button
              type="button"
              class="px-4 py-2 text-gray-600 border border-gray-300 rounded text-sm hover:bg-gray-50 transition-colors"
              @click="emit('close')"
            >
              キャンセル
            </button>
            <button
              type="submit"
              :disabled="submitting"
              class="px-4 py-2 bg-blue-600 text-white rounded text-sm hover:bg-blue-700 disabled:opacity-50 transition-colors"
            >
              保存
            </button>
          </div>
        </div>
      </form>
    </div>
  </div>
</template>
