import axios from 'axios'

const client = axios.create({
  baseURL: 'http://localhost:8000',
  withCredentials: true,
  withXSRFToken: true,
  headers: {
    'Content-Type': 'application/json',
    Accept: 'application/json',
  },
})

export async function getCsrfCookie(): Promise<void> {
  await client.get('/sanctum/csrf-cookie')
}

export default client
