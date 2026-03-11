<script setup lang="ts">
defineProps<{
  title: string
  message: string
}>()

const emit = defineEmits<{
  confirm: []
  cancel: []
}>()
</script>

<template>
  <div class="fixed inset-0 bg-black/50 flex items-center justify-center z-50">
    <div class="bg-white rounded-lg shadow-xl p-6 w-full max-w-md mx-4">
      <h3 class="text-lg font-semibold mb-2">{{ title }}</h3>
      <p class="text-gray-600 mb-6">{{ message }}</p>
      <div class="flex justify-end gap-3">
        <button
          class="px-4 py-2 text-gray-600 border border-gray-300 rounded hover:bg-gray-50 transition-colors"
          @click="emit('cancel')"
        >
          キャンセル
        </button>
        <button
          class="px-4 py-2 bg-red-500 text-white rounded hover:bg-red-600 transition-colors"
          @click="emit('confirm')"
        >
          削除する
        </button>
      </div>
    </div>
  </div>
</template>
