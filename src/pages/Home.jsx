import { useEffect, useState } from 'react'
import { Link } from 'react-router-dom'
import { api } from '../services/api'
import { useAuth } from '../contexts/AuthContext'

const SAMPLE_FLAGS = ['🇯🇵','🇨🇳','🇮🇳','🇧🇷','🇲🇽','🇹🇷','🇰🇷','🇹🇭','🇻🇳','🇲🇦','🇪🇬','🇿🇦','🇦🇷','🇨🇴','🇵🇪','🇬🇧','🇫🇷','🇩🇪','🇮🇹','🇵🇹']

export default function Home() {
  const { user } = useAuth()
  const [countries, setCountries] = useState([])

  useEffect(() => {
    api.get('/countries').then(data => setCountries(Array.isArray(data) ? data : data.countries || [])).catch(() => {})
  }, [])

  return (
    <>
      {/* Hero */}
      <section className="hero">
        <div className="container">
          <div className="hero-inner">
            <div>
              <div className="hero-eyebrow">Importación global simplificada</div>
              <h1>
                El mundo en<br />
                tu <em>puerta</em>
              </h1>
              <p className="hero-subtitle">
                Solicita cualquier producto de más de 50 países. Nosotros gestionamos
                proveedores, aduanas y envío hasta España.
              </p>
              <div className="hero-ctas">
                {user ? (
                  <>
                    <Link to="/orders/new" className="btn btn-primary btn-lg">Solicitar producto</Link>
                    <Link to="/catalog" className="btn btn-lg" style={{ background: 'rgba(255,255,255,0.1)', color: '#fff', borderColor: 'rgba(255,255,255,0.2)' }}>Ver catálogo</Link>
                  </>
                ) : (
                  <>
                    <Link to="/register" className="btn btn-primary btn-lg">Empezar gratis</Link>
                    <Link to="/catalog" className="btn btn-lg" style={{ background: 'rgba(255,255,255,0.1)', color: '#fff', borderColor: 'rgba(255,255,255,0.2)' }}>Ver catálogo</Link>
                  </>
                )}
              </div>
              <div className="hero-stats">
                <div>
                  <div className="hero-stat-num">50+</div>
                  <div className="hero-stat-label">Países origen</div>
                </div>
                <div>
                  <div className="hero-stat-num">100%</div>
                  <div className="hero-stat-label">Gestión aduanera</div>
                </div>
                <div>
                  <div className="hero-stat-num">24h</div>
                  <div className="hero-stat-label">Respuesta inicial</div>
                </div>
              </div>
            </div>
            <div className="hero-globe">🌍</div>
          </div>
        </div>
      </section>

      {/* Steps */}
      <section className="steps-section">
        <div className="container">
          <p className="label-sm" style={{ textAlign: 'center', marginBottom: 12 }}>Cómo funciona</p>
          <h2 className="section-title" style={{ textAlign: 'center' }}>Tan sencillo como tres pasos</h2>
          <div className="steps-grid">
            <div className="step-card fade-up fade-up-1">
              <div className="step-number">01</div>
              <h3>Describe tu producto</h3>
              <p>Cuéntanos qué necesitas y de qué país. Puedes ser tan específico como quieras: marca, modelo, color, talla...</p>
            </div>
            <div className="step-card fade-up fade-up-2">
              <div className="step-number">02</div>
              <h3>Recibe tu oferta</h3>
              <p>Nuestro equipo busca proveedores de confianza en el país de origen y te enviamos una oferta con precio final incluido todo.</p>
            </div>
            <div className="step-card fade-up fade-up-3">
              <div className="step-number">03</div>
              <h3>Recibe en España</h3>
              <p>Gestionamos el envío internacional, los trámites aduaneros y la entrega final en tu dirección en España.</p>
            </div>
          </div>
        </div>
      </section>

      {/* Countries */}
      <section className="countries-section">
        <div className="container">
          <p className="label-sm" style={{ textAlign: 'center', marginBottom: 12 }}>Nuestra cobertura</p>
          <h2 className="section-title" style={{ textAlign: 'center' }}>Importamos desde todo el mundo</h2>
          <div className="countries-grid">
            {(countries.length > 0 ? countries.slice(0, 24) : SAMPLE_FLAGS.map((f, i) => ({ id: i, name: `País ${i+1}`, flag: f }))).map((c, i) => (
              <div key={c.id || i} className="country-chip">
                <span className="flag">{c.flag || SAMPLE_FLAGS[i % SAMPLE_FLAGS.length]}</span>
                <span>{c.name}</span>
              </div>
            ))}
          </div>
          {countries.length > 24 && (
            <p className="countries-more">Y {countries.length - 24} países más disponibles</p>
          )}
        </div>
      </section>

      {/* CTA band */}
      <section className="cta-band">
        <div className="container">
          <h2>¿Listo para importar?</h2>
          <p>Crea tu cuenta gratis y solicita tu primer producto en menos de 5 minutos.</p>
          {user ? (
            <Link to="/orders/new" className="btn btn-white btn-lg">Hacer mi primera solicitud</Link>
          ) : (
            <Link to="/register" className="btn btn-white btn-lg">Crear cuenta gratis</Link>
          )}
        </div>
      </section>
    </>
  )
}
