import Icon from './Icon'

export default function PrimaryButton({ children, icon = 'arrowRight', className = '' }) {
  return (
    <button type="button" className={`primary-button ${className}`}>
      <span>{children}</span>
      <Icon name={icon} size={22} />
    </button>
  )
}
