import { useEffect, useState } from 'react'
import { Link } from 'react-router-dom'
import { api } from '../../services/api'
import { useAuth } from '../../contexts/AuthContext'

function fmtDate(d) {
  if (!d) return '—'
  return new Date(d).toLocaleDateString('es-ES', { day: 'numeric', month: 'short', year: 'numeric' })
}

export default function CustomersList() {
  const { user } = useAuth()
  const [customers, setCustomers] = useState([])
  const [loading, setLoading] = useState(true)
  const [search, setSearch] = useState('')
  const [selected, setSelected] = useState(null)
  const [orders, setOrders] = useState([])
  const [ordersLoading, setOrdersLoading] = useState(false)
  const [actionLoading, setActionLoading] = useState(false)

  const isManager = ['manager', 'admin'].includes(user?.role)

  useEffect(() => {
    api.get('/customers')
      .then(d => setCustomers(Array.isArray(d) ? d : d.customers || []))
      .catch(() => setCustomers([]))
      .finally(() => setLoading(false))
  }, [])

  async function viewCustomer(c) {
    setSelected(c)
    setOrdersLoading(true)
    try {
      const o = await api.get(`/customers/${c.id}/orders`)
      setOrders(Array.isArray(o) ? o : o.orders || [])
    } catch {
      setOrders([])
    } finally {
      setOrdersLoading(false)
    }
  }

  async function toggleActive(c) {
    setActionLoading(true)
    try {
      await api.patch(`/customers/${c.id}/active`, { active: !c.active })
      setCustomers(list => list.map(x => x.id === c.id ? { ...x, active: !x.active } : x))
      if (selected?.id === c.id) setSelected(s => ({ ...s, active: !s.active }))
    } catch (err) { alert(err.message) }
    finally { setActionLoading(false) }
  }

  const filtered = customers.filter(c => {
    const q = search.toLowerCase()
    return !q || c.email?.toLowerCase().includes(q) || c.first_name?.toLowerCase().includes(q) || c.last_name?.toLowerCase().includes(q)
  })

  return (
    <div className="page">
      <div className="container">
        <div style={{ marginBottom: 24 }}>
          <Link to="/staff" className="breadcrumb" style={{ marginBottom: 8, display: 'inline-flex' }}>← Panel staff</Link>
          <h1 className="page-title">Clientes</h1>
          <p className="text-muted mt-2">{customers.length} clientes registrados</p>
        </div>

        {selected ? (
          <div>
            <button className="btn btn-ghost btn-sm" style={{ marginBottom: 20 }} onClick={() => setSelected(null)}>
              ← Volver al listado
            </button>
            <div className="grid-2" style={{ alignItems: 'start' }}>
              <div className="card">
                <div className="flex justify-between items-center" style={{ marginBottom: 20 }}>
                  <div>
                    <h2 className="card-title">{selected.first_name} {selected.last_name}</h2>
                    <div className="text-sm text-muted">{selected.email}</div>
                  </div>
                  <span style={{
                    padding: '4px 10px', borderRadius: 'var(--radius-full)',
                    fontSize: '0.75rem', fontWeight: 600,
                    background: selected.active ? 'var(--green-bg)' : 'var(--red-bg)',
                    color: selected.active ? 'var(--green)' : 'var(--red)'
                  }}>
                    {selected.active ? 'Activo' : 'Inactivo'}
                  </span>
                </div>
                <dl>
                  <div className="info-row"><dt>Teléfono</dt><dd>{selected.phone || '—'}</dd></div>
                  <div className="info-row"><dt>Ciudad</dt><dd>{selected.city || '—'}</dd></div>
                  <div className="info-row"><dt>Dirección</dt><dd>{selected.address || '—'}</dd></div>
                  <div className="info-row"><dt>NIF</dt><dd>{selected.nif || '—'}</dd></div>
                  <div className="info-row"><dt>Registro</dt><dd>{fmtDate(selected.created_at)}</dd></div>
                </dl>
                {isManager && (
                  <button
                    className={`btn btn-sm ${selected.active ? 'btn-danger' : 'btn-success'}`}
                    style={{ marginTop: 16 }}
                    onClick={() => toggleActive(selected)}
                    disabled={actionLoading}
                  >
                    {actionLoading ? '...' : selected.active ? 'Desactivar cuenta' : 'Activar cuenta'}
                  </button>
                )}
              </div>

              <div className="card">
                <h3 className="card-title" style={{ marginBottom: 16 }}>Historial de pedidos</h3>
                {ordersLoading ? (
                  <div className="loading-center" style={{ padding: 20 }}><div className="spinner" /></div>
                ) : orders.length === 0 ? (
                  <p className="text-sm text-muted">Sin pedidos</p>
                ) : (
                  orders.map(o => (
                    <div key={o.id} style={{ padding: '10px 0', borderBottom: '1px solid var(--border)', fontSize: '0.875rem' }}>
                      <div className="flex justify-between">
                        <span style={{ fontWeight: 500 }}>Pedido #{o.id}</span>
                        <span className="text-muted">{fmtDate(o.created_at)}</span>
                      </div>
                      <div className="text-xs text-muted mt-2">{o.product_description?.slice(0, 60)}...</div>
                    </div>
                  ))
                )}
              </div>
            </div>
          </div>
        ) : (
          <>
            <div style={{ marginBottom: 20 }}>
              <div className="search-wrap" style={{ maxWidth: 360 }}>
                <span className="search-icon">🔍</span>
                <input
                  type="text"
                  className="search-input"
                  placeholder="Buscar por nombre o email..."
                  value={search}
                  onChange={e => setSearch(e.target.value)}
                />
              </div>
            </div>

            {loading ? (
              <div className="loading-center"><div className="spinner spinner-lg" /></div>
            ) : (
              <div className="table-wrap">
                <table>
                  <thead>
                    <tr>
                      <th>Nombre</th>
                      <th>Email</th>
                      <th>Ciudad</th>
                      <th>Estado</th>
                      <th>Registro</th>
                      <th>Acción</th>
                    </tr>
                  </thead>
                  <tbody>
                    {filtered.map(c => (
                      <tr key={c.id}>
                        <td style={{ fontWeight: 500 }}>{c.first_name} {c.last_name}</td>
                        <td>{c.email}</td>
                        <td>{c.city || '—'}</td>
                        <td>
                          <span style={{
                            padding: '2px 8px', borderRadius: 'var(--radius-full)',
                            fontSize: '0.75rem', fontWeight: 600,
                            background: c.active ? 'var(--green-bg)' : 'var(--red-bg)',
                            color: c.active ? 'var(--green)' : 'var(--red)'
                          }}>
                            {c.active ? 'Activo' : 'Inactivo'}
                          </span>
                        </td>
                        <td>{fmtDate(c.created_at)}</td>
                        <td>
                          <button className="btn btn-outline btn-xs" onClick={() => viewCustomer(c)}>Ver</button>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}
          </>
        )}
      </div>
    </div>
  )
}
