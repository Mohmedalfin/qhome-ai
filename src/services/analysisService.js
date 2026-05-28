import { API_ENDPOINTS } from '../config/api'
import { apiFetch } from './apiClient'

function createAnalysisId() {
  if (typeof crypto !== 'undefined' && crypto.randomUUID) {
    return `anl_${crypto.randomUUID()}`
  }

  return `anl_${Date.now()}_${Math.random().toString(16).slice(2)}`
}

function getResponseData(responseBody) {
  return responseBody?.data || responseBody || {}
}

function getExtractionData(responseBody) {
  const responseData = getResponseData(responseBody)
  const extractionCandidates = [
    responseData,
    responseData.data,
    responseData.extraction,
    responseData.extracted_data,
    responseData.rab,
    responseData.rab_data,
    responseData.result,
  ]

  return extractionCandidates.find((candidate) => Array.isArray(candidate?.items)) || responseData
}

function normalizeExtractionItem(item) {
  const itemName =
    item?.item_name ||
    item?.name ||
    item?.material_name ||
    item?.description ||
    item?.product_name ||
    ''
  const quantity = item?.quantity ?? item?.qty ?? item?.volume ?? item?.amount ?? 0

  return {
    ...item,
    item_name: String(itemName).trim(),
    quantity: Number(quantity) || 0,
  }
}

function normalizeExtractionItems(items = []) {
  return items.map(normalizeExtractionItem).filter((item) => item.item_name)
}

export function mapExtractionItemsToMatchPayload(items = []) {
  const normalizedItems = normalizeExtractionItems(items)

  return {
    items: normalizedItems.map((item) => ({
      item_name: item.item_name,
      quantity: item.quantity,
    })),
  }
}

export function createAnalysisContext({ file, extractionResponse, matchingResponse }) {
  const extraction = getExtractionData(extractionResponse)
  const matching = getResponseData(matchingResponse)
  const extractionItems = normalizeExtractionItems(extraction.items || [])

  return {
    analysis_id: createAnalysisId(),
    file_name: file?.name || 'RAB',
    extraction: {
      project_name: extraction.project_name || 'Tidak Diketahui',
      contractor_name: extraction.contractor_name || 'Tidak Diketahui',
      items: extractionItems,
      total_budget: extraction.total_budget || 0,
      fraud_analysis_summary: extraction.fraud_analysis_summary || '',
    },
    matching: {
      summary: matching.summary || {
        total_rab_items: 0,
        total_found: 0,
        total_not_found: 0,
        estimated_total_qhome_price: 0,
      },
      found_items: matching.found_items || [],
      not_found_items: matching.not_found_items || [],
    },
    last_updated_at: new Date().toISOString(),
  }
}

function formatCurrency(value) {
  return new Intl.NumberFormat('id-ID', {
    style: 'currency',
    currency: 'IDR',
    maximumFractionDigits: 0,
  }).format(Number(value) || 0)
}

function formatQuantity(value, unit) {
  const quantity = Number(value)
  const normalizedQuantity = Number.isFinite(quantity) ? quantity : value

  return [normalizedQuantity, unit].filter(Boolean).join(' ')
}

export function createRabContextText(context) {
  if (!context) {
    return ''
  }

  const extraction = context.extraction || {}
  const matching = context.matching || {}
  const summary = matching.summary || {}
  const foundItems = matching.found_items || []
  const notFoundItems = matching.not_found_items || []
  const extractionItems = extraction.items || []

  const extractedLines = extractionItems.map((item, index) => {
    const suspiciousText = item.is_suspicious ? ' | indikasi audit: perlu ditinjau' : ''

    return `${index + 1}. ${item.item_name} | qty: ${formatQuantity(item.quantity, item.unit)} | harga RAB: ${formatCurrency(item.total_price)}${suspiciousText}`
  })

  const foundLines = foundItems.map((item, index) => {
    const product = item.best_match_qhome || {}
    const similarity = product.similarity_percentage ? ` | similarity: ${product.similarity_percentage}%` : ''

    return `${index + 1}. ${item.rab_item_name} | qty: ${item.requested_quantity} | produk QHome: ${product.name || '-'} | harga: ${formatCurrency(product.price)} | subtotal: ${formatCurrency(item.subtotal_estimation)}${similarity}`
  })

  const notFoundLines = notFoundItems.map((item, index) => (
    `${index + 1}. ${item.rab_item_name || item.item_name || 'Item RAB'} | qty: ${item.requested_quantity ?? item.quantity ?? '-'}`
  ))

  return [
    `File RAB: ${context.file_name || 'RAB'}`,
    `Project: ${extraction.project_name || 'Tidak Diketahui'}`,
    `Kontraktor: ${extraction.contractor_name || 'Tidak Diketahui'}`,
    `Total item terbaca: ${summary.total_rab_items ?? extractionItems.length}`,
    `Item tersedia di katalog QHome: ${summary.total_found ?? foundItems.length}`,
    `Item tidak ditemukan di katalog QHome: ${summary.total_not_found ?? notFoundItems.length}`,
    `Estimasi total QHome: ${formatCurrency(summary.estimated_total_qhome_price)}`,
    extraction.fraud_analysis_summary ? `Catatan audit: ${extraction.fraud_analysis_summary}` : '',
    '',
    'Item hasil ekstraksi RAB:',
    extractedLines.join('\n') || '- Tidak ada item ekstraksi.',
    '',
    'Item yang tersedia di katalog QHome berdasarkan matching:',
    foundLines.join('\n') || '- Tidak ada item tersedia.',
    '',
    'Item yang tidak ditemukan di katalog QHome:',
    notFoundLines.join('\n') || '- Tidak ada item yang tidak ditemukan.',
  ].filter((line) => line !== '').join('\n')
}

export async function uploadRabFile(file) {
  if (!file) {
    throw new Error('File RAB belum dipilih.')
  }

  const formData = new FormData()
  formData.append('file', file)

  return apiFetch(API_ENDPOINTS.b2b.uploadRab, {
    method: 'POST',
    auth: true,
    body: formData,
    fallbackError: 'Upload RAB gagal. Silakan coba lagi.',
  })
}

export async function matchRabItems(items) {
  const matchPayload = mapExtractionItemsToMatchPayload(items)

  if (!matchPayload.items.length) {
    throw new Error('File berhasil diproses, tetapi tidak ada item RAB yang terbaca untuk dicocokkan.')
  }

  return apiFetch(API_ENDPOINTS.b2b.matchRab, {
    method: 'POST',
    auth: true,
    headers: {
      'Content-Type': 'application/json',
    },
    body: JSON.stringify(matchPayload),
    fallbackError: 'Matching RAB gagal. Silakan coba lagi.',
  })
}

export async function processRabFile(file) {
  const extractionResponse = await uploadRabFile(file)
  const extraction = getExtractionData(extractionResponse)
  const matchingResponse = await matchRabItems(extraction.items || [])

  return {
    context: createAnalysisContext({
      file,
      extractionResponse,
      matchingResponse,
    }),
    extractionResponse,
    matchingResponse,
  }
}
