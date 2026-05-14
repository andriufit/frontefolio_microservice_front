import { useEffect, useState } from 'react'
import { Link } from 'react-router-dom'
import { api } from '../../services/api'
import { useAuth } from '../../contexts/AuthContext'

function fmtDate(d) {
  if (!d) return '—'
  return new Date(d).toLocaleDateString('es-ES', { day: 'numeric', month: 'short', year: 'numeric' })
}

export default function SuppliersList() {
  const { user } = useAuth()
  const [suppliers, setSuppliers] = useState([])
  const [countries, setCountries] = useState([])
  const [loading, setLoading] = useState(true)
  const [showForm, setShowForm] = useState(false)
  const [actionLoading, setActionLoading] = useState(false)
  const [selected, setSelected] = useState(null)
  const [search, setSearch] = useState('')
  const [countryFilter, setCountryFilter] = useState('')
  const [formError, setFormError] = useState('')
  const [editing, setEditing] = useState(false)

  const isManager = ['manager', 'admin'].includes(user?.role)

  const emptyForm = { name: '', country_id: '', contact_name: '', contact_email: '', contact_phone: '', address: '', website: '', notes: '' }
  const [form, setForm] = useState(emptyForm)

  function setField(f) { return e => setForm(v => ({ ...v, [f]: e.target.value })) }

  function loadSuppliers() {
    return api.get('/suppliers')
      .then(d => setSuppliers(Array.isArray(d) ? d : d.suppliers || []))
      .catch(() => setSuppliers([]))
  }

  useEffect(() => {
    Promise.all([
      loadSuppliers(),
      api.get('/countries').then(d => setCountries(Array.isArray(d) ? d : d.countries || [])).catch(() => {})
    ]).finally(() => setLoading(false))
  }, [])

  async function handleSubmit(e) {
    e.preventDefault()
    setFormError('')
    setActionLoading(true)
    try {
      const body = { ...form, country_id: Number(form.country_id) }
      if (editing && selected) {
        await api.put(`/suppliers/${selected.id}`, body)
      } else {
        await api.post('/suppliers', body)
      }
      await loadSuppliers()
      setShowForm(false)
      setEditing(false)
      setSelected(null)
      setForm(emptyForm)
    } catch (err) {
      setFormError(err.message || 'Error al guardar')
    } finally {
      setActionLoading(false)
    }
  }

  async function handleDelete(id) {
    if (!confirm('¿Desactivar este proveedor?')) return
    setActionLoading(true)
    try {
      await api.del(`/suppliers/${id}`)
      await loadSuppliers()
      if (selected?.id === id) setSelected(null)
    } catch (err) { alert(err.message) }
    finally { setActionLoading(false) }
  }

  function startEdit(s) {
    setForm({
      name: s.name || '', country_id: s.country_id || '', contact_name: s.contact_name || '',
      contact_email: s.contact_email || '', contact_phone: s.contact_phone || '',
      address: s.address || '', website: s.website || '', notes: s.notes || ''
    })
    setSelected(s)
    setEditing(true)
    setShowForm(true)
  }

  const filtered = suppliers.filter(s => {
    const q = search.toLowerCase()
    const matchSearch = !q || s.name?.toLowerCase().includes(q) || s.country_name?.toLowerCase().includes(q)
    const matchCountry = !countryFilter || String(s.country_id) === countryFilter
    return matchSearch && matchCountry
  })

  return (
    <div className="page">
      <div className="container">
        <div style={{ marginBottom: 24 }}>
          <Link to="/staff" className="breadcrumb" style={{ marginBottom: 8, display: 'inline-flex' }}>← Panel staff</Link>
          <div className="flex justify-between items-center">
            <div>
              <h1 className="page-title">Proveedores</h1>
              <p className="text-muted mt-2">{suppliers.filter(s => s.active !== false).length} proveedores activos</p>
            </div>
            <button className="btn btn-primary" onClick={() => { setShowForm(s => !s); setEditing(false); setForm(emptyForm) }}>
              {showForm ? 'Cancelar' : '+ Nuevo proveedor'}
            </button>
          </div>
        </div>

        {showForm && (
          <div className="card" style={{ marginBottom: 24 }}>
            <h3 className="card-title" style={{ marginBottom: 20 }}>{editing ? 'Editar proveedor' : 'Nuevo proveedor'}</h3>
            {formError && <div className="alert alert-error mb-4">{formError}</div>}
            <form onSubmit={handleSubmit} className="form-stack">
              <div className="form-row">
                <div className="form-group">
                  <label className="form-label">Nombre <span className="req">*</span></label>
                  <input type="text" className="form-input" value={form.name} onChange={setField('name')} required />
                </div>
                <div className="form-group">
                  <label className="form-label">País <span className="req">*</span></label>
                  <select className="form-input" value={form.country_id} onChange={setField('country_id')} required>
                    <option value="">Selecciona país...</option>
                    {countries.map(c => <option key={c.id} value={c.id}>{c.flag} {c.name}</option>)}
                  </select>
                </div>
              </div>
              <div className="form-row">
                <div className="form-group">
                  <label className="form-label">Contacto</label>
                  <input type="text" className="form-input" value={form.contact_name} onChange={setField('contact_name')} />
                </div>
                <div className="form-group">
                  <label className="form-label">Email contacto</label>
                  <input type="email" className="form-input" value={form.contact_email} onChange={setField('contact_email')} />
                </div>
              </div>
              <div className="form-row">
                <div className="form-group">
                  <label className="form-label">Teléfono</label>
                  <input type="tel" className="form-input" value={form.contact_phone} onChange={setField('contact_phone')} />
                </div>
                <div className="form-group">
                  <label className="form-label">Web</label>
                  <input type="url" className="form-input" value={form.website} onChange={setField('website')} placeholder="https://..." />
                </div>
              </div>
              <div className="form-group">
                <label className="form-label">Dirección</label>
                <input type="text" className="form-input" value={form.address} onChange={setField('address')} />
              </div>
              <div className="form-group">
                <label className="form-label">Notas</label>
                <textarea className="form-input" rows={2} value={form.notes} onChange={setField('notes')} />
              </div>
              <button type="submit" className="btn btn-primary" disabled={actionLoading}>
                {actionLoading ? '...' : editing ? 'Guardar cambios' : 'Crear proveedor'}
              </button>
            </form>
          </div>
        )}

        <div className="flex gap-3" style={{ marginBottom: 20, flexWrap: 'wrap' }}>
          <div className="search-wrap" style={{ maxWidth: 300 }}>
            <span className="search-icon">🔍</span>
            <input
              type="text"
              className="search-input"
              placeholder="Buscar proveedor..."
              value={search}
              onChange={e => setSearch(e.target.value)}
            />
          </div>
          <select
            className="form-input"
            style={{ maxWidth: 200 }}
            value={countryFilter}
            onChange={e => setCountryFilter(e.target.value)}
          >
            <option value="">Todos los países</option>
            {countries.map(c => <option key={c.id} value={c.id}>{c.flag} {c.name}</option>)}
          </select>
        </div>

        {loading ? (
          <div className="loading-center"><div className="spinner spinner-lg" /></div>
        ) : filtered.length === 0 ? (
          <div className="empty-state">
            <div className="empty-icon">🏭</div>
            <h3>Sin proveedores</h3>
            <p>Añade tu primer proveedor para poder asignarlo a pedidos.</p>
          </div>
        ) : (
          <div className="table-wrap">
            <table>
              <thead>
                <tr>
                  <th>Nombre</th>
                  <th>País</th>
                  <th>Contacto</th>
                  <th>Email</th>
                  <th>Estado</th>
                  <th>Acciones</th>
                </tr>
              </thead>
              <tbody>
                {filtered.map(s => (
                  <tr key={s.id} style={{ opacity: s.active === false ? 0.5 : 1 }}>
                    <td style={{ fontWeight: 500 }}>{s.name}</td>
                    <td>{s.country_flag} {s.country_name}</td>
                    <td>{s.contact_name || '—'}</td>
                    <td>
                      {s.contact_email ? (
                        <a href={`mailto:${s.contact_email}`} style={{ color: 'var(--terra)' }}>{s.contact_email}</a>
                      ) : '—'}
                    </td>
                    <td>
                      <span style={{
                        padding: '2px 8px', borderRadius: 'var(--radius-full)',
                        fontSize: '0.75rem', fontWeight: 600,
                        background: s.active !== false ? 'var(--green-bg)' : 'var(--red-bg)',
                        color: s.active !== false ? 'var(--green)' : 'var(--red)'
                      }}>
                        {s.active !== false ? 'Activo' : 'Inactivo'}
                      </span>
                    </td>
                    <td>
                      <div className="flex gap-2">
                        <button className="btn btn-outline btn-xs" onClick={() => startEdit(s)}>Editar</button>
                        {isManager && (
                          <button
                            className="btn btn-xs"
                            style={{ background: 'transparent', color: 'var(--red)', borderColor: 'var(--red)', border: '1px solid' }}
                            onClick={() => handleDelete(s.id)}
                            disabled={actionLoading}
                          >
                            Desactivar
                          </button>
                        )}
                      </div>
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
