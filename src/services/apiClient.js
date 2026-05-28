import { API_BASE_URL } from '../config/api'
import { getAuthSession } from './authStorage'

export async function parseResponse(response) {
  const contentType = response.headers.get('content-type')

  if (contentType?.includes('application/json')) {
    return response.json()
  }

  return {
    message: await response.text(),
  }
}

export function getApiErrorMessage(responseBody, fallbackMessage) {
  if (responseBody.message) {
    return responseBody.message
  }

  if (Array.isArray(responseBody.detail)) {
    return responseBody.detail
      .map((error) => error.msg)
      .filter(Boolean)
      .join(', ') || fallbackMessage
  }

  if (typeof responseBody.detail === 'string') {
    return responseBody.detail
  }

  return fallbackMessage
}

function getAuthHeader() {
  const accessToken = getAuthSession()?.access_token

  if (!accessToken) {
    throw new Error('Sesi login tidak ditemukan. Silakan login ulang.')
  }

  return {
    Authorization: `Bearer ${accessToken}`,
  }
}

export async function apiFetch(endpoint, options = {}) {
  const {
    auth = false,
    fallbackError = 'Request gagal. Silakan coba lagi.',
    headers = {},
    ...fetchOptions
  } = options
  const response = await fetch(`${API_BASE_URL}${endpoint}`, {
    ...fetchOptions,
    headers: {
      ...(auth ? getAuthHeader() : {}),
      ...headers,
    },
  })
  const responseBody = await parseResponse(response)

  if (!response.ok) {
    throw new Error(getApiErrorMessage(responseBody, fallbackError))
  }

  return responseBody
}
