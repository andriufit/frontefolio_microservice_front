import { useEffect, useState } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import { api } from '../services/api'
import StatusBadge from '../components/StatusBadge'

const TABS = [
  { key: '',                label: 'Todos' },
  { key: 'pending_review',  label: 'Pendientes' },
  { key: 'searching_supplier,offer_sent,offer_accepted,processing', label: 'Activos' },
  { key: 'delivered',       label: 'Entregados' },
  { key: 'cancelled',       label: 'Cancelados' },
]

function fmtDate(d) {
  if (!d) return '—'
  return new Date(d).toLocaleDateString('es-ES', { day: 'numeric', month: 'short', year: 'numeric' })
}

export default function Orders() {
  const navigate = useNavigate()
  const [orders, setOrders] = useState([])
  const [loading, setLoading] = useState(true)
  const [activeTab, setActiveTab] = useState('')

  useEffect(() => {
    setLoading(true)
    const params = activeTab ? `?status=${activeTab}` : ''
    api.get(`/orders${params}`)
      .then(d => setOrders(Array.isArray(d) ? d : d.orders || []))
      .catch(() => setOrders([]))
      .finally(() => setLoading(false))
  }, [activeTab])

  return (
    <div className="page">
      <div className="container">
        <div className="flex justify-between items-center mb-6" style={{ marginBottom: 28 }}>
          <div>
            <h1 className="page-title">Mis pedidos</h1>
            <p className="text-muted mt-2">Historial y estado de todas tus solicitudes</p>
          </div>
          <Link to="/orders/new" className="btn btn-primary">+ Nueva solicitud</Link>
        </div>

        <div className="tabs">
          {TABS.map(t => (
            <button
              key={t.key}
              className={`tab-btn${activeTab === t.key ? ' active' : ''}`}
              onClick={() => setActiveTab(t.key)}
            >
              {t.label}
            </button>
          ))}
        </div>

        {loading ? (
          <div className="loading-center"><div className="spinner spinner-lg" /></div>
        ) : orders.length === 0 ? (
          <div className="empty-state">
            <div className="empty-icon">📦</div>
            <h3>Sin pedidos</h3>
            <p>Todavía no tienes pedidos en esta categoría. ¡Haz tu primera solicitud!</p>
            <Link to="/orders/new" className="btn btn-primary">Solicitar producto</Link>
          </div>
        ) : (
          <div className="order-stack">
            {orders.map(order => (
              <div
                key={order.id}
                className="order-card fade-up"
                onClick={() => navigate(`/orders/${order.id}`)}
              >
                <div>
                  <div className="flex items-center gap-2" style={{ marginBottom: 6 }}>
                    <span className="label-sm">Pedido #{order.id}</span>
                    <StatusBadge status={order.status} type="order" />
                  </div>
                  <div className="card-title" style={{ marginBottom: 8 }}>
                    {order.product_description?.length > 80
                      ? order.product_description.slice(0, 80) + '...'
                      : order.product_description}
                  </div>
                  <div className="order-meta">
                    <span className="order-meta-item">📅 {fmtDate(order.created_at)}</span>
                    {order.country_name && <span className="order-meta-item">🌍 {order.country_name}</span>}
                    {order.assigned_staff_name && <span className="order-meta-item">👤 {order.assigned_staff_name}</span>}
                  </div>
                </div>
                <div style={{ flexShrink: 0, color: 'var(--muted)' }}>→</div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  )
}
