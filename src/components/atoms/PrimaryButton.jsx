import Icon from './Icon'

export default function PrimaryButton({
  children,
  className = '',
  disabled = false,
  icon = 'arrowRight',
  onClick,
}) {
  return (
    <button type="button" className={`primary-button ${className}`} disabled={disabled} onClick={onClick}>
      <span>{children}</span>
      <Icon name={icon} size={22} />
    </button>
  )
}
