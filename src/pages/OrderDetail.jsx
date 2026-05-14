import { useEffect, useState } from 'react'
import { Link, useParams, useNavigate } from 'react-router-dom'
import { api } from '../services/api'
import { useAuth } from '../contexts/AuthContext'
import StatusBadge from '../components/StatusBadge'

const ORDER_STEPS = [
  'pending_review', 'searching_supplier', 'offer_sent',
  'offer_accepted', 'processing', 'shipped', 'in_customs', 'delivered'
]
const STEP_LABELS = {
  pending_review: 'Revisión inicial',
  searching_supplier: 'Buscando proveedor',
  offer_sent: 'Oferta enviada',
  offer_accepted: 'Oferta aceptada',
  processing: 'En proceso',
  shipped: 'Enviado',
  in_customs: 'En aduana',
  delivered: 'Entregado',
}

function fmtDate(d) {
  if (!d) return '—'
  return new Date(d).toLocaleDateString('es-ES', { day: 'numeric', month: 'long', year: 'numeric' })
}

function fmtDateTime(d) {
  if (!d) return '—'
  return new Date(d).toLocaleString('es-ES', { day: 'numeric', month: 'short', year: 'numeric', hour: '2-digit', minute: '2-digit' })
}

export default function OrderDetail() {
  const { id } = useParams()
  const { user } = useAuth()
  const navigate = useNavigate()

  const [order, setOrder] = useState(null)
  const [offer, setOffer] = useState(null)
  const [shipment, setShipment] = useState(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')

  const [payForm, setPayForm] = useState({ card_number: '', card_expiry: '', card_cvv: '', card_holder: '' })
  const [payLoading, setPayLoading] = useState(false)
  const [payResult, setPayResult] = useState(null)
  const [actionLoading, setActionLoading] = useState(false)
  const [cancelConfirm, setCancelConfirm] = useState(false)

  async function fetchAll() {
    try {
      const ord = await api.get(`/orders/${id}`)
      setOrder(ord)

      // Fetch offer
      try {
        const offers = await api.get('/offers')
        const myOffer = (Array.isArray(offers) ? offers : offers.offers || []).find(o => o.order_id === Number(id))
        setOffer(myOffer || null)
      } catch {}

      // Fetch shipment
      try {
        const sh = await api.get(`/shipments/order/${id}`)
        setShipment(sh)
      } catch {}
    } catch (err) {
      setError(err.message || 'No se pudo cargar el pedido')
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => { fetchAll() }, [id])

  async function handleOfferAction(action) {
    if (!offer) return
    setActionLoading(true)
    try {
      await api.post(`/offers/${offer.id}/${action}`, {})
      await fetchAll()
    } catch (err) {
      alert(err.message)
    } finally {
      setActionLoading(false)
    }
  }

  async function handlePay(e) {
    e.preventDefault()
    setPayLoading(true)
    setPayResult(null)
    try {
      const res = await api.post('/payments/pay', { order_id: Number(id), ...payForm })
      setPayResult({ ok: true, msg: res.message })
      await fetchAll()
    } catch (err) {
      setPayResult({ ok: false, msg: err.message || 'Pago rechazado' })
    } finally {
      setPayLoading(false)
    }
  }

  async function handleCancel() {
    setActionLoading(true)
    try {
      await api.del(`/orders/${id}`)
      navigate('/orders')
    } catch (err) {
      alert(err.message)
      setActionLoading(false)
    }
  }

  if (loading) return <div className="loading-center"><div className="spinner spinner-lg" /></div>
  if (error) return <div className="page"><div className="container"><div className="alert alert-error">{error}</div></div></div>
  if (!order) return null

  const stepIdx = ORDER_STEPS.indexOf(order.status)
  const canCancel = !['delivered', 'cancelled'].includes(order.status)

  return (
    <div className="page">
      <div className="container">
        <div className="breadcrumb">
          <Link to="/orders">Mis pedidos</Link>
          <span className="breadcrumb-sep">/</span>
          <span>Pedido #{order.id}</span>
        </div>

        <div className="flex justify-between items-center" style={{ marginBottom: 28 }}>
          <div>
            <h1 className="page-title">Pedido #{order.id}</h1>
            <div className="flex items-center gap-2 mt-2">
              <StatusBadge status={order.status} type="order" />
              <span className="text-muted text-sm">{fmtDate(order.created_at)}</span>
            </div>
          </div>
          {canCancel && (
            <div>
              {!cancelConfirm ? (
                <button className="btn btn-danger btn-sm" onClick={() => setCancelConfirm(true)}>Cancelar pedido</button>
              ) : (
                <div className="flex gap-2">
                  <button className="btn btn-danger btn-sm" onClick={handleCancel} disabled={actionLoading}>
                    {actionLoading ? '...' : 'Confirmar cancelación'}
                  </button>
                  <button className="btn btn-ghost btn-sm" onClick={() => setCancelConfirm(false)}>No</button>
                </div>
              )}
            </div>
          )}
        </div>

        <div className="order-detail-grid">
          {/* Main column */}
          <div style={{ display: 'flex', flexDirection: 'column', gap: 20 }}>
            {/* Order info */}
            <div className="detail-card">
              <div className="detail-card-header">
                <span style={{ fontWeight: 600 }}>Detalles del pedido</span>
              </div>
              <div className="detail-card-body">
                <dl>
                  <div className="info-row"><dt>Descripción</dt><dd>{order.product_description}</dd></div>
                  {order.country_name && <div className="info-row"><dt>País de origen</dt><dd>{order.country_flag} {order.country_name}</dd></div>}
                  {order.notes && <div className="info-row"><dt>Notas</dt><dd>{order.notes}</dd></div>}
                  <div className="info-row"><dt>Fecha solicitud</dt><dd>{fmtDateTime(order.created_at)}</dd></div>
                  {order.assigned_staff_name && <div className="info-row"><dt>Gestor asignado</dt><dd>{order.assigned_staff_name}</dd></div>}
                  {order.supplier_name && <div className="info-row"><dt>Proveedor</dt><dd>{order.supplier_name}</dd></div>}
                </dl>
              </div>
            </div>

            {/* Offer */}
            {offer && (
              <div className="detail-card">
                <div className="detail-card-header">
                  <span style={{ fontWeight: 600 }}>Oferta recibida</span>
                  <StatusBadge status={offer.status} type="offer" />
                </div>
                <div className="detail-card-body">
                  <p style={{ marginBottom: 16, color: 'var(--ink2)' }}>{offer.description}</p>
                  <div className="offer-box">
                    <div className="text-xs text-muted" style={{ marginBottom: 8 }}>Precio total (envío + gestión incluida)</div>
                    <div className="offer-price">
                      <span className="offer-currency">{offer.currency} </span>
                      {Number(offer.price).toFixed(2)}
                    </div>
                    {offer.valid_until && (
                      <div className="text-sm text-muted" style={{ marginTop: 8 }}>
                        Válida hasta: {fmtDate(offer.valid_until)}
                      </div>
                    )}
                    {offer.status === 'pending' && (
                      <div className="offer-actions">
                        <button
                          className="btn btn-success"
                          onClick={() => handleOfferAction('accept')}
                          disabled={actionLoading}
                        >
                          {actionLoading ? '...' : '✓ Aceptar oferta'}
                        </button>
                        <button
                          className="btn btn-danger btn-outline"
                          onClick={() => handleOfferAction('reject')}
                          disabled={actionLoading}
                          style={{ background: 'transparent', color: 'var(--red)', borderColor: 'var(--red)' }}
                        >
                          Rechazar
                        </button>
                      </div>
                    )}
                  </div>
                </div>
              </div>
            )}

            {/* Payment form */}
            {order.status === 'offer_accepted' && !payResult?.ok && (
              <div className="detail-card">
                <div className="detail-card-header">
                  <span style={{ fontWeight: 600 }}>Realizar pago</span>
                </div>
                <div className="detail-card-body">
                  <div className="test-cards-hint">
                    💳 <strong>Tarjetas de prueba aprobadas:</strong>{' '}
                    <code>4111111111111111</code>, <code>5500005555555554</code>, <code>4000000000000002</code>
                  </div>

                  {/* Card preview */}
                  <div className="card-preview">
                    <div className="card-chip">▬▬</div>
                    <div className="card-number-preview">
                      {payForm.card_number.replace(/(.{4})/g, '$1 ').trim() || '•••• •••• •••• ••••'}
                    </div>
                    <div className="card-bottom">
                      <div>
                        <div className="card-holder-preview">{payForm.card_holder || 'Nombre titular'}</div>
                      </div>
                      <div className="card-expiry-preview">{payForm.card_expiry || 'MM/AA'}</div>
                    </div>
                  </div>

                  {payResult && !payResult.ok && (
                    <div className="alert alert-error mb-4">{payResult.msg}</div>
                  )}

                  <form onSubmit={handlePay} className="form-stack">
                    <div className="form-group">
                      <label className="form-label">Número de tarjeta <span className="req">*</span></label>
                      <input
                        type="text"
                        className="form-input"
                        placeholder="1234 5678 9012 3456"
                        maxLength={19}
                        value={payForm.card_number}
                        onChange={e => setPayForm(f => ({ ...f, card_number: e.target.value.replace(/\s/g, '').slice(0, 16) }))}
                        required
                      />
                    </div>
                    <div className="form-row">
                      <div className="form-group">
                        <label className="form-label">Caducidad <span className="req">*</span></label>
                        <input
                          type="text"
                          className="form-input"
                          placeholder="MM/AA"
                          maxLength={5}
                          value={payForm.card_expiry}
                          onChange={e => setPayForm(f => ({ ...f, card_expiry: e.target.value }))}
                          required
                        />
                      </div>
                      <div className="form-group">
                        <label className="form-label">CVV <span className="req">*</span></label>
                        <input
                          type="text"
                          className="form-input"
                          placeholder="123"
                          maxLength={4}
                          value={payForm.card_cvv}
                          onChange={e => setPayForm(f => ({ ...f, card_cvv: e.target.value }))}
                          required
                        />
                      </div>
                    </div>
                    <div className="form-group">
                      <label className="form-label">Titular <span className="req">*</span></label>
                      <input
                        type="text"
                        className="form-input"
                        placeholder="Ana García"
                        value={payForm.card_holder}
                        onChange={e => setPayForm(f => ({ ...f, card_holder: e.target.value }))}
                        required
                      />
                    </div>
                    <button type="submit" className="btn btn-primary btn-lg btn-full" disabled={payLoading}>
                      {payLoading ? <><span className="spinner" />Procesando...</> : `Pagar ${offer ? Number(offer.price).toFixed(2) + ' ' + offer.currency : ''}`}
                    </button>
                  </form>
                </div>
              </div>
            )}

            {payResult?.ok && (
              <div className="alert alert-success">{payResult.msg}</div>
            )}

            {/* Shipment */}
            {shipment && (
              <div className="detail-card">
                <div className="detail-card-header">
                  <span style={{ fontWeight: 600 }}>Información de envío</span>
                  <StatusBadge status={shipment.status} type="shipment" />
                </div>
                <div className="detail-card-body">
                  <dl>
                    {shipment.tracking_number && <div className="info-row"><dt>Número tracking</dt><dd style={{ fontFamily: 'monospace' }}>{shipment.tracking_number}</dd></div>}
                    {shipment.carrier && <div className="info-row"><dt>Transportista</dt><dd>{shipment.carrier}</dd></div>}
                    {shipment.estimated_delivery && <div className="info-row"><dt>Entrega estimada</dt><dd>{fmtDate(shipment.estimated_delivery)}</dd></div>}
                    {shipment.notes && <div className="info-row"><dt>Notas</dt><dd>{shipment.notes}</dd></div>}
                  </dl>
                  {shipment.tracking_url && (
                    <a href={shipment.tracking_url} target="_blank" rel="noreferrer" className="btn btn-outline btn-sm" style={{ marginTop: 12 }}>
                      🔗 Rastrear envío externo
                    </a>
                  )}
                </div>
              </div>
            )}
          </div>

          {/* Sidebar: status timeline */}
          <div>
            <div className="detail-card">
              <div className="detail-card-header">
                <span style={{ fontWeight: 600 }}>Estado del proceso</span>
              </div>
              <div className="detail-card-body">
                {order.status === 'cancelled' ? (
                  <div className="alert alert-error">Este pedido ha sido cancelado</div>
                ) : (
                  <div className="status-timeline">
                    {ORDER_STEPS.map((step, i) => {
                      const isDone = i < stepIdx
                      const isActive = i === stepIdx
                      const isLast = i === ORDER_STEPS.length - 1
                      return (
                        <div key={step} className="timeline-step">
                          <div className="timeline-dot-wrap">
                            <div className={`timeline-dot${isDone ? ' done' : isActive ? ' active' : ''}`} />
                            {!isLast && <div className={`timeline-line${isDone ? ' done' : ''}`} />}
                          </div>
                          <div className="timeline-content">
                            <div className="timeline-label" style={{ color: isActive ? 'var(--terra)' : isDone ? 'var(--ink2)' : 'var(--light)' }}>
                              {STEP_LABELS[step]}
                            </div>
                          </div>
                        </div>
                      )
                    })}
                  </div>
                )}
              </div>
            </div>

            <div className="card mt-4" style={{ marginTop: 16 }}>
              <p className="label-sm" style={{ marginBottom: 8 }}>¿Tienes alguna pregunta?</p>
              <p className="text-sm text-muted" style={{ marginBottom: 16 }}>Contacta con nuestro equipo de soporte.</p>
              <Link to="/chat" className="btn btn-outline btn-full btn-sm">Abrir soporte</Link>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}
