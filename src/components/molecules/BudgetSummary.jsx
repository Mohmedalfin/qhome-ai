import Icon from '../atoms/Icon'

function formatCurrency(value) {
  return new Intl.NumberFormat('id-ID', {
    style: 'currency',
    currency: 'IDR',
    maximumFractionDigits: 0,
  }).format(Number(value) || 0)
}

export default function BudgetSummary({ context }) {
  const extractionTotal = context?.extraction?.total_budget || 0
  const qhomeTotal = context?.matching?.summary?.estimated_total_qhome_price || 0

  return (
    <section className="budget-card">
      <header>
        <span>
          <Icon name="cash" size={22} />
          <strong>Ringkasan Anggaran</strong>
        </span>
      </header>
      <dl>
        <div>
          <dt>Total RAB</dt>
          <dd>{formatCurrency(extractionTotal)}</dd>
        </div>
        <div>
          <dt>Total QHome</dt>
          <dd className="discount">{formatCurrency(qhomeTotal)}</dd>
        </div>
        <div className="budget-card__total">
          <dt>Total Estimasi</dt>
          <dd>{formatCurrency(qhomeTotal)}</dd>
        </div>
      </dl>
    </section>
  )
}
