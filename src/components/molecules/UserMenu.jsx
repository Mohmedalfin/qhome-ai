import Icon from '../atoms/Icon'
import { getAuthSession } from '../../services/authStorage'

function getDisplayName(authSession) {
  return (
    authSession?.full_name ||
    authSession?.name ||
    authSession?.user?.full_name ||
    authSession?.user?.name ||
    authSession?.email ||
    authSession?.user?.email ||
    'QHome User'
  )
}

function getUserRole(authSession) {
  return (
    authSession?.role ||
    authSession?.user?.role ||
    authSession?.company_name ||
    authSession?.user?.company_name ||
    'Kontraktor'
  )
}

function getInitials(name) {
  return String(name || 'QH')
    .split(/\s+/)
    .filter(Boolean)
    .slice(0, 2)
    .map((word) => word[0])
    .join('')
    .toUpperCase()
}

export default function UserMenu() {
  const authSession = getAuthSession()
  const displayName = getDisplayName(authSession)

  return (
    <div className="user-area">
      <button type="button" className="notification-button" aria-label="Notifikasi">
        <Icon name="bell" size={25} />
        <span>2</span>
      </button>
      <div className="user-menu">
        <div className="user-menu__avatar" aria-hidden="true">
          {getInitials(displayName)}
        </div>
        <div className="user-menu__text">
          <strong>{displayName}</strong>
          <span>{getUserRole(authSession)}</span>
        </div>
        <Icon name="chevronDown" size={18} />
      </div>
    </div>
  )
}
