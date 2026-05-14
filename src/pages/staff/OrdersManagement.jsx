import { useEffect, useState, useCallback } from 'react'
import { Link, useParams, useNavigate } from 'react-router-dom'
import { api } from '../../services/api'
import { useAuth } from '../../contexts/AuthContext'
import StatusBadge from '../../components/StatusBadge'

const STATUS_OPTIONS = [
  { value: '', label: 'Todos' },
  { value: 'pending_review', label: 'Pendiente revisión' },
  { value: 'searching_supplier', label: 'Buscando proveedor' },
  { value: 'offer_sent', label: 'Oferta enviada' },
  { value: 'offer_accepted', label: 'Oferta aceptada' },
  { value: 'processing', label: 'En proceso' },
  { value: 'shipped', label: 'Enviado' },
  { value: 'in_customs', label: 'En aduana' },
  { value: 'delivered', label: 'Entregado' },
  { value: 'cancelled', label: 'Cancelado' },
]

const NEXT_STATUS = {
  pending_review: 'searching_supplier',
  searching_supplier: 'offer_sent',
  offer_sent: null,
  offer_accepted: 'processing',
  processing: 'shipped',
  shipped: 'in_customs',
  in_customs: 'delivered',
}

const NEXT_LABEL = {
  searching_supplier: 'Buscar proveedor',
  offer_sent: 'Enviar oferta',
  processing: 'Poner en proceso',
  shipped: 'Marcar como enviado',
  in_customs: 'En aduana',
  delivered: 'Marcar entregado',
}

function fmtDate(d) {
  if (!d) return '—'
  return new Date(d).toLocaleDateString('es-ES', { day: 'numeric', month: 'short', year: 'numeric' })
}

// Detail modal/view
function OrderDetailView({ orderId, onClose, onRefresh }) {
  const { user } = useAuth()
  const [order, setOrder] = useState(null)
  const [suppliers, setSuppliers] = useState([])
  const [staff, setStaff] = useState([])
  const [loading, setLoading] = useState(true)
  const [actionLoading, setActionLoading] = useState(false)
  const [offerForm, setOfferForm] = useState({ price: '', currency: 'EUR', description: '', valid_until: '' })
  const [shipForm, setShipForm] = useState({ tracking_number: '', carrier: '', estimated_delivery: '', tracking_url: '', notes: '' })
  const [showOfferForm, setShowOfferForm] = useState(false)
  const [showShipForm, setShowShipForm] = useState(false)
  const [noteInput, setNoteInput] = useState('')

  useEffect(() => {
    Promise.all([
      api.get(`/orders/${orderId}`),
      api.get('/suppliers').catch(() => []),
      api.get('/staff').catch(() => []),
    ]).then(([o, s, st]) => {
      setOrder(o)
      setSuppliers(Array.isArray(s) ? s : s.suppliers || [])
      setStaff(Array.isArray(st) ? st : st.staff || [])
    }).finally(() => setLoading(false))
  }, [orderId])

  async function updateStatus(status) {
    setActionLoading(true)
    try {
      await api.put(`/orders/${orderId}/status`, { status, notes: noteInput || undefined })
      const o = await api.get(`/orders/${orderId}`)
      setOrder(o)
      setNoteInput('')
      onRefresh()
    } catch (err) { alert(err.message) }
    finally { setActionLoading(false) }
  }

  async function assignStaff(staffId) {
    setActionLoading(true)
    try {
      await api.put(`/orders/${orderId}/assign`, { staff_id: Number(staffId) })
      const o = await api.get(`/orders/${orderId}`)
      setOrder(o)
    } catch (err) { alert(err.message) }
    finally { setActionLoading(false) }
  }

  async function assignSupplier(supplierId) {
    setActionLoading(true)
    try {
      await api.put(`/orders/${orderId}/supplier`, { supplier_id: Number(supplierId) })
      const o = await api.get(`/orders/${orderId}`)
      setOrder(o)
    } catch (err) { alert(err.message) }
    finally { setActionLoading(false) }
  }

  async function createOffer(e) {
    e.preventDefault()
    setActionLoading(true)
    try {
      await api.post('/offers', { order_id: orderId, ...offerForm, price: Number(offerForm.price) })
      await updateStatus('offer_sent')
      setShowOfferForm(false)
    } catch (err) { alert(err.message) }
    finally { setActionLoading(false) }
  }

  async function createShipment(e) {
    e.preventDefault()
    setActionLoading(true)
    try {
      await api.post('/shipments', { order_id: orderId, ...shipForm })
      await updateStatus('shipped')
      setShowShipForm(false)
    } catch (err) { alert(err.message) }
    finally { setActionLoading(false) }
  }

  if (loading) return <div style={{ padding: 40 }}><div className="loading-center"><div className="spinner spinner-lg" /></div></div>
  if (!order) return null

  const nextStatus = NEXT_STATUS[order.status]
  const isManager = ['manager', 'admin'].includes(user?.role)

  return (
    <div>
      <div className="flex justify-between items-center" style={{ marginBottom: 20 }}>
        <div>
          <h2 className="page-title" style={{ fontSize: '1.4rem' }}>Pedido #{order.id}</h2>
          <StatusBadge status={order.status} type="order" />
        </div>
        <button className="btn btn-ghost btn-sm" onClick={onClose}>✕ Cerrar</button>
      </div>

      <dl style={{ marginBottom: 20 }}>
        <div className="info-row"><dt>Cliente</dt><dd>{order.customer_name || order.customer_id}</dd></div>
        <div className="info-row"><dt>Descripción</dt><dd>{order.product_description}</dd></div>
        {order.country_name && <div className="info-row"><dt>País origen</dt><dd>{order.country_flag} {order.country_name}</dd></div>}
        {order.notes && <div className="info-row"><dt>Notas cliente</dt><dd>{order.notes}</dd></div>}
        <div className="info-row"><dt>Fecha</dt><dd>{fmtDate(order.created_at)}</dd></div>
      </dl>

      {/* Assign staff */}
      <div style={{ marginBottom: 16 }}>
        <label className="form-label">Operador asignado</label>
        <select
          className="form-input"
          value={order.assigned_staff_id || ''}
          onChange={e => e.target.value && assignStaff(e.target.value)}
          disabled={actionLoading}
        >
          <option value="">Sin asignar</option>
          {staff.map(s => (
            <option key={s.id} value={s.id}>{s.first_name} {s.last_name} ({s.role})</option>
          ))}
        </select>
      </div>

      {/* Assign supplier */}
      {['searching_supplier','offer_sent','offer_accepted','processing'].includes(order.status) && (
        <div style={{ marginBottom: 16 }}>
          <label className="form-label">Proveedor asignado</label>
          <select
            className="form-input"
            value={order.supplier_id || ''}
            onChange={e => e.target.value && assignSupplier(e.target.value)}
            disabled={actionLoading}
          >
            <option value="">Sin proveedor</option>
            {suppliers.map(s => (
              <option key={s.id} value={s.id}>{s.name} ({s.country_name})</option>
            ))}
          </select>
        </div>
      )}

      {/* Status update */}
      {!['delivered','cancelled'].includes(order.status) && (
        <div className="card" style={{ background: 'var(--bg)', marginBottom: 16 }}>
          <div className="form-group" style={{ marginBottom: 12 }}>
            <label className="form-label">Nota interna (opcional)</label>
            <input
              type="text"
              className="form-input"
              placeholder="Nota sobre el cambio de estado..."
              value={noteInput}
              onChange={e => setNoteInput(e.target.value)}
            />
          </div>
          <div className="flex gap-2" style={{ flexWrap: 'wrap' }}>
            {nextStatus && nextStatus !== 'offer_sent' && nextStatus !== 'shipped' && (
              <button
                className="btn btn-navy btn-sm"
                onClick={() => updateStatus(nextStatus)}
                disabled={actionLoading}
              >
                {actionLoading ? '...' : `→ ${NEXT_LABEL[nextStatus] || nextStatus}`}
              </button>
            )}
            {order.status === 'searching_supplier' && !showOfferForm && (
              <button className="btn btn-primary btn-sm" onClick={() => setShowOfferForm(true)}>
                + Crear oferta
              </button>
            )}
            {order.status === 'processing' && !showShipForm && (
              <button className="btn btn-primary btn-sm" onClick={() => setShowShipForm(true)}>
                + Crear envío
              </button>
            )}
            {isManager && (
              <button className="btn btn-danger btn-sm" onClick={() => updateStatus('cancelled')} disabled={actionLoading}>
                Cancelar
              </button>
            )}
          </div>
        </div>
      )}

      {/* Offer form */}
      {showOfferForm && (
        <div className="card" style={{ marginBottom: 16 }}>
          <h4 style={{ fontFamily: 'var(--ff-serif)', marginBottom: 16 }}>Nueva oferta</h4>
          <form onSubmit={createOffer} className="form-stack">
            <div className="form-row">
              <div className="form-group">
                <label className="form-label">Precio <span className="req">*</span></label>
                <input type="number" step="0.01" className="form-input" value={offerForm.price} onChange={e => setOfferForm(f => ({...f, price: e.target.value}))} required />
              </div>
              <div className="form-group">
                <label className="form-label">Divisa</label>
                <select className="form-input" value={offerForm.currency} onChange={e => setOfferForm(f => ({...f, currency: e.target.value}))}>
                  <option>EUR</option><option>USD</option><option>GBP</option>
                </select>
              </div>
            </div>
            <div className="form-group">
              <label className="form-label">Descripción <span className="req">*</span></label>
              <textarea className="form-input" rows={3} value={offerForm.description} onChange={e => setOfferForm(f => ({...f, description: e.target.value}))} required />
            </div>
            <div className="form-group">
              <label className="form-label">Válida hasta</label>
              <input type="datetime-local" className="form-input" value={offerForm.valid_until} onChange={e => setOfferForm(f => ({...f, valid_until: e.target.value}))} />
            </div>
            <div className="flex gap-2">
              <button type="submit" className="btn btn-primary btn-sm" disabled={actionLoading}>{actionLoading ? '...' : 'Enviar oferta'}</button>
              <button type="button" className="btn btn-ghost btn-sm" onClick={() => setShowOfferForm(false)}>Cancelar</button>
            </div>
          </form>
        </div>
      )}

      {/* Shipment form */}
      {showShipForm && (
        <div className="card" style={{ marginBottom: 16 }}>
          <h4 style={{ fontFamily: 'var(--ff-serif)', marginBottom: 16 }}>Crear envío</h4>
          <form onSubmit={createShipment} className="form-stack">
            <div className="form-row">
              <div className="form-group">
                <label className="form-label">Nº tracking</label>
                <input type="text" className="form-input" value={shipForm.tracking_number} onChange={e => setShipForm(f => ({...f, tracking_number: e.target.value}))} />
              </div>
              <div className="form-group">
                <label className="form-label">Transportista</label>
                <input type="text" className="form-input" placeholder="DHL, FedEx..." value={shipForm.carrier} onChange={e => setShipForm(f => ({...f, carrier: e.target.value}))} />
              </div>
            </div>
            <div className="form-row">
              <div className="form-group">
                <label className="form-label">Entrega estimada</label>
                <input type="date" className="form-input" value={shipForm.estimated_delivery} onChange={e => setShipForm(f => ({...f, estimated_delivery: e.target.value}))} />
              </div>
              <div className="form-group">
                <label className="form-label">URL tracking</label>
                <input type="url" className="form-input" value={shipForm.tracking_url} onChange={e => setShipForm(f => ({...f, tracking_url: e.target.value}))} />
              </div>
            </div>
            <div className="form-group">
              <label className="form-label">Notas</label>
              <input type="text" className="form-input" value={shipForm.notes} onChange={e => setShipForm(f => ({...f, notes: e.target.value}))} />
            </div>
            <div className="flex gap-2">
              <button type="submit" className="btn btn-primary btn-sm" disabled={actionLoading}>{actionLoading ? '...' : 'Crear envío'}</button>
              <button type="button" className="btn btn-ghost btn-sm" onClick={() => setShowShipForm(false)}>Cancelar</button>
            </div>
          </form>
        </div>
      )}
    </div>
  )
}

export default function OrdersManagement() {
  const [orders, setOrders] = useState([])
  const [loading, setLoading] = useState(true)
  const [statusFilter, setStatusFilter] = useState('')
  const [selectedId, setSelectedId] = useState(null)

  const fetchOrders = useCallback(() => {
    setLoading(true)
    const q = statusFilter ? `?status=${statusFilter}&limit=100` : '?limit=100'
    api.get(`/orders${q}`)
      .then(d => setOrders(Array.isArray(d) ? d : d.orders || []))
      .catch(() => setOrders([]))
      .finally(() => setLoading(false))
  }, [statusFilter])

  useEffect(() => { fetchOrders() }, [fetchOrders])

  return (
    <div className="page">
      <div className="container">
        <div style={{ marginBottom: 28 }}>
          <Link to="/staff" className="breadcrumb" style={{ marginBottom: 8 }}>
            ← Panel staff
          </Link>
          <h1 className="page-title">Gestión de pedidos</h1>
        </div>

        {selectedId ? (
          <div className="card">
            <OrderDetailView
              orderId={selectedId}
              onClose={() => setSelectedId(null)}
              onRefresh={fetchOrders}
            />
          </div>
        ) : (
          <>
            <div className="flex gap-3 items-center" style={{ marginBottom: 20, flexWrap: 'wrap' }}>
              <select className="form-input" style={{ maxWidth: 240 }} value={statusFilter} onChange={e => setStatusFilter(e.target.value)}>
                {STATUS_OPTIONS.map(o => <option key={o.value} value={o.value}>{o.label}</option>)}
              </select>
              <span className="text-muted text-sm">{orders.length} pedido{orders.length !== 1 ? 's' : ''}</span>
            </div>

            {loading ? (
              <div className="loading-center"><div className="spinner spinner-lg" /></div>
            ) : orders.length === 0 ? (
              <div className="empty-state">
                <div className="empty-icon">📋</div>
                <h3>Sin pedidos</h3>
                <p>No hay pedidos con el filtro seleccionado.</p>
              </div>
            ) : (
              <div className="table-wrap">
                <table>
                  <thead>
                    <tr>
                      <th>#</th>
                      <th>Cliente</th>
                      <th>Descripción</th>
                      <th>País</th>
                      <th>Estado</th>
                      <th>Fecha</th>
                      <th>Acción</th>
                    </tr>
                  </thead>
                  <tbody>
                    {orders.map(o => (
                      <tr key={o.id}>
                        <td style={{ fontWeight: 600 }}>#{o.id}</td>
                        <td>{o.customer_name || `ID ${o.customer_id}`}</td>
                        <td style={{ maxWidth: 200 }}>
                          <span title={o.product_description}>
                            {o.product_description?.length > 50
                              ? o.product_description.slice(0, 50) + '...'
                              : o.product_description}
                          </span>
                        </td>
                        <td>{o.country_name || '—'}</td>
                        <td><StatusBadge status={o.status} type="order" /></td>
                        <td>{fmtDate(o.created_at)}</td>
                        <td>
                          <button
                            className="btn btn-outline btn-xs"
                            onClick={() => setSelectedId(o.id)}
                          >
                            Gestionar
                          </button>
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
