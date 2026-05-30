import { API_ENDPOINTS, WS_BASE_URL } from '../config/api'
import { createRabContextText } from './analysisService'
import { getAuthSession } from './authStorage'

const NEGOTIATION_TIMEOUT_MS = 30000
const PROGRESS_EVENT_TYPES = new Set([
  'status',
  'progress',
  'agent_progress',
  'node_status',
  'update',
])
const FINAL_EVENT_TYPES = new Set([
  'final',
  'final_answer',
  'stream_done',
  'complete',
  'completed',
  'done',
])
const NODE_STATUS_LABELS = [
  {
    pattern: 'negotiator_node',
    label: 'Menyusun jawaban terbaik...',
  },
  {
    pattern: 'gateway_node',
    label: 'Memahami pertanyaan Anda...',
  },
  {
    pattern: 'catalog',
    label: 'Mengecek informasi katalog...',
  },
  {
    pattern: 'rab',
    label: 'Membaca konteks RAB...',
  },
]
const METADATA_ONLY_KEYS = new Set([
  'is_off_topic',
  'intent_category',
  'extracted_discount',
  'mentioned_products',
  'reason',
])

function isPlainObject(value) {
  return Boolean(value) && typeof value === 'object' && !Array.isArray(value)
}

function isMetadataOnlyMessage(parsedMessage) {
  if (!isPlainObject(parsedMessage)) {
    return false
  }

  const messageKeys = Object.keys(parsedMessage)

  return messageKeys.length > 0 && messageKeys.every((key) => METADATA_ONLY_KEYS.has(key))
}

function parseLeadingJsonObject(rawContent) {
  const trimmedContent = String(rawContent || '').trimStart()

  if (!trimmedContent.startsWith('{')) {
    return null
  }

  let depth = 0
  let isInsideString = false
  let isEscaped = false

  for (let index = 0; index < trimmedContent.length; index += 1) {
    const character = trimmedContent[index]

    if (isInsideString) {
      if (isEscaped) {
        isEscaped = false
      } else if (character === '\\') {
        isEscaped = true
      } else if (character === '"') {
        isInsideString = false
      }
      continue
    }

    if (character === '"') {
      isInsideString = true
      continue
    }

    if (character === '{') {
      depth += 1
    }

    if (character === '}') {
      depth -= 1

      if (depth === 0) {
        try {
          return {
            json: JSON.parse(trimmedContent.slice(0, index + 1)),
            rest: trimmedContent.slice(index + 1),
          }
        } catch {
          return null
        }
      }
    }
  }

  return null
}

function stripLeadingMetadata(rawContent) {
  if (typeof rawContent !== 'string') {
    return rawContent
  }

  let cleanContent = rawContent

  while (true) {
    const leadingJsonObject = parseLeadingJsonObject(cleanContent)

    if (!leadingJsonObject || !isMetadataOnlyMessage(leadingJsonObject.json)) {
      return cleanContent
    }

    cleanContent = leadingJsonObject.rest.trimStart()
  }
}

function createContentEvent(type, content) {
  const cleanContent = stripLeadingMetadata(content)

  if (!cleanContent) {
    return {
      type: 'ignore',
      content: '',
    }
  }

  return {
    type,
    content: cleanContent,
  }
}

function getMessageContent(parsedMessage, fallbackContent) {
  return (
    parsedMessage.content ||
    parsedMessage.message ||
    parsedMessage.response ||
    parsedMessage.answer ||
    parsedMessage.output ||
    parsedMessage.result ||
    parsedMessage.data?.content ||
    parsedMessage.data?.message ||
    parsedMessage.data?.response ||
    parsedMessage.data?.answer ||
    parsedMessage.data?.output ||
    parsedMessage.data?.result ||
    fallbackContent
  )
}

function getTokenContent(parsedMessage, fallbackContent) {
  return (
    parsedMessage.token ||
    parsedMessage.delta ||
    parsedMessage.chunk ||
    parsedMessage.text ||
    parsedMessage.content ||
    parsedMessage.data?.token ||
    parsedMessage.data?.delta ||
    parsedMessage.data?.chunk ||
    parsedMessage.data?.text ||
    parsedMessage.data?.content ||
    fallbackContent
  )
}

function isProgressContent(content = '') {
  const normalizedContent = String(content).toLowerCase()

  return (
    normalizedContent.includes('menjalankan ') ||
    normalizedContent.includes('sedang memproses') ||
    normalizedContent.includes('processing') ||
    normalizedContent.includes('running')
  )
}

function formatStatusMessage(content = '') {
  const rawContent = String(content || '').trim()
  const normalizedContent = rawContent.toLowerCase()
  const matchedStatus = NODE_STATUS_LABELS.find((status) => normalizedContent.includes(status.pattern))

  if (matchedStatus) {
    return matchedStatus.label
  }

  if (
    normalizedContent.includes('_node') ||
    normalizedContent.includes('menjalankan ') ||
    normalizedContent.includes('running')
  ) {
    return 'Agen sedang memproses jawaban...'
  }

  return rawContent || 'Agen sedang memproses...'
}

function createContextSummary(context) {
  if (!context) {
    return null
  }

  const extraction = context?.extraction || {}
  const matching = context?.matching || {}

  return {
    analysis_id: context?.analysis_id,
    conversation_id: context?.conversation_id,
    file_name: context?.file_name,
    extraction: {
      project_name: extraction.project_name,
      contractor_name: extraction.contractor_name,
      total_budget: extraction.total_budget,
      fraud_analysis_summary: extraction.fraud_analysis_summary,
      items: (extraction.items || []).map((item) => ({
        item_name: item.item_name,
        quantity: item.quantity,
        unit: item.unit,
        price_per_unit: item.price_per_unit,
        total_price: item.total_price,
        is_suspicious: item.is_suspicious,
      })),
    },
    matching: {
      summary: matching.summary,
      found_items: matching.found_items,
      not_found_items: matching.not_found_items,
    },
  }
}

function createContextualMessage(message, analysisContext, contextMode) {
  if (contextMode === 'none') {
    return message
  }

  const rabContextText = createRabContextText(analysisContext)

  if (!rabContextText) {
    return message
  }

  const contextInstruction = contextMode === 'rab'
    ? 'Pertanyaan user terkait langsung dengan file RAB yang baru diunggah. Jawab berdasarkan KONTEKS RAB AKTIF di bawah ini. Jangan meminta user mengunggah RAB lagi karena data RAB sudah tersedia.'
    : 'Gunakan KONTEKS RAB AKTIF hanya jika pertanyaan user masih berkaitan dengan RAB, item proyek, hasil matching, atau katalog QHome dari RAB. Jika pertanyaan tidak berkaitan, jawab sebagai chat umum.'

  return [
    contextInstruction,
    '',
    'KONTEKS RAB AKTIF:',
    rabContextText,
    '',
    'PERTANYAAN USER:',
    message,
  ].join('\n')
}

function parseNegotiationEvent(eventData) {
  if (typeof eventData === 'string') {
    const leadingJsonObject = parseLeadingJsonObject(eventData)

    if (leadingJsonObject && isMetadataOnlyMessage(leadingJsonObject.json)) {
      const cleanContent = leadingJsonObject.rest.trimStart()

      if (!cleanContent) {
        return {
          type: 'ignore',
          content: '',
        }
      }

      return {
        type: 'chunk',
        content: cleanContent,
      }
    }

    try {
      const parsedMessage = JSON.parse(eventData)

      if (typeof parsedMessage === 'string') {
        return createContentEvent('chunk', parsedMessage)
      }

      if (isMetadataOnlyMessage(parsedMessage)) {
        return {
          type: 'ignore',
          content: '',
        }
      }

      const eventType = String(parsedMessage.type || '').toLowerCase()
      const eventStatus = String(parsedMessage.status || parsedMessage.data?.status || '').toLowerCase()
      const content = FINAL_EVENT_TYPES.has(eventType) ? getMessageContent(parsedMessage, '') : getMessageContent(parsedMessage, eventData)

      if (
        PROGRESS_EVENT_TYPES.has(eventType) ||
        eventStatus === 'running' ||
        eventStatus === 'processing' ||
        isProgressContent(content)
      ) {
        return createContentEvent('status', formatStatusMessage(content))
      }

      if (
        FINAL_EVENT_TYPES.has(eventType) ||
        eventStatus === 'success' ||
        eventStatus === 'completed' ||
        eventStatus === 'done'
      ) {
        return createContentEvent('final', content)
      }

      return createContentEvent('chunk', getTokenContent(parsedMessage, content))
    } catch {
      if (isProgressContent(eventData)) {
        return createContentEvent('status', formatStatusMessage(eventData))
      }

      return createContentEvent('chunk', eventData)
    }
  }

  return {
    type: 'final',
    content: 'Saya sudah menerima pertanyaan Anda, tetapi format balasan belum dikenali.',
  }
}

function cleanFinalAnswer(answer) {
  return String(stripLeadingMetadata(answer) || '').trim()
}

export function sendNegotiationMessage({
  message,
  analysisContext,
  contextMode = 'auto',
  conversationId,
  onStatus,
}) {
  const accessToken = getAuthSession()?.access_token

  if (!accessToken) {
    return Promise.reject(new Error('Sesi login tidak ditemukan. Silakan login ulang.'))
  }

  return new Promise((resolve, reject) => {
    const wsUrl = new URL(`${WS_BASE_URL}${API_ENDPOINTS.ws.negotiation}`)
    const activeConversationId = conversationId || analysisContext?.conversation_id

    wsUrl.searchParams.set('token', accessToken)

    if (activeConversationId) {
      wsUrl.searchParams.set('conversation_id', activeConversationId)
      wsUrl.searchParams.set('thread_id', activeConversationId)
    }

    const socket = new WebSocket(wsUrl.toString())
    let isSettled = false
    let hasReceivedStatus = false
    let answerBuffer = ''
    let timeoutId

    const settle = (callback, payload) => {
      if (isSettled) {
        return
      }

      isSettled = true
      clearTimeout(timeoutId)
      callback(payload)
    }

    const resetTimeout = () => {
      clearTimeout(timeoutId)
      timeoutId = setTimeout(() => {
        socket.close()

        const cleanAnswer = cleanFinalAnswer(answerBuffer)

        if (cleanAnswer) {
          settle(resolve, cleanAnswer)
          return
        }

        settle(reject, new Error('Koneksi chat terlalu lama merespons. Silakan coba lagi.'))
      }, NEGOTIATION_TIMEOUT_MS)
    }

    resetTimeout()

    socket.addEventListener('open', () => {
      const activeContext = contextMode === 'none' ? null : analysisContext
      const payload = {
        type: 'user_message',
        message: createContextualMessage(message, activeContext, contextMode),
        user_message: message,
        context_mode: activeContext ? contextMode : 'none',
      }
      const contextSummary = createContextSummary(activeContext)

      if (activeConversationId) {
        payload.conversation_id = activeConversationId
        payload.thread_id = activeConversationId
      }

      if (contextSummary) {
        payload.analysis_context = contextSummary
      }

      socket.send(JSON.stringify(payload))
    })

    socket.addEventListener('message', (event) => {
      resetTimeout()

      const negotiationEvent = parseNegotiationEvent(event.data)

      if (negotiationEvent.type === 'status') {
        hasReceivedStatus = true
        onStatus?.(negotiationEvent.content)
        return
      }

      if (negotiationEvent.type === 'ignore') {
        return
      }

      if (negotiationEvent.type === 'chunk') {
        answerBuffer += negotiationEvent.content
        return
      }

      const finalAnswer = cleanFinalAnswer(answerBuffer + negotiationEvent.content)
      settle(resolve, finalAnswer)
    })

    socket.addEventListener('error', () => {
      settle(reject, new Error('Koneksi WebSocket gagal. Silakan coba lagi.'))
    })

    socket.addEventListener('close', (event) => {
      const cleanAnswer = cleanFinalAnswer(answerBuffer)

      if (cleanAnswer) {
        settle(resolve, cleanAnswer)
        return
      }

      if (event.wasClean && hasReceivedStatus) {
        settle(reject, new Error('AI belum mengirim jawaban final. Backend baru mengirim status proses.'))
        return
      }

      if (event.wasClean) {
        settle(reject, new Error('Koneksi chat ditutup sebelum AI mengirim jawaban.'))
        return
      }

      if (!event.wasClean && event.code !== 1000) {
        settle(reject, new Error('Koneksi chat terputus sebelum balasan diterima.'))
      }
    })
  })
}
