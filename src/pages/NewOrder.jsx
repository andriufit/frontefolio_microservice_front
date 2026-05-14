import { useEffect, useState } from 'react'
import { useNavigate, useSearchParams } from 'react-router-dom'
import { api } from '../services/api'

export default function NewOrder() {
  const navigate = useNavigate()
  const [searchParams] = useSearchParams()
  const [countries, setCountries] = useState([])
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')

  const [form, setForm] = useState({
    product_description: '',
    country_id: searchParams.get('country_id') || '',
    product_id: searchParams.get('product_id') || '',
    notes: ''
  })

  useEffect(() => {
    api.get('/countries').then(d => setCountries(Array.isArray(d) ? d : d.countries || [])).catch(() => {})
  }, [])

  function set(field) {
    return e => setForm(f => ({ ...f, [field]: e.target.value }))
  }

  async function handleSubmit(e) {
    e.preventDefault()
    if (!form.product_description.trim()) { setError('Describe el producto que necesitas'); return }
    setError('')
    setLoading(true)
    try {
      const body = {
        product_description: form.product_description,
        notes: form.notes || undefined,
        country_id: form.country_id ? Number(form.country_id) : undefined,
        product_id: form.product_id ? Number(form.product_id) : null,
      }
      const order = await api.post('/orders', body)
      navigate(`/orders/${order.id || order.order?.id}`)
    } catch (err) {
      setError(err.message || 'Error al crear el pedido')
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="page">
      <div className="container">
        <div style={{ marginBottom: 32 }}>
          <h1 className="page-title">Solicitar producto</h1>
          <p className="text-muted mt-2">Cuéntanos qué necesitas y nuestro equipo buscará el mejor proveedor</p>
        </div>

        <div className="new-order-grid">
          {/* Form */}
          <div className="card">
            {error && <div className="alert alert-error mb-4">{error}</div>}
            <form onSubmit={handleSubmit} className="form-stack">
              <div className="form-group">
                <label className="form-label">¿Qué producto necesitas? <span className="req">*</span></label>
                <textarea
                  className="form-input"
                  placeholder="Ej: Kimono de seda artesanal de Kioto, color azul marino, talla M. Preferiblemente tejido a mano..."
                  rows={5}
                  value={form.product_description}
                  onChange={set('product_description')}
                  required
                />
                <span className="form-hint">Sé lo más específico posible: marca, modelo, color, talla, características...</span>
              </div>

              <div className="form-group">
                <label className="form-label">País de origen</label>
                <select className="form-input" value={form.country_id} onChange={set('country_id')}>
                  <option value="">Cualquier país (nuestro equipo decide)</option>
                  {countries.map(c => (
                    <option key={c.id} value={c.id}>
                      {c.flag ? `${c.flag} ` : ''}{c.name}
                    </option>
                  ))}
                </select>
              </div>

              <div className="form-group">
                <label className="form-label">Notas adicionales</label>
                <textarea
                  className="form-input"
                  placeholder="Presupuesto máximo, fecha límite, preferencias de envío..."
                  rows={3}
                  value={form.notes}
                  onChange={set('notes')}
                />
              </div>

              <button type="submit" className="btn btn-primary btn-lg" disabled={loading}>
                {loading ? <><span className="spinner" />Enviando solicitud...</> : 'Enviar solicitud'}
              </button>
            </form>
          </div>

          {/* Info sidebar */}
          <div style={{ display: 'flex', flexDirection: 'column', gap: 20 }}>
            <div className="card">
              <h3 className="card-title" style={{ marginBottom: 20 }}>¿Qué pasa después?</h3>
              <div className="process-steps">
                <div className="process-step-item">
                  <div className="process-step-icon">1</div>
                  <div className="process-step-info">
                    <h4>Revisamos tu solicitud</h4>
                    <p>Nuestro equipo analiza tu pedido en menos de 24 horas.</p>
                  </div>
                </div>
                <div className="process-step-item">
                  <div className="process-step-icon">2</div>
                  <div className="process-step-info">
                    <h4>Buscamos proveedor</h4>
                    <p>Contactamos proveedores de confianza en el país de origen.</p>
                  </div>
                </div>
                <div className="process-step-item">
                  <div className="process-step-icon">3</div>
                  <div className="process-step-info">
                    <h4>Recibes una oferta</h4>
                    <p>Te enviamos precio final con envío y gestión aduanera incluida.</p>
                  </div>
                </div>
                <div className="process-step-item">
                  <div className="process-step-icon">4</div>
                  <div className="process-step-info">
                    <h4>Aceptas y pagamos</h4>
                    <p>Si aceptas, procesamos el pago y gestionamos el envío.</p>
                  </div>
                </div>
                <div className="process-step-item">
                  <div className="process-step-icon">5</div>
                  <div className="process-step-info">
                    <h4>Lo recibes en España</h4>
                    <p>Te entregamos en tu dirección una vez pasa aduanas.</p>
                  </div>
                </div>
              </div>
            </div>

            <div className="card" style={{ background: 'var(--terra-bg)', border: '1px solid var(--terra-mid)' }}>
              <p className="label-sm" style={{ marginBottom: 8 }}>💡 Consejo</p>
              <p className="text-sm" style={{ color: 'var(--ink2)', lineHeight: 1.6 }}>
                Cuanto más detallada sea tu descripción, más precisa será nuestra oferta.
                Puedes incluir links de referencia en las notas.
              </p>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}
