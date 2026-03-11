import { defineStore } from 'pinia'
import { ref } from 'vue'
import type { User, UserCreateFormData, UserUpdateFormData } from '@/types'
import * as usersApi from '@/api/users'

export const useUsersStore = defineStore('users', () => {
  const users = ref<User[]>([])
  const loading = ref(false)
  const error = ref<string | null>(null)

  async function fetchUsers() {
    loading.value = true
    error.value = null
    try {
      users.value = await usersApi.fetchUsers()
    } catch {
      error.value = 'ユーザーの取得に失敗しました。'
    } finally {
      loading.value = false
    }
  }

  async function createUser(data: UserCreateFormData): Promise<User> {
    const user = await usersApi.createUser(data)
    users.value.push(user)
    return user
  }

  async function updateUser(id: number, data: UserUpdateFormData): Promise<User> {
    const updated = await usersApi.updateUser(id, data)
    const index = users.value.findIndex((u) => u.id === id)
    if (index !== -1) users.value[index] = updated
    return updated
  }

  async function deleteUser(id: number): Promise<void> {
    await usersApi.deleteUser(id)
    await fetchUsers()
  }

  return { users, loading, error, fetchUsers, createUser, updateUser, deleteUser }
})
