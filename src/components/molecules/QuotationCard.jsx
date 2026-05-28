import Icon from '../atoms/Icon'
import PrimaryButton from '../atoms/PrimaryButton'

export default function QuotationCard() {
  return (
    <section className="quotation-card">
      <span className="quotation-card__icon">
        <Icon name="document" size={36} />
        <Icon name="sparkle" size={18} />
      </span>
      <p>Siap membuat penawaran profesional berdasarkan hasil analisis ini.</p>
      <PrimaryButton>Generate Quotation</PrimaryButton>
    </section>
  )
}
