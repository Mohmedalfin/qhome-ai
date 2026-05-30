import { API_ENDPOINTS } from '../config/api'
import { apiFetch } from './apiClient'

function getResponseData(responseBody) {
  return responseBody?.data || responseBody || null
}

export function getPrimaryInvoice(responseBody) {
  const responseData = getResponseData(responseBody)

  if (Array.isArray(responseData)) {
    return responseData[0] || null
  }

  return responseData
}

export async function generateInvoice({ conversationId, companyName }) {
  if (!conversationId) {
    throw new Error('Conversation ID belum tersedia. Lakukan negosiasi terlebih dahulu.')
  }

  if (!companyName?.trim()) {
    throw new Error('Nama perusahaan belum tersedia untuk invoice.')
  }

  return apiFetch(API_ENDPOINTS.invoices.generate, {
    method: 'POST',
    auth: true,
    headers: {
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({
      conversation_id: conversationId,
      company_name: companyName.trim(),
    }),
    fallbackError: 'Generate quotation gagal. Silakan coba lagi.',
  })
}

export async function getMyInvoices() {
  return apiFetch(API_ENDPOINTS.invoices.me, {
    method: 'GET',
    auth: true,
    fallbackError: 'Gagal mengambil riwayat invoice.',
  })
}
