import axios from 'axios'

const api = axios.create({
  baseURL: import.meta.env.VITE_API_URL
    ? `${import.meta.env.VITE_API_URL}/api`
    : '/api',
  headers: { 'Content-Type': 'application/json' },
  withCredentials: true,
})

// Attach JWT token to every outgoing request
api.interceptors.request.use((config) => {
  const token = localStorage.getItem('token')
  if (token) {
    config.headers.Authorization = `Bearer ${token}`
  }
  return config
})

// On 401, clear stale token — but only force-redirect for protected actions,
// never for /auth/me (let AuthContext handle that gracefully)
api.interceptors.response.use(
  (response) => response,
  (error) => {
    if (error.response?.status === 401) {
      const requestUrl = error.config?.url || ''
      const isAuthMe = requestUrl.includes('/auth/me')
      const isAuthRoute =
        window.location.pathname === '/login' ||
        window.location.pathname === '/register'

      if (!isAuthMe && !isAuthRoute) {
        localStorage.removeItem('token')
        localStorage.removeItem('user')
        window.location.replace('/login')
      }
    }
    return Promise.reject(error)
  }
)

export default api
