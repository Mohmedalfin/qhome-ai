import { API_ENDPOINTS } from '../config/api'
import { apiFetch } from './apiClient'

export async function loginUser({ email, password }) {
  const formBody = new URLSearchParams({
    username: email,
    password,
  })
  return apiFetch(API_ENDPOINTS.auth.login, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/x-www-form-urlencoded',
    },
    body: formBody,
    fallbackError: 'Login gagal. Periksa email dan password.',
  })
}

export async function registerUser(payload) {
  return apiFetch(API_ENDPOINTS.auth.register, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
    },
    body: JSON.stringify(payload),
    fallbackError: 'Registrasi gagal. Silakan coba lagi.',
  })
}
