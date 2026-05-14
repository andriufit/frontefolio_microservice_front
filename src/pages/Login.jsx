import { useState } from 'react'
import { Link, useNavigate, useLocation } from 'react-router-dom'
import { useAuth } from '../contexts/AuthContext'

export default function Login() {
  const { login } = useAuth()
  const navigate = useNavigate()
  const location = useLocation()
  const from = location.state?.from?.pathname || '/'

  const [form, setForm] = useState({ email: '', password: '' })
  const [error, setError] = useState('')
  const [loading, setLoading] = useState(false)

  async function handleSubmit(e) {
    e.preventDefault()
    setError('')
    setLoading(true)
    try {
      const user = await login(form.email, form.password)
      const dest = ['operator', 'manager', 'admin'].includes(user.role) ? '/staff' : from
      navigate(dest, { replace: true })
    } catch (err) {
      setError(err.message || 'Credenciales incorrectas')
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="auth-page">
      <div className="auth-brand">
        <div className="auth-brand-content">
          <div className="auth-brand-logo">Fronte<span style={{ color: 'var(--terra-lt)' }}>.</span>folio</div>
          <div className="auth-brand-globe">🌍</div>
          <div className="auth-brand-tagline">El mundo en tu puerta</div>
          <ul className="auth-brand-features">
            <li>Productos de más de 50 países</li>
            <li>Gestión aduanera completa</li>
            <li>Seguimiento en tiempo real</li>
            <li>Soporte personalizado</li>
          </ul>
        </div>
      </div>

      <div className="auth-form-panel">
        <div className="auth-form-inner">
          <h1 className="auth-title">Bienvenido de vuelta</h1>
          <p className="auth-subtitle">Accede a tu cuenta para gestionar tus pedidos</p>

          {error && <div className="alert alert-error mb-4">{error}</div>}

          <form onSubmit={handleSubmit} className="form-stack">
            <div className="form-group">
              <label className="form-label">Email <span className="req">*</span></label>
              <input
                type="email"
                className="form-input"
                placeholder="tu@email.com"
                value={form.email}
                onChange={e => setForm(f => ({ ...f, email: e.target.value }))}
                required
                autoComplete="email"
              />
            </div>
            <div className="form-group">
              <label className="form-label">Contraseña <span className="req">*</span></label>
              <input
                type="password"
                className="form-input"
                placeholder="Tu contraseña"
                value={form.password}
                onChange={e => setForm(f => ({ ...f, password: e.target.value }))}
                required
                autoComplete="current-password"
              />
            </div>
            <button type="submit" className="btn btn-primary btn-full btn-lg" disabled={loading}>
              {loading ? <><span className="spinner" />Entrando...</> : 'Iniciar sesión'}
            </button>
          </form>

          <p className="auth-footer-text">
            ¿No tienes cuenta? <Link to="/register">Regístrate gratis</Link>
          </p>
        </div>
      </div>
    </div>
  )
}
