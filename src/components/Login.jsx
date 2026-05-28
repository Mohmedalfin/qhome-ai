import { useEffect, useRef, useState } from 'react'
import { loginUser } from '../services/authService'
import { saveAuthSession } from '../services/authStorage'
import AuthLayout from './AuthLayout'
import Icon from './atoms/Icon'

export default function Login({ onNavigate, onNotify }) {
  const [formData, setFormData] = useState({
    email: '',
    password: '',
  })
  const [showPassword, setShowPassword] = useState(false)
  const [isSubmitting, setIsSubmitting] = useState(false)
  const redirectTimeoutRef = useRef(null)

  useEffect(() => {
    return () => {
      if (redirectTimeoutRef.current) {
        clearTimeout(redirectTimeoutRef.current)
      }
    }
  }, [])

  const handleChange = (event) => {
    const { name, value } = event.target
    setFormData((currentData) => ({
      ...currentData,
      [name]: value,
    }))
  }

  const handleSubmit = async (event) => {
    event.preventDefault()
    setIsSubmitting(true)

    try {
      const authSession = await loginUser({
        email: formData.email.trim(),
        password: formData.password,
      })

      saveAuthSession(authSession)
      onNotify({
        type: 'success',
        title: 'Login berhasil! Mengalihkan...',
        description: 'Aksi berhasil diproses',
        duration: 900,
      })
      redirectTimeoutRef.current = setTimeout(() => {
        onNavigate('/qhome')
      }, 1100)
    } catch (error) {
      onNotify({
        type: 'error',
        title: 'Login gagal',
        description: error.message,
      })
    } finally {
      setIsSubmitting(false)
    }
  }

  return (
    <AuthLayout onNavigate={onNavigate}>
      <form className="auth-card" onSubmit={handleSubmit}>
        <header className="auth-card__header">
          <h1>Login</h1>
        </header>

        <label className="auth-field">
          <span>Email</span>
          <div className="auth-input">
            <Icon name="mail" size={22} />
            <input
              name="email"
              type="email"
              placeholder="Masukkan email Anda"
              value={formData.email}
              onChange={handleChange}
              disabled={isSubmitting}
              required
            />
          </div>
        </label>

        <label className="auth-field">
          <span>Password</span>
          <div className="auth-input">
            <Icon name="lock" size={22} />
            <input
              name="password"
              type={showPassword ? 'text' : 'password'}
              placeholder="Masukkan password Anda"
              value={formData.password}
              onChange={handleChange}
              disabled={isSubmitting}
              required
            />
            <button
              type="button"
              aria-label={showPassword ? 'Sembunyikan password' : 'Tampilkan password'}
              disabled={isSubmitting}
              onClick={() => setShowPassword((currentValue) => !currentValue)}
            >
              <Icon name={showPassword ? 'eyeOff' : 'eye'} size={21} />
            </button>
          </div>
        </label>

        <div className="auth-row">
          <label className="auth-checkbox">
            <input type="checkbox" defaultChecked disabled={isSubmitting} />
            <span>Ingat saya</span>
          </label>
        </div>

        <button type="submit" className="auth-submit" disabled={isSubmitting}>
          {isSubmitting ? 'Memproses...' : 'Masuk'}
        </button>
      </form>

      <p className="auth-switch">
        Belum punya akun?{' '}
        <button type="button" onClick={() => onNavigate('/register')}>
          Daftar
        </button>
      </p>
    </AuthLayout>
  )
}
