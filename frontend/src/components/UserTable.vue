<script setup lang="ts">
import type { User } from '@/types'
import { useAuthStore } from '@/stores/auth'

const authStore = useAuthStore()

defineProps<{
  users: User[]
}>()

const emit = defineEmits<{
  edit: [user: User]
  delete: [user: User]
}>()

function formatDate(dateStr: string | null): string {
  if (!dateStr) return '-'
  return new Date(dateStr).toLocaleDateString('ja-JP')
}
</script>

<template>
  <div class="overflow-x-auto">
    <table class="w-full text-sm">
      <thead>
        <tr class="border-b border-gray-200 text-left text-gray-600">
          <th class="py-3 px-4">名前</th>
          <th class="py-3 px-4">メールアドレス</th>
          <th class="py-3 px-4">役割</th>
          <th class="py-3 px-4">作成日</th>
          <th class="py-3 px-4">削除日時</th>
          <th class="py-3 px-4">操作</th>
        </tr>
      </thead>
      <tbody>
        <tr
          v-for="user in users"
          :key="user.id"
          class="border-b border-gray-100"
          :class="user.deleted_at ? 'opacity-50 bg-gray-50' : 'hover:bg-gray-50'"
        >
          <td class="py-3 px-4 font-medium">{{ user.name }}</td>
          <td class="py-3 px-4">{{ user.email }}</td>
          <td class="py-3 px-4">
            <span
              class="px-2 py-0.5 rounded-full text-xs font-medium"
              :class="
                user.role === 'admin' ? 'bg-purple-100 text-purple-700' : 'bg-gray-100 text-gray-700'
              "
            >
              {{ user.role === 'admin' ? '管理者' : '一般' }}
            </span>
          </td>
          <td class="py-3 px-4 text-gray-500">{{ formatDate(user.created_at) }}</td>
          <td class="py-3 px-4 text-gray-500">
            {{ user.deleted_at ? formatDate(user.deleted_at) : '-' }}
          </td>
          <td class="py-3 px-4">
            <template v-if="!user.deleted_at">
              <button class="text-blue-600 hover:text-blue-800 mr-3 text-xs" @click="emit('edit', user)">
                編集
              </button>
              <button
                v-if="authStore.user?.id !== user.id"
                class="text-red-500 hover:text-red-700 text-xs"
                @click="emit('delete', user)"
              >
                削除
              </button>
            </template>
          </td>
        </tr>
      </tbody>
    </table>
  </div>
</template>
