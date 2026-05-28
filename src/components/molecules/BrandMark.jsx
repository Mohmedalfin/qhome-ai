import Icon from '../atoms/Icon'

export default function BrandMark() {
  return (
    <div className="brand-mark">
      <div className="brand-mark__logo">
        <Icon name="qhome" size={34} strokeWidth={2.4} />
      </div>
      <div>
        <strong>QHome AI Assistant</strong>
        <span>Asisten Cerdas untuk Proyek Anda</span>
      </div>
    </div>
  )
}
