<script setup lang="ts">
import { ref, onMounted } from 'vue'
import AppHeader from '@/components/AppHeader.vue'
import UserTable from '@/components/UserTable.vue'
import UserModal from '@/components/UserModal.vue'
import ConfirmDialog from '@/components/ConfirmDialog.vue'
import { useUsersStore } from '@/stores/users'
import type { User, UserCreateFormData, UserUpdateFormData } from '@/types'

const usersStore = useUsersStore()

const showModal = ref(false)
const selectedUser = ref<User | null>(null)
const showConfirm = ref(false)
const userToDelete = ref<User | null>(null)
const modalRef = ref<InstanceType<typeof UserModal> | null>(null)

onMounted(() => {
  usersStore.fetchUsers()
})

function openCreateModal() {
  selectedUser.value = null
  showModal.value = true
}

function openEditModal(user: User) {
  selectedUser.value = user
  showModal.value = true
}

function closeModal() {
  showModal.value = false
  selectedUser.value = null
}

async function handleSubmit(data: UserCreateFormData | UserUpdateFormData) {
  try {
    if (selectedUser.value) {
      await usersStore.updateUser(selectedUser.value.id, data as UserUpdateFormData)
    } else {
      await usersStore.createUser(data as UserCreateFormData)
    }
    closeModal()
  } catch (e: unknown) {
    const err = e as { response?: { data?: { errors?: Record<string, string[]> } } }
    if (err.response?.data?.errors) {
      modalRef.value?.setServerErrors(err.response.data.errors)
    }
  }
}

function openDeleteConfirm(user: User) {
  userToDelete.value = user
  showConfirm.value = true
}

async function confirmDelete() {
  if (!userToDelete.value) return
  await usersStore.deleteUser(userToDelete.value.id)
  showConfirm.value = false
  userToDelete.value = null
}
</script>

<template>
  <div class="min-h-screen bg-gray-50">
    <AppHeader />
    <main class="max-w-7xl mx-auto px-4 py-6">
      <div class="flex items-center justify-between mb-6">
        <h2 class="text-xl font-semibold text-gray-800">ユーザー管理</h2>
        <button
          class="bg-blue-600 text-white px-4 py-2 rounded text-sm font-medium hover:bg-blue-700 transition-colors"
          @click="openCreateModal"
        >
          + ユーザー作成
        </button>
      </div>

      <div class="bg-white rounded-lg shadow">
        <div v-if="usersStore.loading" class="text-center py-12 text-gray-500">読み込み中...</div>
        <div v-else-if="usersStore.error" class="text-center py-12 text-red-500">
          {{ usersStore.error }}
        </div>
        <UserTable
          v-else
          :users="usersStore.users"
          @edit="openEditModal"
          @delete="openDeleteConfirm"
        />
      </div>
    </main>

    <UserModal
      v-if="showModal"
      ref="modalRef"
      :user="selectedUser"
      @submit="handleSubmit"
      @close="closeModal"
    />

    <ConfirmDialog
      v-if="showConfirm"
      title="ユーザーの削除"
      :message="`${userToDelete?.name} を削除してもよろしいですか？`"
      @confirm="confirmDelete"
      @cancel="showConfirm = false"
    />
  </div>
</template>
