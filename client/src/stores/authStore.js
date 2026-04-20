import { create } from 'zustand'

async function apiFetch(path, options = {}) {
  const res = await fetch(path, {
    credentials: 'include',
    headers: { 'Content-Type': 'application/json' },
    ...options,
  })
  let body = null
  try {
    body = await res.json()
  } catch {
    body = null
  }
  if (!res.ok) {
    const msg = body?.error || `Request failed (${res.status})`
    throw new Error(msg)
  }
  return body
}

const useAuthStore = create((set) => ({
  user: null,
  status: 'idle', // 'idle' | 'loading' | 'authenticated' | 'unauthenticated'
  error: null,

  fetchMe: async () => {
    set({ status: 'loading', error: null })
    try {
      const data = await apiFetch('/api/auth/me')
      set({ user: data.user, status: 'authenticated', error: null })
    } catch {
      set({ user: null, status: 'unauthenticated', error: null })
    }
  },

  register: async ({ username, email, password }) => {
    set({ error: null })
    const data = await apiFetch('/api/auth/register', {
      method: 'POST',
      body: JSON.stringify({ username, email, password }),
    })
    set({ user: data.user, status: 'authenticated', error: null })
    return data.user
  },

  login: async ({ identifier, password }) => {
    set({ error: null })
    const data = await apiFetch('/api/auth/login', {
      method: 'POST',
      body: JSON.stringify({ identifier, password }),
    })
    set({ user: data.user, status: 'authenticated', error: null })
    return data.user
  },

  logout: async () => {
    try {
      await apiFetch('/api/auth/logout', { method: 'POST' })
    } catch {
      // Even if the request fails, clear local state
    }
    set({ user: null, status: 'unauthenticated', error: null })
  },

  setError: (error) => set({ error }),
}))

export default useAuthStore
