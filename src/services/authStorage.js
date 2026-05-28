const AUTH_STORAGE_KEY = 'qhome_auth_session'

export function saveAuthSession(authSession) {
  sessionStorage.setItem(AUTH_STORAGE_KEY, JSON.stringify(authSession))
}

export function getAuthSession() {
  const rawSession = sessionStorage.getItem(AUTH_STORAGE_KEY)

  if (!rawSession) {
    return null
  }

  try {
    return JSON.parse(rawSession)
  } catch {
    sessionStorage.removeItem(AUTH_STORAGE_KEY)
    return null
  }
}

export function hasAuthSession() {
  return Boolean(getAuthSession()?.access_token)
}

export function clearAuthSession() {
  sessionStorage.removeItem(AUTH_STORAGE_KEY)
}
