import { useEffect, useState } from 'react'
import { Link } from 'react-router-dom'
import { api } from '../../services/api'
import { useAuth } from '../../contexts/AuthContext'

const ROLES = ['operator', 'manager', 'admin']

function fmtDate(d) {
  if (!d) return '—'
  return new Date(d).toLocaleDateString('es-ES', { day: 'numeric', month: 'short', year: 'numeric' })
}

export default function StaffList() {
  const { user } = useAuth()
  const [staff, setStaff] = useState([])
  const [loading, setLoading] = useState(true)
  const [showForm, setShowForm] = useState(false)
  const [actionLoading, setActionLoading] = useState(false)
  const [form, setForm] = useState({
    email: '', password: '', first_name: '', last_name: '', role: 'operator',
    phone: '', department: '', position: '', hire_date: ''
  })
  const [formError, setFormError] = useState('')

  const isAdmin = user?.role === 'admin'

  function loadStaff() {
    return api.get('/staff')
      .then(d => setStaff(Array.isArray(d) ? d : d.staff || []))
      .catch(() => setStaff([]))
      .finally(() => setLoading(false))
  }

  useEffect(() => { loadStaff() }, [])

  function setField(f) { return e => setForm(v => ({ ...v, [f]: e.target.value })) }

  async function handleCreate(e) {
    e.preventDefault()
    setFormError('')
    setActionLoading(true)
    try {
      await api.post('/staff', form)
      await loadStaff()
      setShowForm(false)
      setForm({ email: '', password: '', first_name: '', last_name: '', role: 'operator', phone: '', department: '', position: '', hire_date: '' })
    } catch (err) {
      setFormError(err.message || 'Error al crear empleado')
    } finally {
      setActionLoading(false)
    }
  }

  async function changeRole(id, role) {
    setActionLoading(true)
    try {
      await api.patch(`/staff/${id}/role`, { role })
      setStaff(list => list.map(s => s.id === id ? { ...s, role } : s))
    } catch (err) { alert(err.message) }
    finally { setActionLoading(false) }
  }

  async function toggleActive(member) {
    setActionLoading(true)
    try {
      await api.patch(`/staff/${member.id}/active`, { active: !member.active })
      setStaff(list => list.map(s => s.id === member.id ? { ...s, active: !s.active } : s))
    } catch (err) { alert(err.message) }
    finally { setActionLoading(false) }
  }

  return (
    <div className="page">
      <div className="container">
        <div style={{ marginBottom: 24 }}>
          <Link to="/staff" className="breadcrumb" style={{ marginBottom: 8, display: 'inline-flex' }}>← Panel staff</Link>
          <div className="flex justify-between items-center">
            <div>
              <h1 className="page-title">Equipo</h1>
              <p className="text-muted mt-2">{staff.length} empleados</p>
            </div>
            <button className="btn btn-primary" onClick={() => setShowForm(s => !s)}>
              {showForm ? 'Cancelar' : '+ Añadir empleado'}
            </button>
          </div>
        </div>

        {showForm && (
          <div className="card" style={{ marginBottom: 24 }}>
            <h3 className="card-title" style={{ marginBottom: 20 }}>Nuevo empleado</h3>
            {formError && <div className="alert alert-error mb-4">{formError}</div>}
            <form onSubmit={handleCreate} className="form-stack">
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
              <div className="form-row">
                <div className="form-group">
                  <label className="form-label">Email <span className="req">*</span></label>
                  <input type="email" className="form-input" value={form.email} onChange={setField('email')} required />
                </div>
                <div className="form-group">
                  <label className="form-label">Contraseña <span className="req">*</span></label>
                  <input type="password" className="form-input" placeholder="Mín. 6 chars" value={form.password} onChange={setField('password')} required />
                </div>
              </div>
              <div className="form-row">
                <div className="form-group">
                  <label className="form-label">Rol <span className="req">*</span></label>
                  <select className="form-input" value={form.role} onChange={setField('role')}>
                    {ROLES.map(r => <option key={r} value={r}>{r}</option>)}
                  </select>
                </div>
                <div className="form-group">
                  <label className="form-label">Teléfono</label>
                  <input type="tel" className="form-input" value={form.phone} onChange={setField('phone')} />
                </div>
              </div>
              <div className="form-row">
                <div className="form-group">
                  <label className="form-label">Departamento</label>
                  <input type="text" className="form-input" value={form.department} onChange={setField('department')} />
                </div>
                <div className="form-group">
                  <label className="form-label">Puesto</label>
                  <input type="text" className="form-input" value={form.position} onChange={setField('position')} />
                </div>
              </div>
              <div className="form-group">
                <label className="form-label">Fecha de incorporación</label>
                <input type="date" className="form-input" value={form.hire_date} onChange={setField('hire_date')} />
              </div>
              <button type="submit" className="btn btn-primary" disabled={actionLoading}>
                {actionLoading ? '...' : 'Crear empleado'}
              </button>
            </form>
          </div>
        )}

        {loading ? (
          <div className="loading-center"><div className="spinner spinner-lg" /></div>
        ) : (
          <div className="table-wrap">
            <table>
              <thead>
                <tr>
                  <th>Nombre</th>
                  <th>Email</th>
                  <th>Rol</th>
                  <th>Departamento</th>
                  <th>Incorporación</th>
                  <th>Estado</th>
                  <th>Acciones</th>
                </tr>
              </thead>
              <tbody>
                {staff.map(s => (
                  <tr key={s.id} style={{ opacity: s.active ? 1 : 0.5 }}>
                    <td style={{ fontWeight: 500 }}>{s.first_name} {s.last_name}</td>
                    <td>{s.email}</td>
                    <td>
                      {isAdmin && s.id !== user?.id ? (
                        <select
                          className="form-input"
                          style={{ padding: '4px 8px', fontSize: '0.8rem', maxWidth: 120 }}
                          value={s.role}
                          onChange={e => changeRole(s.id, e.target.value)}
                          disabled={actionLoading}
                        >
                          {ROLES.map(r => <option key={r} value={r}>{r}</option>)}
                        </select>
                      ) : (
                        <span className="badge" style={{ background: 'var(--navy-bg)', color: 'var(--navy)' }}>{s.role}</span>
                      )}
                    </td>
                    <td>{s.department || '—'}</td>
                    <td>{fmtDate(s.hire_date)}</td>
                    <td>
                      <span style={{
                        padding: '2px 8px', borderRadius: 'var(--radius-full)',
                        fontSize: '0.75rem', fontWeight: 600,
                        background: s.active ? 'var(--green-bg)' : 'var(--red-bg)',
                        color: s.active ? 'var(--green)' : 'var(--red)'
                      }}>
                        {s.active ? 'Activo' : 'Inactivo'}
                      </span>
                    </td>
                    <td>
                      {s.id !== user?.id && (
                        <button
                          className={`btn btn-xs ${s.active ? 'btn-danger' : 'btn-success'}`}
                          style={{ background: 'transparent', borderWidth: 1 }}
                          onClick={() => toggleActive(s)}
                          disabled={actionLoading}
                        >
                          {s.active ? 'Desactivar' : 'Activar'}
                        </button>
                      )}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </div>
  )
}
