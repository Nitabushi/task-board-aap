<script setup lang="ts">
import { ref, computed, watch } from 'vue'
import type { User, UserCreateFormData, UserUpdateFormData } from '@/types'

const props = defineProps<{
  user?: User | null
}>()

const emit = defineEmits<{
  submit: [data: UserCreateFormData | UserUpdateFormData]
  close: []
}>()

const isEdit = computed(() => !!props.user)

const form = ref({
  name: '',
  email: '',
  password: '',
  role: 'user' as 'admin' | 'user',
})

const errors = ref<Record<string, string>>({})
const submitting = ref(false)

watch(
  () => props.user,
  (user) => {
    if (user) {
      form.value = {
        name: user.name,
        email: user.email,
        password: '',
        role: user.role,
      }
    } else {
      form.value = { name: '', email: '', password: '', role: 'user' }
    }
    errors.value = {}
  },
  { immediate: true },
)

function validate(): boolean {
  errors.value = {}
  if (!form.value.name.trim()) errors.value.name = '名前は必須です。'
  if (!form.value.email.trim()) errors.value.email = 'メールアドレスは必須です。'
  if (!isEdit.value && !form.value.password) errors.value.password = 'パスワードは必須です。'
  if (form.value.password && form.value.password.length < 8) {
    errors.value.password = 'パスワードは8文字以上で入力してください。'
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
    <div class="bg-white rounded-lg shadow-xl p-6 w-full max-w-md mx-4">
      <div class="flex items-center justify-between mb-4">
        <h2 class="text-lg font-semibold">{{ isEdit ? 'ユーザー編集' : 'ユーザー作成' }}</h2>
        <button class="text-gray-400 hover:text-gray-600 text-xl leading-none" @click="emit('close')">
          ✕
        </button>
      </div>

      <form class="space-y-4" @submit.prevent="handleSubmit">
        <!-- 名前 -->
        <div>
          <label class="block text-sm font-medium text-gray-700 mb-1">
            名前 <span class="text-red-500">*</span>
          </label>
          <input
            v-model="form.name"
            type="text"
            maxlength="255"
            class="w-full border border-gray-300 rounded px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
            :class="{ 'border-red-500': errors.name }"
          />
          <p v-if="errors.name" class="text-red-500 text-xs mt-1">{{ errors.name }}</p>
        </div>

        <!-- メールアドレス -->
        <div>
          <label class="block text-sm font-medium text-gray-700 mb-1">
            メールアドレス <span class="text-red-500">*</span>
          </label>
          <input
            v-model="form.email"
            type="email"
            class="w-full border border-gray-300 rounded px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
            :class="{ 'border-red-500': errors.email }"
          />
          <p v-if="errors.email" class="text-red-500 text-xs mt-1">{{ errors.email }}</p>
        </div>

        <!-- パスワード -->
        <div>
          <label class="block text-sm font-medium text-gray-700 mb-1">
            パスワード
            <span v-if="!isEdit" class="text-red-500">*</span>
            <span v-else class="text-gray-400 text-xs font-normal ml-1">（空欄で変更なし）</span>
          </label>
          <input
            v-model="form.password"
            type="password"
            class="w-full border border-gray-300 rounded px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
            :class="{ 'border-red-500': errors.password }"
          />
          <p v-if="errors.password" class="text-red-500 text-xs mt-1">{{ errors.password }}</p>
        </div>

        <!-- 役割 -->
        <div>
          <label class="block text-sm font-medium text-gray-700 mb-1">
            役割 <span class="text-red-500">*</span>
          </label>
          <select
            v-model="form.role"
            class="w-full border border-gray-300 rounded px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
          >
            <option value="user">一般ユーザー</option>
            <option value="admin">管理者</option>
          </select>
        </div>

        <!-- アクション -->
        <div class="flex justify-end gap-3 pt-2">
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
      </form>
    </div>
  </div>
</template>
