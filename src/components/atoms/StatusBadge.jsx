export default function StatusBadge({ status }) {
  const type = status === 'Tersedia' ? 'available' : 'missing'

  return <span className={`status-badge status-badge--${type}`}>{status}</span>
}
