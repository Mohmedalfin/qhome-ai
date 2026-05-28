import posterImage from '../assets/poster.png'

export default function AuthLayout({ children }) {
  return (
    <main className="auth-page">
      <section className="auth-poster" aria-label="QHome AI Assistant">
        <img src={posterImage} alt="QHome AI Assistant" />
      </section>

      <section className="auth-content">
        <div className="auth-content__inner">{children}</div>
      </section>
    </main>
  )
}
