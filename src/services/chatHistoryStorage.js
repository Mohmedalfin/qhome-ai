import { getAuthSession } from './authStorage'

const CHAT_HISTORY_STORAGE_KEY = 'qhome_chat_history'
const CHAT_HISTORY_TTL_MS = 30 * 60 * 1000

function getStorageKey() {
  const sessionIdentity = getAuthSession()?.session_identity

  return sessionIdentity
    ? `${CHAT_HISTORY_STORAGE_KEY}:${sessionIdentity}`
    : CHAT_HISTORY_STORAGE_KEY
}

function removeLegacySnapshot() {
  localStorage.removeItem(CHAT_HISTORY_STORAGE_KEY)
}

function isExpired(savedAt) {
  return !savedAt || Date.now() - savedAt > CHAT_HISTORY_TTL_MS
}

function normalizeSnapshot(snapshot) {
  return {
    messages: Array.isArray(snapshot?.messages) ? snapshot.messages : [],
    activeAnalysisContext: snapshot?.activeAnalysisContext || null,
    invoiceDraft: snapshot?.invoiceDraft || null,
    isResultOpen: Boolean(snapshot?.isResultOpen && snapshot?.activeAnalysisContext),
  }
}

export function getChatHistorySnapshot() {
  const storageKey = getStorageKey()

  try {
    const rawSnapshot = localStorage.getItem(storageKey)

    if (!rawSnapshot) {
      return normalizeSnapshot()
    }

    const savedSnapshot = JSON.parse(rawSnapshot)

    if (isExpired(savedSnapshot.saved_at)) {
      localStorage.removeItem(storageKey)
      return normalizeSnapshot()
    }

    return normalizeSnapshot(savedSnapshot)
  } catch {
    localStorage.removeItem(storageKey)
    return normalizeSnapshot()
  }
}

export function saveChatHistorySnapshot(snapshot) {
  const storageKey = getStorageKey()
  const normalizedSnapshot = normalizeSnapshot(snapshot)
  const hasHistory = normalizedSnapshot.messages.length > 0 || normalizedSnapshot.activeAnalysisContext || normalizedSnapshot.invoiceDraft

  try {
    removeLegacySnapshot()

    if (!hasHistory) {
      localStorage.removeItem(storageKey)
      return
    }

    localStorage.setItem(
      storageKey,
      JSON.stringify({
        ...normalizedSnapshot,
        saved_at: Date.now(),
      }),
    )
  } catch {
    localStorage.removeItem(storageKey)
  }
}

export function clearChatHistorySnapshot() {
  localStorage.removeItem(getStorageKey())
  removeLegacySnapshot()
}
