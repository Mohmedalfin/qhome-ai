import Icon from '../atoms/Icon'

export default function UserMenu() {
  return (
    <div className="user-area">
      <button type="button" className="notification-button" aria-label="Notifikasi">
        <Icon name="bell" size={25} />
        <span>2</span>
      </button>
      <div className="user-menu">
        <div className="user-menu__avatar" aria-hidden="true">
          BC
        </div>
        <div className="user-menu__text">
          <strong>Budi Contractor</strong>
          <span>Kontraktor</span>
        </div>
        <Icon name="chevronDown" size={18} />
      </div>
    </div>
  )
}
