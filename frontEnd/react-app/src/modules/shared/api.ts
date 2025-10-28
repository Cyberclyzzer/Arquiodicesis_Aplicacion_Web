import axios from 'axios'

// Detect base URL at runtime to support both setups:
// - Dev: Vite at 5173 calling backend at 3000
// - Prod: Served by the backend at 3000 (same origin)
const runtimeBase = (() => {
  const envBase = (import.meta as any)?.env?.VITE_API_BASE as string | undefined;
  if (envBase && envBase.trim() !== '') return envBase.trim();
  try {
    if (typeof window !== 'undefined') {
      // If we're on the backend origin (e.g., http://localhost:3000), use same-origin ('')
      if (window.location.origin.includes(':3000')) return '';
    }
  } catch {}
  // Default for Vite dev server
  return 'http://localhost:3000';
})();

export const http = axios.create({ baseURL: runtimeBase, withCredentials: true })

// Interceptores para logging básico y propagación de mensajes de error
http.interceptors.response.use(
  (resp) => resp,
  (error) => {
    const msg = error?.response?.data?.error || error?.response?.data?.message
    if (msg) console.warn('API error:', msg)
    return Promise.reject(error)
  }
)

export const api = {
  base: runtimeBase,
  async health() {
    try {
      const { data } = await http.get('/health')
      return data
    } catch (e) {
      return { status: 'down' }
    }
  },
  async get(path: string, params?: any) {
    const { data } = await http.get(path, { params })
    return data
  },
  async post(path: string, body?: any) {
    const { data } = await http.post(path, body)
    return data
  },
  async upload(path: string, formData: FormData) {
    const { data } = await http.post(path, formData, {
      headers: { 'Content-Type': 'multipart/form-data' },
    })
    return data
  },
}
