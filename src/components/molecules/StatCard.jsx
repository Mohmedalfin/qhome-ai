import Icon from '../atoms/Icon'

export default function StatCard({ stat }) {
  return (
    <article className="stat-card">
      <span className={`stat-card__icon stat-card__icon--${stat.tone}`}>
        <Icon name={stat.icon} className="stat-card__svg" size={28} />
      </span>
      <div className="stat-card__content">
        <strong>{stat.value}</strong>
        <span className="stat-card__label">{stat.label}</span>
        <p>{stat.detail}</p>
      </div>
    </article>
  )
}
