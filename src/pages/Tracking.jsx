import { useEffect, useState } from 'react'
import { Link } from 'react-router-dom'
import { api } from '../services/api'
import StatusBadge from '../components/StatusBadge'

const SHIPMENT_STEPS = ['preparing', 'picked_up', 'in_transit', 'in_customs', 'out_for_delivery', 'delivered']
const STEP_LABELS = {
  preparing: 'Preparando',
  picked_up: 'Recogido',
  in_transit: 'En tránsito',
  in_customs: 'En aduana',
  out_for_delivery: 'En reparto',
  delivered: 'Entregado',
}

function fmtDate(d) {
  if (!d) return '—'
  return new Date(d).toLocaleDateString('es-ES', { day: 'numeric', month: 'short', year: 'numeric' })
}

export default function Tracking() {
  const [shipments, setShipments] = useState([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    api.get('/shipments')
      .then(d => setShipments(Array.isArray(d) ? d : d.shipments || []))
      .catch(() => setShipments([]))
      .finally(() => setLoading(false))
  }, [])

  return (
    <div className="page">
      <div className="container">
        <div style={{ marginBottom: 32 }}>
          <h1 className="page-title">Seguimiento de envíos</h1>
          <p className="text-muted mt-2">Estado actual de todos tus envíos en curso</p>
        </div>

        {loading ? (
          <div className="loading-center"><div className="spinner spinner-lg" /></div>
        ) : shipments.length === 0 ? (
          <div className="empty-state">
            <div className="empty-icon">📍</div>
            <h3>Sin envíos activos</h3>
            <p>Cuando tu pedido sea enviado aparecerá aquí el seguimiento en tiempo real.</p>
            <Link to="/orders" className="btn btn-primary">Ver mis pedidos</Link>
          </div>
        ) : (
          <div style={{ display: 'flex', flexDirection: 'column', gap: 20 }}>
            {shipments.map(sh => {
              const stepIdx = SHIPMENT_STEPS.indexOf(sh.status)
              return (
                <div key={sh.id} className="shipment-card">
                  <div className="flex justify-between items-center" style={{ marginBottom: 16 }}>
                    <div>
                      <div className="flex items-center gap-2">
                        <span className="label-sm">Pedido #{sh.order_id}</span>
                        <StatusBadge status={sh.status} type="shipment" />
                      </div>
                      {sh.tracking_number && (
                        <div className="text-sm text-muted mt-2" style={{ fontFamily: 'monospace' }}>
                          {sh.tracking_number} {sh.carrier && `· ${sh.carrier}`}
                        </div>
                      )}
                    </div>
                    <div style={{ textAlign: 'right', flexShrink: 0 }}>
                      {sh.estimated_delivery && (
                        <>
                          <div className="text-xs text-muted">Entrega estimada</div>
                          <div style={{ fontWeight: 600, fontSize: '0.9rem' }}>{fmtDate(sh.estimated_delivery)}</div>
                        </>
                      )}
                    </div>
                  </div>

                  {/* Progress bar */}
                  <div className="shipment-progress">
                    {SHIPMENT_STEPS.map((step, i) => {
                      const isDone = i <= stepIdx
                      const isActive = i === stepIdx
                      const isLast = i === SHIPMENT_STEPS.length - 1
                      return (
                        <div key={step} style={{ display: 'flex', alignItems: 'center', flex: isLast ? 0 : 1 }}>
                          <div className="progress-step" style={{ flex: '0 0 auto' }}>
                            <div className={`progress-dot${isDone && !isActive ? ' done' : isActive ? ' active' : ''}`} />
                            <div className="progress-label" style={{
                              color: isActive ? 'var(--terra)' : isDone ? 'var(--green)' : 'var(--light)',
                              fontWeight: isActive ? 600 : 400
                            }}>
                              {STEP_LABELS[step]}
                            </div>
                          </div>
                          {!isLast && <div className={`progress-line${isDone ? ' done' : ''}`} style={{ flex: 1 }} />}
                        </div>
                      )
                    })}
                  </div>

                  {sh.notes && (
                    <div className="text-sm" style={{ marginTop: 12, color: 'var(--muted)', borderTop: '1px solid var(--border)', paddingTop: 12 }}>
                      {sh.notes}
                    </div>
                  )}

                  <div className="flex gap-2" style={{ marginTop: 16 }}>
                    <Link to={`/orders/${sh.order_id}`} className="btn btn-outline btn-sm">Ver pedido</Link>
                    {sh.tracking_url && (
                      <a href={sh.tracking_url} target="_blank" rel="noreferrer" className="btn btn-ghost btn-sm">
                        🔗 Rastrear externo
                      </a>
                    )}
                  </div>
                </div>
              )
            })}
          </div>
        )}
      </div>
    </div>
  )
}
