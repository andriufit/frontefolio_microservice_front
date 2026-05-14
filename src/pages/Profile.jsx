import { useState, useEffect } from 'react'
import { useAuth } from '../contexts/AuthContext'
import { api } from '../services/api'

export default function Profile() {
  const { user, refreshUser } = useAuth()
  const [tab, setTab] = useState('info')
  const [form, setForm] = useState({
    first_name: '', last_name: '', phone: '', address: '', city: '', postal_code: '', nif: ''
  })
  const [pwForm, setPwForm] = useState({ current_password: '', new_password: '', confirm_password: '' })
  const [saving, setSaving] = useState(false)
  const [pwSaving, setPwSaving] = useState(false)
  const [msg, setMsg] = useState(null)
  const [pwMsg, setPwMsg] = useState(null)

  useEffect(() => {
    if (user) {
      setForm({
        first_name: user.first_name || '',
        last_name: user.last_name || '',
        phone: user.phone || '',
        address: user.address || '',
        city: user.city || '',
        postal_code: user.postal_code || '',
        nif: user.nif || '',
      })
    }
  }, [user])

  function setField(field) {
    return e => setForm(f => ({ ...f, [field]: e.target.value }))
  }

  async function saveInfo(e) {
    e.preventDefault()
    setSaving(true)
    setMsg(null)
    try {
      await api.put(`/customers/${user.id}`, form)
      await refreshUser()
      setMsg({ ok: true, text: 'Datos actualizados correctamente' })
    } catch (err) {
      setMsg({ ok: false, text: err.message || 'Error al guardar' })
    } finally {
      setSaving(false)
    }
  }

  async function savePassword(e) {
    e.preventDefault()
    if (pwForm.new_password !== pwForm.confirm_password) {
      setPwMsg({ ok: false, text: 'Las contraseñas no coinciden' })
      return
    }
    if (pwForm.new_password.length < 6) {
      setPwMsg({ ok: false, text: 'La contraseña debe tener al menos 6 caracteres' })
      return
    }
    setPwSaving(true)
    setPwMsg(null)
    try {
      await api.put('/auth/change-password', {
        current_password: pwForm.current_password,
        new_password: pwForm.new_password,
      })
      setPwMsg({ ok: true, text: 'Contraseña actualizada correctamente' })
      setPwForm({ current_password: '', new_password: '', confirm_password: '' })
    } catch (err) {
      setPwMsg({ ok: false, text: err.message || 'Error al cambiar contraseña' })
    } finally {
      setPwSaving(false)
    }
  }

  if (!user) return null
  const initials = `${user.first_name?.[0] || ''}${user.last_name?.[0] || ''}`

  return (
    <div className="page">
      <div className="container">
        {/* Header */}
        <div className="profile-header">
          <div className="profile-avatar">{initials}</div>
          <div>
            <div className="profile-name">{user.first_name} {user.last_name}</div>
            <div className="profile-email">{user.email}</div>
            <div className="mt-2">
              <span className="badge" style={{ background: 'var(--navy-bg)', color: 'var(--navy)' }}>
                {user.role}
              </span>
            </div>
          </div>
        </div>

        <div className="tabs" style={{ marginBottom: 28 }}>
          <button className={`tab-btn${tab === 'info' ? ' active' : ''}`} onClick={() => setTab('info')}>Datos personales</button>
          <button className={`tab-btn${tab === 'password' ? ' active' : ''}`} onClick={() => setTab('password')}>Contraseña</button>
        </div>

        {tab === 'info' && (
          <div style={{ maxWidth: 600 }}>
            {msg && <div className={`alert ${msg.ok ? 'alert-success' : 'alert-error'} mb-4`}>{msg.text}</div>}
            <form onSubmit={saveInfo} className="card form-stack">
              <div className="form-row">
                <div className="form-group">
                  <label className="form-label">Nombre <span className="req">*</span></label>
                  <input type="text" className="form-input" value={form.first_name} onChange={setField('first_name')} required />
                </div>
                <div className="form-group">
                  <label className="form-label">Apellido <span className="req">*</span></label>
                  <input type="text" className="form-input" value={form.last_name} onChange={setField('last_name')} required />
                </div>
              </div>
              <div className="form-group">
                <label className="form-label">Teléfono</label>
                <input type="tel" className="form-input" value={form.phone} onChange={setField('phone')} />
              </div>
              <div className="form-group">
                <label className="form-label">Dirección</label>
                <input type="text" className="form-input" value={form.address} onChange={setField('address')} />
              </div>
              <div className="form-row">
                <div className="form-group">
                  <label className="form-label">Ciudad</label>
                  <input type="text" className="form-input" value={form.city} onChange={setField('city')} />
                </div>
                <div className="form-group">
                  <label className="form-label">Código postal</label>
                  <input type="text" className="form-input" value={form.postal_code} onChange={setField('postal_code')} />
                </div>
              </div>
              <div className="form-group">
                <label className="form-label">NIF / NIE</label>
                <input type="text" className="form-input" value={form.nif} onChange={setField('nif')} />
              </div>
              <button type="submit" className="btn btn-primary" disabled={saving}>
                {saving ? <><span className="spinner" />Guardando...</> : 'Guardar cambios'}
              </button>
            </form>
          </div>
        )}

        {tab === 'password' && (
          <div style={{ maxWidth: 480 }}>
            {pwMsg && <div className={`alert ${pwMsg.ok ? 'alert-success' : 'alert-error'} mb-4`}>{pwMsg.text}</div>}
            <form onSubmit={savePassword} className="card form-stack">
              <div className="form-group">
                <label className="form-label">Contraseña actual <span className="req">*</span></label>
                <input
                  type="password"
                  className="form-input"
                  value={pwForm.current_password}
                  onChange={e => setPwForm(f => ({ ...f, current_password: e.target.value }))}
                  required
                />
              </div>
              <div className="form-group">
                <label className="form-label">Nueva contraseña <span className="req">*</span></label>
                <input
                  type="password"
                  className="form-input"
                  placeholder="Mín. 6 caracteres"
                  value={pwForm.new_password}
                  onChange={e => setPwForm(f => ({ ...f, new_password: e.target.value }))}
                  required
                />
              </div>
              <div className="form-group">
                <label className="form-label">Confirmar contraseña <span className="req">*</span></label>
                <input
                  type="password"
                  className="form-input"
                  value={pwForm.confirm_password}
                  onChange={e => setPwForm(f => ({ ...f, confirm_password: e.target.value }))}
                  required
                />
              </div>
              <button type="submit" className="btn btn-primary" disabled={pwSaving}>
                {pwSaving ? <><span className="spinner" />Cambiando...</> : 'Cambiar contraseña'}
              </button>
            </form>
          </div>
        )}
      </div>
    </div>
  )
}
