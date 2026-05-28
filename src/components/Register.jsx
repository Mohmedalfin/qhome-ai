import { useEffect, useRef, useState } from 'react'
import { registerUser } from '../services/authService'
import AuthLayout from './AuthLayout'
import Icon from './atoms/Icon'

export default function Register({ onNavigate, onNotify }) {
  const [formData, setFormData] = useState({
    email: '',
    password: '',
    full_name: '',
    company_name: '',
    role: 'B2B',
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
      const registerPayload = {
        email: formData.email.trim(),
        password: formData.password,
        full_name: formData.full_name.trim(),
        company_name: formData.company_name.trim(),
        role: formData.role,
      }

      const response = await registerUser(registerPayload)

      onNotify({
        type: 'success',
        title: 'Register berhasil! Mengalihkan...',
        description: response.message || 'Akun berhasil dibuat',
      })

      redirectTimeoutRef.current = setTimeout(() => {
        onNavigate('/login')
      }, 900)
    } catch (error) {
      onNotify({
        type: 'error',
        title: 'Register gagal',
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
          <h1>Register</h1>
        </header>

        <label className="auth-field">
          <span>Full Name</span>
          <div className="auth-input">
            <Icon name="user" size={22} />
            <input
              name="full_name"
              type="text"
              placeholder="Masukkan nama lengkap"
              value={formData.full_name}
              onChange={handleChange}
              disabled={isSubmitting}
              required
            />
          </div>
        </label>

        <label className="auth-field">
          <span>Company Name</span>
          <div className="auth-input">
            <Icon name="building" size={22} />
            <input
              name="company_name"
              type="text"
              placeholder="Masukkan nama perusahaan"
              value={formData.company_name}
              onChange={handleChange}
              disabled={isSubmitting}
              required
            />
          </div>
        </label>

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
              placeholder="Buat password"
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

        <input type="hidden" name="role" value={formData.role} readOnly />

        <button type="submit" className="auth-submit" disabled={isSubmitting}>
          {isSubmitting ? 'Mendaftarkan...' : 'Daftar'}
        </button>
      </form>

      <p className="auth-switch">
        Sudah punya akun?{' '}
        <button type="button" onClick={() => onNavigate('/login')}>
          Masuk
        </button>
      </p>
    </AuthLayout>
  )
}
