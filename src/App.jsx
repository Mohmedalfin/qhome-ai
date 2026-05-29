import { useEffect, useRef, useState } from 'react'
import AppHeader from './components/organisms/AppHeader'
import ChatPanel from './components/organisms/ChatPanel'
import ResultPanel from './components/organisms/ResultPanel'
import MobileResultSheet from './components/organisms/MobileResultSheet'
import Login from './components/Login'
import Register from './components/Register'
import ToastNotification from './components/molecules/ToastNotification'
import UploadHintBanner from './components/molecules/UploadHintBanner'
import { hasAuthSession } from './services/authStorage'
import { getChatHistorySnapshot, saveChatHistorySnapshot } from './services/chatHistoryStorage'
import { processRabFile } from './services/analysisService'
import { sendNegotiationMessage } from './services/negotiationService'
import './App.css'

const workspaceSteps = [
  { title: 'Document Extractor' },
  { title: 'Catalog Matching' },
  { title: 'Pricing Optimizer' },
]

const rabProcessingMessages = [
  'Menganalisis file RAB...',
  'Mengekstrak item dari dokumen...',
  'Mencocokkan item dengan katalog QHome...',
]

const negotiationProcessingMessages = [
  'Membaca konteks RAB...',
  'Mengecek hasil matching katalog...',
  'Menyiapkan jawaban yang relevan...',
]

const generalChatProcessingMessages = [
  'Menghubungi AI Assistant...',
  'Memproses pertanyaan Anda...',
  'Menyiapkan jawaban...',
]

const combinedProcessingMessages = [
  'Menganalisis file RAB...',
  'Mencocokkan item dengan katalog QHome...',
  'Menyiapkan jawaban dari konteks RAB...',
]

const initialMessages = []
const contextRelatedKeywords = [
  'rab',
  'qhome',
  'proyek',
  'project',
  'barang',
  'produk',
  'item',
  'material',
  'katalog',
  'harga',
  'diskon',
  'discount',
  'potongan',
  'nego',
  'negosiasi',
  'tawar',
  'murah',
  'mahal',
  'turun',
  'kurang',
  'deal',
  'penawaran',
  'alternatif',
  'lain',
  'pengganti',
  'spesifikasi',
  'stok',
  'tersedia',
  'ketersediaan',
  'subtotal',
  'total',
  'qty',
  'quantity',
  'jumlah',
  'anggaran',
  'budget',
  'kontraktor',
  'matching',
  'analisis',
]

function getMessageTime() {
  return new Intl.DateTimeFormat('id-ID', {
    hour: '2-digit',
    minute: '2-digit',
    hour12: false,
  }).format(new Date())
}

function createMessageId() {
  if (typeof crypto !== 'undefined' && crypto.randomUUID) {
    return crypto.randomUUID()
  }

  return `${Date.now()}-${Math.random().toString(16).slice(2)}`
}

function formatCurrency(value) {
  return new Intl.NumberFormat('id-ID', {
    style: 'currency',
    currency: 'IDR',
    maximumFractionDigits: 0,
  }).format(Number(value) || 0)
}

function normalizeChatText(text) {
  return String(text || '')
    .toLowerCase()
    .replace(/[^\p{L}\p{N}\s]/gu, ' ')
    .replace(/\s+/g, ' ')
    .trim()
}

function getContextSearchTerms(context) {
  const extractionItems = context?.extraction?.items || []
  const foundItems = context?.matching?.found_items || []
  const notFoundItems = context?.matching?.not_found_items || []

  return [
    context?.extraction?.project_name,
    context?.extraction?.contractor_name,
    ...extractionItems.map((item) => item.item_name),
    ...foundItems.flatMap((item) => [
      item.rab_item_name,
      item.best_match_qhome?.name,
      item.best_match_qhome?.brand,
      item.best_match_qhome?.category,
    ]),
    ...notFoundItems.map((item) => item.rab_item_name || item.item_name),
  ]
    .filter(Boolean)
    .map(normalizeChatText)
    .filter((term) => term.length >= 4)
}

function shouldUseAnalysisContext(message, context) {
  if (!context) {
    return false
  }

  const normalizedMessage = normalizeChatText(message)

  if (!normalizedMessage) {
    return false
  }

  const hasContextKeyword = contextRelatedKeywords.some((keyword) => normalizedMessage.includes(keyword))

  if (hasContextKeyword) {
    return true
  }

  const hasContextTerm = getContextSearchTerms(context).some((term) => normalizedMessage.includes(term))

  if (hasContextTerm) {
    return true
  }

  return false
}

function buildAnalysisStats(context) {
  const summary = context?.matching?.summary || {}
  const extractionItems = context?.extraction?.items || []

  return [
    {
      icon: 'fileText',
      tone: 'mint',
      value: String(summary.total_rab_items ?? extractionItems.length),
      label: 'Item Terbaca',
      detail: 'Dari file RAB',
    },
    {
      icon: 'check',
      tone: 'green',
      value: String(summary.total_found ?? 0),
      label: 'Tersedia',
      detail: 'Di katalog QHome',
    },
    {
      icon: 'x',
      tone: 'red',
      value: String(summary.total_not_found ?? 0),
      label: 'Tidak Ada',
      detail: 'Tidak ditemukan',
    },
    {
      icon: 'list',
      tone: 'blue',
      value: String(summary.total_rab_items ?? extractionItems.length),
      label: 'Total Item',
      detail: 'Diproses',
    },
  ]
}

function buildRabTableItems(context) {
  const foundItems = context?.matching?.found_items || []
  const notFoundItems = context?.matching?.not_found_items || []

  return [
    ...foundItems.map((item) => ({
      id: `found-${item.rab_item_name}-${item.requested_quantity}`,
      item: item.rab_item_name,
      qty: String(item.requested_quantity ?? '-'),
      product: item.best_match_qhome?.name || 'Produk QHome ditemukan',
      price: item.best_match_qhome?.price ? formatCurrency(item.best_match_qhome.price) : '-',
      similarity: item.best_match_qhome?.similarity_percentage,
      subtotal: item.subtotal_estimation ? formatCurrency(item.subtotal_estimation) : '-',
      status: 'Tersedia',
    })),
    ...notFoundItems.map((item) => ({
      id: `missing-${item.rab_item_name || item.item_name}-${item.requested_quantity || item.quantity}`,
      item: item.rab_item_name || item.item_name || 'Item RAB',
      qty: String(item.requested_quantity ?? item.quantity ?? '-'),
      product: 'Tidak ditemukan di katalog QHome',
      price: '-',
      similarity: null,
      subtotal: '-',
      status: 'Tidak Ada',
    })),
  ]
}

function App() {
  const restoredChatHistoryRef = useRef(getChatHistorySnapshot())
  const [route, setRoute] = useState(() => window.location.pathname)
  const [isResultOpen, setIsResultOpen] = useState(() => restoredChatHistoryRef.current.isResultOpen)
  const [messages, setMessages] = useState(() => restoredChatHistoryRef.current.messages || initialMessages)
  const [isAgentThinking, setIsAgentThinking] = useState(false)
  const [processingMessages, setProcessingMessages] = useState(rabProcessingMessages)
  const [activeAnalysisContext, setActiveAnalysisContext] = useState(
    () => restoredChatHistoryRef.current.activeAnalysisContext,
  )
  const [toastMessage, setToastMessage] = useState(null)
  const toastTimeoutRef = useRef(null)

  useEffect(() => {
    const handlePopState = () => {
      setRoute(window.location.pathname)
    }

    window.addEventListener('popstate', handlePopState)

    return () => {
      window.removeEventListener('popstate', handlePopState)

      if (toastTimeoutRef.current) {
        clearTimeout(toastTimeoutRef.current)
      }
    }
  }, [])

  useEffect(() => {
    saveChatHistorySnapshot({
      messages,
      activeAnalysisContext,
      isResultOpen,
    })
  }, [activeAnalysisContext, isResultOpen, messages])

  const navigate = (nextRoute) => {
    window.history.pushState({}, '', nextRoute)
    setRoute(nextRoute)
  }

  const showToast = (message) => {
    setToastMessage(message)

    if (toastTimeoutRef.current) {
      clearTimeout(toastTimeoutRef.current)
    }

    toastTimeoutRef.current = setTimeout(() => {
      setToastMessage(null)
    }, message.duration ?? 3200)
  }

  const closeToast = () => {
    setToastMessage(null)

    if (toastTimeoutRef.current) {
      clearTimeout(toastTimeoutRef.current)
    }
  }

  const handleSendMessage = async ({ text, file }) => {
    const cleanText = text.trim()
    const fileMeta = file
      ? {
          name: file.name,
          size: file.size,
          type: file.type || 'application/pdf',
        }
      : null
    const nextUserMessage = {
      id: createMessageId(),
      sender: 'user',
      text: cleanText || `Analisis file ${fileMeta.name}.`,
      file: fileMeta,
      time: getMessageTime(),
    }

    setMessages((currentMessages) => [...currentMessages, nextUserMessage])

    if (!file) {
      const shouldAttachContext = shouldUseAnalysisContext(cleanText, activeAnalysisContext)

      setProcessingMessages(shouldAttachContext ? negotiationProcessingMessages : generalChatProcessingMessages)
      setIsAgentThinking(true)

      try {
        const answer = await sendNegotiationMessage({
          message: cleanText,
          analysisContext: shouldAttachContext ? activeAnalysisContext : null,
          contextMode: shouldAttachContext ? 'auto' : 'none',
          onStatus: (statusMessage) => setProcessingMessages([statusMessage]),
        })

        setMessages((currentMessages) => [
          ...currentMessages,
          {
            id: createMessageId(),
            sender: 'assistant',
            text: answer,
            resultAvailable: false,
            time: getMessageTime(),
          },
        ])
      } catch (error) {
        setMessages((currentMessages) => [
          ...currentMessages,
          {
            id: createMessageId(),
            sender: 'assistant',
            text: error.message,
            time: getMessageTime(),
          },
        ])
        showToast({
          type: 'error',
          title: 'Chat gagal',
          description: error.message,
        })
      } finally {
        setIsAgentThinking(false)
      }
      return
    }

    setProcessingMessages(cleanText ? combinedProcessingMessages : rabProcessingMessages)
    setIsAgentThinking(true)

    try {
      const { context } = await processRabFile(file)

      setActiveAnalysisContext(context)

      if (cleanText) {
        const answer = await sendNegotiationMessage({
          message: cleanText,
          analysisContext: context,
          contextMode: 'rab',
          onStatus: (statusMessage) => setProcessingMessages([statusMessage]),
        })

        setMessages((currentMessages) => [
          ...currentMessages,
          {
            id: createMessageId(),
            sender: 'assistant',
            text: answer,
            resultAvailable: true,
            time: getMessageTime(),
          },
        ])
        setIsResultOpen(true)
      } else {
        setIsResultOpen(true)
        setMessages((currentMessages) => [
          ...currentMessages,
          {
            id: createMessageId(),
            sender: 'assistant',
            text: 'Analisis selesai. Hasil ekstraksi dan matching katalog QHome sudah siap dilihat.',
            resultAvailable: true,
            time: getMessageTime(),
          },
        ])
      }
      showToast({
        type: 'success',
        title: 'Analisis RAB selesai',
        description: 'Hasil matching berhasil diproses',
      })
    } catch (error) {
      setMessages((currentMessages) => [
        ...currentMessages,
        {
          id: createMessageId(),
          sender: 'assistant',
          text: error.message,
          time: getMessageTime(),
        },
      ])
      showToast({
        type: 'error',
        title: 'Analisis gagal',
        description: error.message,
      })
    } finally {
      setIsAgentThinking(false)
    }
  }

  if (route === '/login') {
    return (
      <>
        <Login onNavigate={navigate} onNotify={showToast} />
        <ToastNotification message={toastMessage} onClose={closeToast} />
      </>
    )
  }

  if (route === '/register') {
    return (
      <>
        <Register onNavigate={navigate} onNotify={showToast} />
        <ToastNotification message={toastMessage} onClose={closeToast} />
      </>
    )
  }

  if (route !== '/qhome' || !hasAuthSession()) {
    return (
      <>
        <Login onNavigate={navigate} onNotify={showToast} />
        <ToastNotification message={toastMessage} onClose={closeToast} />
      </>
    )
  }

  return (
    <div className="app-shell">
      <AppHeader />
      {messages.length === 0 && !activeAnalysisContext && !isAgentThinking && <UploadHintBanner />}
      <main className={`dashboard ${isResultOpen ? 'has-result' : 'chat-only'}`}>
        <ChatPanel
          isAgentThinking={isAgentThinking}
          isResultOpen={isResultOpen}
          messages={messages}
          processingMessages={processingMessages}
          onToggleResult={() => setIsResultOpen((currentValue) => !currentValue)}
          onSendMessage={handleSendMessage}
          isComposerDisabled={isAgentThinking}
        />
        {isResultOpen && activeAnalysisContext && (
          <ResultPanel
            context={activeAnalysisContext}
            stats={buildAnalysisStats(activeAnalysisContext)}
            items={buildRabTableItems(activeAnalysisContext)}
            onClose={() => setIsResultOpen(false)}
            steps={workspaceSteps}
          />
        )}
      </main>
      <MobileResultSheet
        context={activeAnalysisContext}
        isOpen={isResultOpen && Boolean(activeAnalysisContext)}
        stats={buildAnalysisStats(activeAnalysisContext)}
        items={buildRabTableItems(activeAnalysisContext)}
        onClose={() => setIsResultOpen(false)}
        steps={workspaceSteps}
      />
      <ToastNotification message={toastMessage} onClose={closeToast} />
    </div>
  )
}

export default App
