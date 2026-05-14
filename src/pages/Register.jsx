import { useState } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import { useAuth } from '../contexts/AuthContext'

export default function Register() {
  const { register } = useAuth()
  const navigate = useNavigate()

  const [form, setForm] = useState({
    email: '', password: '', first_name: '', last_name: '',
    phone: '', address: '', city: '', postal_code: '', nif: ''
  })
  const [error, setError] = useState('')
  const [loading, setLoading] = useState(false)

  function set(field) {
    return e => setForm(f => ({ ...f, [field]: e.target.value }))
  }

  async function handleSubmit(e) {
    e.preventDefault()
    setError('')
    if (form.password.length < 6) { setError('La contraseña debe tener al menos 6 caracteres'); return }
    setLoading(true)
    try {
      await register(form)
      navigate('/')
    } catch (err) {
      setError(err.message || 'Error al registrarse')
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
            <li>Registro gratuito, sin compromiso</li>
            <li>Primera solicitud en 5 minutos</li>
            <li>Más de 50 países disponibles</li>
            <li>Gestión aduanera incluida</li>
          </ul>
        </div>
      </div>

      <div className="auth-form-panel" style={{ overflowY: 'auto' }}>
        <div className="auth-form-inner" style={{ maxWidth: 480 }}>
          <h1 className="auth-title">Crear cuenta</h1>
          <p className="auth-subtitle">Únete y empieza a importar desde todo el mundo</p>

          {error && <div className="alert alert-error mb-4">{error}</div>}

          <form onSubmit={handleSubmit} className="form-stack">
            <div className="form-row">
              <div className="form-group">
                <label className="form-label">Nombre <span className="req">*</span></label>
                <input type="text" className="form-input" placeholder="Ana" value={form.first_name} onChange={set('first_name')} required />
              </div>
              <div className="form-group">
                <label className="form-label">Apellido <span className="req">*</span></label>
                <input type="text" className="form-input" placeholder="García" value={form.last_name} onChange={set('last_name')} required />
              </div>
            </div>
            <div className="form-group">
              <label className="form-label">Email <span className="req">*</span></label>
              <input type="email" className="form-input" placeholder="ana@email.com" value={form.email} onChange={set('email')} required autoComplete="email" />
            </div>
            <div className="form-group">
              <label className="form-label">Contraseña <span className="req">*</span></label>
              <input type="password" className="form-input" placeholder="Mín. 6 caracteres" value={form.password} onChange={set('password')} required autoComplete="new-password" />
            </div>
            <div className="form-group">
              <label className="form-label">Teléfono</label>
              <input type="tel" className="form-input" placeholder="+34 600 000 000" value={form.phone} onChange={set('phone')} />
            </div>
            <div className="form-group">
              <label className="form-label">Dirección</label>
              <input type="text" className="form-input" placeholder="Calle Mayor 1, 2ºA" value={form.address} onChange={set('address')} />
            </div>
            <div className="form-row">
              <div className="form-group">
                <label className="form-label">Ciudad</label>
                <input type="text" className="form-input" placeholder="Madrid" value={form.city} onChange={set('city')} />
              </div>
              <div className="form-group">
                <label className="form-label">Código postal</label>
                <input type="text" className="form-input" placeholder="28001" value={form.postal_code} onChange={set('postal_code')} />
              </div>
            </div>
            <div className="form-group">
              <label className="form-label">NIF / NIE</label>
              <input type="text" className="form-input" placeholder="12345678A" value={form.nif} onChange={set('nif')} />
            </div>
            <button type="submit" className="btn btn-primary btn-full btn-lg" disabled={loading}>
              {loading ? <><span className="spinner" />Creando cuenta...</> : 'Crear cuenta gratis'}
            </button>
          </form>

          <p className="auth-footer-text">
            ¿Ya tienes cuenta? <Link to="/login">Inicia sesión</Link>
          </p>
        </div>
      </div>
    </div>
  )
}
