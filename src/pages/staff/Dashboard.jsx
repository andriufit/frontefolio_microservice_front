import { useEffect, useState } from 'react'
import { Link } from 'react-router-dom'
import { api } from '../../services/api'
import { useAuth } from '../../contexts/AuthContext'
import StatusBadge from '../../components/StatusBadge'

function StatCard({ label, value, icon, color = '--terra' }) {
  return (
    <div className="card" style={{ display: 'flex', alignItems: 'center', gap: 20 }}>
      <div style={{
        width: 52, height: 52, borderRadius: '50%',
        background: `var(${color}-bg, var(--terra-bg))`,
        color: `var(${color})`,
        display: 'flex', alignItems: 'center', justifyContent: 'center',
        fontSize: '1.5rem', flexShrink: 0
      }}>
        {icon}
      </div>
      <div>
        <div style={{ fontSize: '1.8rem', fontFamily: 'var(--ff-serif)', fontWeight: 500, lineHeight: 1 }}>{value ?? '—'}</div>
        <div className="text-sm text-muted">{label}</div>
      </div>
    </div>
  )
}

function fmtDate(d) {
  if (!d) return '—'
  return new Date(d).toLocaleDateString('es-ES', { day: 'numeric', month: 'short' })
}

export default function Dashboard() {
  const { user } = useAuth()
  const [orders, setOrders] = useState([])
  const [customers, setCustomers] = useState([])
  const [conversations, setConversations] = useState([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    Promise.all([
      api.get('/orders?limit=50').catch(() => []),
      api.get('/customers').catch(() => []),
      api.get('/chat/conversations').catch(() => []),
    ]).then(([o, c, ch]) => {
      setOrders(Array.isArray(o) ? o : o.orders || [])
      setCustomers(Array.isArray(c) ? c : c.customers || [])
      setConversations(Array.isArray(ch) ? ch : ch.conversations || [])
    }).finally(() => setLoading(false))
  }, [])

  const pendingOrders = orders.filter(o => o.status === 'pending_review')
  const activeOrders = orders.filter(o => ['searching_supplier','offer_sent','offer_accepted','processing','shipped','in_customs'].includes(o.status))
  const openConvs = conversations.filter(c => c.status === 'open')

  const isManager = ['manager', 'admin'].includes(user?.role)

  return (
    <div className="page">
      <div className="container">
        <div style={{ marginBottom: 32 }}>
          <p className="label-sm">Panel staff</p>
          <h1 className="page-title">Bienvenido, {user?.first_name}</h1>
          <p className="text-muted mt-2">Resumen del estado actual de la plataforma</p>
        </div>

        {loading ? (
          <div className="loading-center"><div className="spinner spinner-lg" /></div>
        ) : (
          <>
            {/* Stats */}
            <div className="grid-3" style={{ marginBottom: 36 }}>
              <StatCard label="Pedidos pendientes revisión" value={pendingOrders.length} icon="⏳" color="--amber" />
              <StatCard label="Pedidos activos" value={activeOrders.length} icon="📦" color="--terra" />
              <StatCard label="Conversaciones abiertas" value={openConvs.length} icon="💬" color="--navy" />
            </div>

            {/* Quick links */}
            <div className="grid-2" style={{ marginBottom: 36 }}>
              <div className="card">
                <div className="flex justify-between items-center" style={{ marginBottom: 16 }}>
                  <h3 className="card-title">Pedidos pendientes</h3>
                  <Link to="/staff/orders" className="btn btn-outline btn-xs">Ver todos</Link>
                </div>
                {pendingOrders.length === 0 ? (
                  <p className="text-sm text-muted">No hay pedidos pendientes de revisión</p>
                ) : (
                  <div style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
                    {pendingOrders.slice(0, 5).map(o => (
                      <Link key={o.id} to={`/staff/orders/${o.id}`} style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '8px 0', borderBottom: '1px solid var(--border)', textDecoration: 'none', color: 'inherit' }}>
                        <div>
                          <div className="text-sm" style={{ fontWeight: 500 }}>Pedido #{o.id}</div>
                          <div className="text-xs text-muted">{o.customer_name || ''} · {fmtDate(o.created_at)}</div>
                        </div>
                        <StatusBadge status={o.status} type="order" />
                      </Link>
                    ))}
                  </div>
                )}
              </div>

              <div className="card">
                <div className="flex justify-between items-center" style={{ marginBottom: 16 }}>
                  <h3 className="card-title">Soporte pendiente</h3>
                  <Link to="/chat" className="btn btn-outline btn-xs">Ver chat</Link>
                </div>
                {openConvs.length === 0 ? (
                  <p className="text-sm text-muted">No hay conversaciones abiertas sin asignar</p>
                ) : (
                  <div style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
                    {openConvs.slice(0, 5).map(c => (
                      <div key={c.id} style={{ padding: '8px 0', borderBottom: '1px solid var(--border)' }}>
                        <div className="text-sm" style={{ fontWeight: 500 }}>{c.subject}</div>
                        <div className="text-xs text-muted">{c.customer_name || ''} · {fmtDate(c.created_at)}</div>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            </div>

            {/* Navigation cards */}
            <div style={{ marginBottom: 12 }}>
              <p className="label-sm" style={{ marginBottom: 16 }}>Acceso rápido</p>
              <div className="grid-3">
                <Link to="/staff/orders" className="card card-hover" style={{ textDecoration: 'none', color: 'inherit' }}>
                  <div style={{ fontSize: '2rem', marginBottom: 12 }}>📋</div>
                  <h3 className="card-title" style={{ marginBottom: 6 }}>Gestión de pedidos</h3>
                  <p className="text-sm text-muted">Ver, filtrar y gestionar todos los pedidos</p>
                </Link>
                <Link to="/staff/customers" className="card card-hover" style={{ textDecoration: 'none', color: 'inherit' }}>
                  <div style={{ fontSize: '2rem', marginBottom: 12 }}>👥</div>
                  <h3 className="card-title" style={{ marginBottom: 6 }}>Clientes</h3>
                  <p className="text-sm text-muted">{customers.length} clientes registrados</p>
                </Link>
                <Link to="/staff/suppliers" className="card card-hover" style={{ textDecoration: 'none', color: 'inherit' }}>
                  <div style={{ fontSize: '2rem', marginBottom: 12 }}>🏭</div>
                  <h3 className="card-title" style={{ marginBottom: 6 }}>Proveedores</h3>
                  <p className="text-sm text-muted">Gestionar proveedores por país</p>
                </Link>
                {isManager && (
                  <Link to="/staff/team" className="card card-hover" style={{ textDecoration: 'none', color: 'inherit' }}>
                    <div style={{ fontSize: '2rem', marginBottom: 12 }}>🧑‍💼</div>
                    <h3 className="card-title" style={{ marginBottom: 6 }}>Equipo</h3>
                    <p className="text-sm text-muted">Gestionar empleados y roles</p>
                  </Link>
                )}
              </div>
            </div>
          </>
        )}
      </div>
    </div>
  )
}
