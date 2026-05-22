import axios from 'axios'

const api = axios.create({
  baseURL: '/api',
})

// Attach Supabase session token from localStorage on every request
api.interceptors.request.use((config) => {
  const raw = localStorage.getItem('sb-session')
  if (raw) {
    try {
      const session = JSON.parse(raw)
      if (session?.access_token) {
        config.headers.Authorization = `Bearer ${session.access_token}`
      }
    } catch (_) {}
  }
  return config
})

export default api
