const CHAT_HISTORY_STORAGE_KEY = 'qhome_chat_history'
const CHAT_HISTORY_TTL_MS = 30 * 60 * 1000

function isExpired(savedAt) {
  return !savedAt || Date.now() - savedAt > CHAT_HISTORY_TTL_MS
}

function normalizeSnapshot(snapshot) {
  return {
    messages: Array.isArray(snapshot?.messages) ? snapshot.messages : [],
    activeAnalysisContext: snapshot?.activeAnalysisContext || null,
    isResultOpen: Boolean(snapshot?.isResultOpen && snapshot?.activeAnalysisContext),
  }
}

export function getChatHistorySnapshot() {
  try {
    const rawSnapshot = localStorage.getItem(CHAT_HISTORY_STORAGE_KEY)

    if (!rawSnapshot) {
      return normalizeSnapshot()
    }

    const savedSnapshot = JSON.parse(rawSnapshot)

    if (isExpired(savedSnapshot.saved_at)) {
      localStorage.removeItem(CHAT_HISTORY_STORAGE_KEY)
      return normalizeSnapshot()
    }

    return normalizeSnapshot(savedSnapshot)
  } catch {
    localStorage.removeItem(CHAT_HISTORY_STORAGE_KEY)
    return normalizeSnapshot()
  }
}

export function saveChatHistorySnapshot(snapshot) {
  const normalizedSnapshot = normalizeSnapshot(snapshot)
  const hasHistory = normalizedSnapshot.messages.length > 0 || normalizedSnapshot.activeAnalysisContext

  try {
    if (!hasHistory) {
      localStorage.removeItem(CHAT_HISTORY_STORAGE_KEY)
      return
    }

    localStorage.setItem(
      CHAT_HISTORY_STORAGE_KEY,
      JSON.stringify({
        ...normalizedSnapshot,
        saved_at: Date.now(),
      }),
    )
  } catch {
    localStorage.removeItem(CHAT_HISTORY_STORAGE_KEY)
  }
}

export function clearChatHistorySnapshot() {
  localStorage.removeItem(CHAT_HISTORY_STORAGE_KEY)
}
