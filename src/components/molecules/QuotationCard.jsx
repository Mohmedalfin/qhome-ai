import Icon from '../atoms/Icon'
import PrimaryButton from '../atoms/PrimaryButton'

function formatDate(value) {
  if (!value) {
    return '-'
  }

  return new Intl.DateTimeFormat('id-ID', {
    dateStyle: 'medium',
    timeStyle: 'short',
  }).format(new Date(value))
}

export default function QuotationCard({
  disabledReason = '',
  invoice,
  isDisabled = false,
  isGenerating = false,
  onGenerate,
}) {
  return (
    <section className="quotation-card">
      <span className="quotation-card__icon">
        <Icon name="document" size={36} />
        <Icon name="sparkle" size={18} />
      </span>
      {invoice ? (
        <div className="quotation-card__invoice">
          <span>Quotation siap</span>
          <strong>{invoice.invoice_number || invoice.id || 'Invoice draft'}</strong>
          <small>{formatDate(invoice.created_at)}</small>
        </div>
      ) : (
        <p>{disabledReason || 'Siap membuat penawaran profesional berdasarkan hasil negosiasi ini.'}</p>
      )}
      {invoice?.download_url ? (
        <a className="primary-button" href={invoice.download_url} rel="noreferrer" target="_blank">
          <span>Download Quotation</span>
          <Icon name="arrowRight" size={22} />
        </a>
      ) : (
        <PrimaryButton disabled={isGenerating || isDisabled} onClick={onGenerate}>
          {isGenerating ? 'Generating...' : 'Generate Quotation'}
        </PrimaryButton>
      )}
    </section>
  )
}
