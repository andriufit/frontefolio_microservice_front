import { useState, useRef, useEffect } from 'react'
import { Link, NavLink, useNavigate } from 'react-router-dom'
import { useAuth } from '../contexts/AuthContext'

export default function Navbar() {
  const { user, logout } = useAuth()
  const navigate = useNavigate()
  const [menuOpen, setMenuOpen] = useState(false)
  const [mobileOpen, setMobileOpen] = useState(false)
  const menuRef = useRef(null)

  useEffect(() => {
    function handler(e) {
      if (menuRef.current && !menuRef.current.contains(e.target)) setMenuOpen(false)
    }
    document.addEventListener('mousedown', handler)
    return () => document.removeEventListener('mousedown', handler)
  }, [])

  function handleLogout() {
    logout()
    navigate('/')
    setMenuOpen(false)
    setMobileOpen(false)
  }

  const isStaff = user && ['operator', 'manager', 'admin'].includes(user.role)
  const initials = user ? `${user.first_name?.[0] || ''}${user.last_name?.[0] || ''}` : ''

  return (
    <nav className="navbar" style={{ position: 'relative' }}>
      <div className="container navbar-inner">
        <Link to="/" className="navbar-logo">
          <span className="logo-text">Fronte<span className="logo-dot">.</span>folio</span>
        </Link>

        <div className="navbar-nav">
          <NavLink to="/catalog" className={({ isActive }) => `nav-link${isActive ? ' active' : ''}`}>Catálogo</NavLink>
          {user && (
            <>
              <NavLink to="/orders" className={({ isActive }) => `nav-link${isActive ? ' active' : ''}`}>Mis pedidos</NavLink>
              <NavLink to="/tracking" className={({ isActive }) => `nav-link${isActive ? ' active' : ''}`}>Seguimiento</NavLink>
              <NavLink to="/chat" className={({ isActive }) => `nav-link${isActive ? ' active' : ''}`}>Soporte</NavLink>
            </>
          )}
          {isStaff && (
            <NavLink to="/staff" className={({ isActive }) => `nav-link${isActive ? ' active' : ''}`}>Panel staff</NavLink>
          )}
        </div>

        <div className="navbar-right">
          {user ? (
            <div className="user-menu-wrap" ref={menuRef}>
              <button className="user-btn" onClick={() => setMenuOpen(o => !o)}>
                <span className="avatar">{initials}</span>
                <span className="user-name-text">{user.first_name}</span>
                <span style={{ fontSize: '0.7rem', opacity: 0.6 }}>▾</span>
              </button>
              {menuOpen && (
                <div className="user-dropdown">
                  <div style={{ padding: '10px 12px 6px', borderBottom: '1px solid var(--border)', marginBottom: 4 }}>
                    <div style={{ fontWeight: 600, fontSize: '0.875rem' }}>{user.first_name} {user.last_name}</div>
                    <div style={{ fontSize: '0.75rem', color: 'var(--muted)' }}>{user.email}</div>
                    <div style={{ marginTop: 4 }}>
                      <span className="badge" style={{ background: 'var(--bg2)', color: 'var(--ink2)', fontSize: '0.7rem' }}>{user.role}</span>
                    </div>
                  </div>
                  <Link to="/profile" className="dropdown-item" onClick={() => setMenuOpen(false)}>
                    <span>👤</span> Mi perfil
                  </Link>
                  <Link to="/orders" className="dropdown-item" onClick={() => setMenuOpen(false)}>
                    <span>📦</span> Mis pedidos
                  </Link>
                  {isStaff && (
                    <Link to="/staff" className="dropdown-item" onClick={() => setMenuOpen(false)}>
                      <span>⚙️</span> Panel staff
                    </Link>
                  )}
                  <div className="dropdown-sep" />
                  <button className="dropdown-item dropdown-item-red" onClick={handleLogout}>
                    <span>🚪</span> Cerrar sesión
                  </button>
                </div>
              )}
            </div>
          ) : (
            <div className="auth-links">
              <Link to="/login" className="btn btn-ghost btn-sm">Entrar</Link>
              <Link to="/register" className="btn btn-primary btn-sm">Registrarse</Link>
            </div>
          )}
          <button
            className="hamburger"
            onClick={() => setMobileOpen(o => !o)}
            aria-label="Menú"
          >
            {mobileOpen ? '✕' : '☰'}
          </button>
        </div>
      </div>

      <div className={`mobile-nav${mobileOpen ? ' open' : ''}`}>
        <Link to="/catalog" className="mobile-nav-link" onClick={() => setMobileOpen(false)}>Catálogo</Link>
        {user && (
          <>
            <Link to="/orders" className="mobile-nav-link" onClick={() => setMobileOpen(false)}>Mis pedidos</Link>
            <Link to="/tracking" className="mobile-nav-link" onClick={() => setMobileOpen(false)}>Seguimiento</Link>
            <Link to="/chat" className="mobile-nav-link" onClick={() => setMobileOpen(false)}>Soporte</Link>
          </>
        )}
        {isStaff && (
          <Link to="/staff" className="mobile-nav-link" onClick={() => setMobileOpen(false)}>Panel staff</Link>
        )}
        <div className="mobile-nav-divider" />
        {user ? (
          <>
            <Link to="/profile" className="mobile-nav-link" onClick={() => setMobileOpen(false)}>Mi perfil</Link>
            <button
              onClick={handleLogout}
              style={{ padding: '10px 14px', color: 'var(--red)', background: 'none', border: 'none', width: '100%', textAlign: 'left', cursor: 'pointer', fontSize: '0.9375rem', borderRadius: 'var(--radius)' }}
            >
              Cerrar sesión
            </button>
          </>
        ) : (
          <>
            <Link to="/login" className="mobile-nav-link" onClick={() => setMobileOpen(false)}>Entrar</Link>
            <Link to="/register" className="mobile-nav-link" onClick={() => setMobileOpen(false)}>Registrarse</Link>
          </>
        )}
      </div>
    </nav>
  )
}
