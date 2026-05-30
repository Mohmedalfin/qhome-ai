import Icon from '../atoms/Icon'
import StatCard from '../molecules/StatCard'
import RabTable from '../molecules/RabTable'
import BudgetSummary from '../molecules/BudgetSummary'
import QuotationCard from '../molecules/QuotationCard'
import WorkspaceCard from '../molecules/WorkspaceCard'

export default function ResultPanel({
  context,
  invoiceDisabledReason,
  invoice,
  isInvoiceDisabled,
  isInvoiceGenerating,
  items,
  onClose,
  onGenerateInvoice,
  stats,
  steps,
}) {
  const extraction = context?.extraction || {}

  return (
    <section className="result-panel">
      <header className="result-panel__header">
        <h1>
          <Icon name="document" size={31} />
          <strong>Hasil Analisis RAB</strong>
        </h1>
        <div className="result-panel__actions">
          <button type="button" onClick={onClose}>
            <Icon name="x" size={20} />
            Close Panel
          </button>
        </div>
      </header>

      <div className="stats-grid">
        {stats.map((stat) => (
          <StatCard stat={stat} key={stat.label} />
        ))}
      </div>

      <section className="analysis-context-card">
        <div>
          <span>Project</span>
          <strong>{extraction.project_name || 'Tidak Diketahui'}</strong>
        </div>
        <div>
          <span>Kontraktor</span>
          <strong>{extraction.contractor_name || 'Tidak Diketahui'}</strong>
        </div>
        {extraction.fraud_analysis_summary && (
          <p>{extraction.fraud_analysis_summary}</p>
        )}
      </section>

      <RabTable items={items} />

      <div className="result-panel__bottom">
        <BudgetSummary context={context} />
        <QuotationCard
          disabledReason={invoiceDisabledReason}
          invoice={invoice}
          isDisabled={isInvoiceDisabled}
          isGenerating={isInvoiceGenerating}
          onGenerate={onGenerateInvoice}
        />
        <WorkspaceCard steps={steps} />
      </div>
    </section>
  )
}
