import client, { getCsrfCookie } from './client'
import type { AuthUser } from '@/types'

export async function login(email: string, password: string): Promise<AuthUser> {
  await getCsrfCookie()
  const res = await client.post<AuthUser>('/api/login', { email, password })
  return res.data
}

export async function logout(): Promise<void> {
  await client.post('/api/logout')
}

export async function fetchCurrentUser(): Promise<AuthUser> {
  const res = await client.get<AuthUser>('/api/user')
  return res.data
}
