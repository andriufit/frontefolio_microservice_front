import { Link } from 'react-router-dom'

export default function Footer() {
  return (
    <footer className="footer">
      <div className="container">
        <div className="footer-grid">
          <div>
            <div className="footer-brand-name">
              Fronte<span style={{ color: 'var(--terra)' }}>.</span>folio
            </div>
            <p className="footer-brand-desc">
              Importamos productos de más de 50 países directamente a España.
              Tu puerta al comercio global con gestión aduanera incluida.
            </p>
          </div>
          <div>
            <div className="footer-col-title">Plataforma</div>
            <Link to="/catalog" className="footer-link">Catálogo</Link>
            <Link to="/orders/new" className="footer-link">Solicitar producto</Link>
            <Link to="/tracking" className="footer-link">Seguimiento</Link>
            <Link to="/chat" className="footer-link">Soporte</Link>
          </div>
          <div>
            <div className="footer-col-title">Cuenta</div>
            <Link to="/register" className="footer-link">Crear cuenta</Link>
            <Link to="/login" className="footer-link">Iniciar sesión</Link>
            <Link to="/profile" className="footer-link">Mi perfil</Link>
            <Link to="/orders" className="footer-link">Mis pedidos</Link>
          </div>
        </div>
        <div className="footer-bottom">
          <span>© {new Date().getFullYear()} Frontefolio — Solo para demostración (PoC)</span>
          <span>Importación global · Gestión aduanera · Entrega en España</span>
        </div>
      </div>
    </footer>
  )
}
