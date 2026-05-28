const DEFAULT_API_BASE_URL = 'https://backend-aigentqpro-production.up.railway.app'
const DEFAULT_WS_BASE_URL = DEFAULT_API_BASE_URL.replace(/^http/, 'ws')
const isVercelProduction = typeof window !== 'undefined' && window.location.hostname.endsWith('vercel.app')

export const API_BASE_URL = (
  import.meta.env.VITE_API_BASE_URL || (isVercelProduction ? '' : DEFAULT_API_BASE_URL)
).replace(/\/$/, '')

export const WS_BASE_URL = (
  import.meta.env.VITE_WS_BASE_URL || DEFAULT_WS_BASE_URL
).replace(/\/$/, '')

export const API_ENDPOINTS = {
  auth: {
    login: '/api/v1/auth/login',
    register: '/api/v1/auth/register',
  },
  b2b: {
    uploadRab: '/api/v1/b2b/upload-rab',
    matchRab: '/api/v1/b2b/match-rab',
  },
  ws: {
    negotiation: '/ws/negotiation',
  },
}
