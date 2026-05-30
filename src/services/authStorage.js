const AUTH_STORAGE_KEY = 'qhome_auth_session'

function getSessionIdentity(authSession) {
  return (
    authSession?.user_id ||
    authSession?.id ||
    authSession?.sub ||
    authSession?.email ||
    authSession?.user?.id ||
    authSession?.user?.email ||
    authSession?.data?.user_id ||
    authSession?.data?.id ||
    authSession?.data?.email ||
    null
  )
}

function getAccessToken(authSession) {
  return (
    authSession?.access_token ||
    authSession?.token ||
    authSession?.data?.access_token ||
    authSession?.data?.token ||
    null
  )
}

function getTokenPayload(accessToken) {
  const payload = String(accessToken || '').split('.')[1]

  if (!payload) {
    return null
  }

  try {
    const normalizedPayload = payload.replace(/-/g, '+').replace(/_/g, '/')
    const paddedPayload = normalizedPayload.padEnd(
      normalizedPayload.length + ((4 - (normalizedPayload.length % 4)) % 4),
      '=',
    )

    return JSON.parse(atob(paddedPayload))
  } catch {
    return null
  }
}

function isExpiredAccessToken(accessToken) {
  const payload = getTokenPayload(accessToken)

  return Boolean(payload?.exp && Date.now() >= payload.exp * 1000)
}

function normalizeAuthSession(authSession) {
  const accessToken = getAccessToken(authSession)

  if (!accessToken || isExpiredAccessToken(accessToken)) {
    return null
  }

  return {
    ...authSession,
    ...(authSession?.data || {}),
    access_token: accessToken,
    session_identity: getSessionIdentity(authSession) || getTokenPayload(accessToken)?.sub || accessToken.slice(-16),
  }
}

export function saveAuthSession(authSession) {
  const normalizedSession = normalizeAuthSession(authSession)

  if (!normalizedSession) {
    sessionStorage.removeItem(AUTH_STORAGE_KEY)
    return
  }

  sessionStorage.setItem(AUTH_STORAGE_KEY, JSON.stringify(normalizedSession))
}

export function getAuthSession() {
  const rawSession = sessionStorage.getItem(AUTH_STORAGE_KEY)

  if (!rawSession) {
    return null
  }

  try {
    const normalizedSession = normalizeAuthSession(JSON.parse(rawSession))

    if (!normalizedSession) {
      sessionStorage.removeItem(AUTH_STORAGE_KEY)
      return null
    }

    return normalizedSession
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
