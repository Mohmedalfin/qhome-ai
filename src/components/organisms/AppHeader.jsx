import BrandMark from '../molecules/BrandMark'
import UserMenu from '../molecules/UserMenu'

export default function AppHeader() {
  return (
    <header className="app-header">
      <BrandMark />
      <UserMenu />
    </header>
  )
}
