import Icon from '../atoms/Icon'

export default function ToastNotification({ message, onClose }) {
  if (!message) {
    return null
  }

  const iconName = message.type === 'error' ? 'x' : 'check'

  return (
    <div className={`toast-notification toast-notification--${message.type}`} role="status" aria-live="polite">
      <span className="toast-notification__icon">
        <Icon name={iconName} size={16} />
      </span>
      <div className="toast-notification__content">
        <strong>{message.title}</strong>
        <p>{message.description}</p>
      </div>
      <button type="button" aria-label="Tutup notifikasi" onClick={onClose}>
        <Icon name="x" size={16} />
      </button>
    </div>
  )
}
