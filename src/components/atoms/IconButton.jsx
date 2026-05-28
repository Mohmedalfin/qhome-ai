import Icon from './Icon'

export default function IconButton({ icon, label, variant = 'soft', disabled = false, onClick, className = '' }) {
  return (
    <button
      type="button"
      className={`icon-button icon-button--${variant} ${className}`}
      aria-label={label}
      title={label}
      disabled={disabled}
      onClick={onClick}
    >
      <Icon name={icon} size={22} />
    </button>
  )
}
