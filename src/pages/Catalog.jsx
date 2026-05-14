import { useEffect, useState, useCallback } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import { api } from '../services/api'

const CATEGORY_ICONS = ['📦','👗','🏠','🍜','💄','🎎','🎵','🌿','🔧','⌚']

export default function Catalog() {
  const navigate = useNavigate()
  const [products, setProducts] = useState([])
  const [categories, setCategories] = useState([])
  const [countries, setCountries] = useState([])
  const [loading, setLoading] = useState(true)
  const [pagination, setPagination] = useState({ page: 1, total: 0, pages: 1 })

  const [filters, setFilters] = useState({ search: '', category_id: '', country_id: '' })
  const [inputSearch, setInputSearch] = useState('')

  const fetchProducts = useCallback(async (page = 1) => {
    setLoading(true)
    try {
      const params = new URLSearchParams({ page, limit: 12 })
      if (filters.search) params.set('search', filters.search)
      if (filters.category_id) params.set('category_id', filters.category_id)
      if (filters.country_id) params.set('country_id', filters.country_id)
      params.set('active', 'true')
      const data = await api.get(`/inventory?${params}`)
      setProducts(Array.isArray(data) ? data : data.products || data.data || [])
      if (data.pagination) setPagination(data.pagination)
    } catch {
      setProducts([])
    } finally {
      setLoading(false)
    }
  }, [filters])

  useEffect(() => {
    api.get('/inventory/categories').then(d => setCategories(Array.isArray(d) ? d : d.categories || [])).catch(() => {})
    api.get('/countries').then(d => setCountries(Array.isArray(d) ? d : d.countries || [])).catch(() => {})
  }, [])

  useEffect(() => { fetchProducts(1) }, [fetchProducts])

  function handleSearch(e) {
    e.preventDefault()
    setFilters(f => ({ ...f, search: inputSearch }))
  }

  function setFilter(key, value) {
    setFilters(f => ({ ...f, [key]: value }))
  }

  return (
    <div className="page">
      <div className="container">
        <div style={{ marginBottom: 32 }}>
          <h1 className="page-title">Catálogo de productos</h1>
          <p className="text-muted mt-2">Productos disponibles para importación directa</p>
        </div>

        <div className="catalog-layout">
          {/* Sidebar */}
          <aside className="catalog-sidebar card">
            <div className="filter-block">
              <div className="filter-block-title">Categoría</div>
              <label className="filter-option">
                <input type="radio" name="cat" checked={!filters.category_id} onChange={() => setFilter('category_id', '')} />
                Todas
              </label>
              {categories.map((c, i) => (
                <label key={c.id} className="filter-option">
                  <input type="radio" name="cat" checked={filters.category_id === String(c.id)} onChange={() => setFilter('category_id', String(c.id))} />
                  {CATEGORY_ICONS[i % CATEGORY_ICONS.length]} {c.name}
                </label>
              ))}
            </div>

            <div className="filter-block">
              <div className="filter-block-title">País de origen</div>
              <label className="filter-option">
                <input type="radio" name="country" checked={!filters.country_id} onChange={() => setFilter('country_id', '')} />
                Todos
              </label>
              {countries.slice(0, 15).map(c => (
                <label key={c.id} className="filter-option">
                  <input type="radio" name="country" checked={filters.country_id === String(c.id)} onChange={() => setFilter('country_id', String(c.id))} />
                  {c.flag && <span>{c.flag}</span>} {c.name}
                </label>
              ))}
            </div>
          </aside>

          {/* Main */}
          <div>
            <div className="catalog-header">
              <form onSubmit={handleSearch} style={{ flex: 1, maxWidth: 400 }}>
                <div className="search-wrap">
                  <span className="search-icon">🔍</span>
                  <input
                    type="text"
                    className="search-input"
                    placeholder="Buscar productos..."
                    value={inputSearch}
                    onChange={e => setInputSearch(e.target.value)}
                  />
                </div>
              </form>
              <Link to="/orders/new" className="btn btn-primary">
                + Solicitar producto
              </Link>
            </div>

            {loading ? (
              <div className="loading-center"><div className="spinner spinner-lg" /></div>
            ) : products.length === 0 ? (
              <div className="empty-state">
                <div className="empty-icon">📦</div>
                <h3>Sin resultados</h3>
                <p>No hay productos con esos filtros. Prueba a cambiar la búsqueda o solicita un producto a medida.</p>
                <Link to="/orders/new" className="btn btn-primary">Solicitar producto</Link>
              </div>
            ) : (
              <>
                <div className="product-grid">
                  {products.map(p => (
                    <div key={p.id} className="product-card" onClick={() => navigate(`/catalog/${p.id}`)}>
                      <div className="product-img">
                        {p.image_url
                          ? <img src={p.image_url} alt={p.name} style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
                          : <span style={{ opacity: 0.4 }}>📦</span>}
                      </div>
                      <div className="product-body">
                        <div className="product-country">
                          {p.country_flag && <span>{p.country_flag}</span>}
                          {p.country_name || 'Internacional'}
                        </div>
                        <div className="product-name">{p.name}</div>
                        {p.estimated_price && (
                          <div className="product-price">
                            {Number(p.estimated_price).toFixed(2)}
                            <span className="currency"> {p.currency || 'EUR'}</span>
                          </div>
                        )}
                        {p.stock > 0 && (
                          <div className="text-xs text-muted mt-2">{p.stock} en stock</div>
                        )}
                      </div>
                    </div>
                  ))}
                </div>

                {pagination.pages > 1 && (
                  <div className="pagination">
                    <button
                      className="page-btn"
                      disabled={pagination.page <= 1}
                      onClick={() => fetchProducts(pagination.page - 1)}
                    >
                      ←
                    </button>
                    {Array.from({ length: pagination.pages }, (_, i) => i + 1).map(p => (
                      <button
                        key={p}
                        className={`page-btn${p === pagination.page ? ' active' : ''}`}
                        onClick={() => fetchProducts(p)}
                      >
                        {p}
                      </button>
                    ))}
                    <button
                      className="page-btn"
                      disabled={pagination.page >= pagination.pages}
                      onClick={() => fetchProducts(pagination.page + 1)}
                    >
                      →
                    </button>
                  </div>
                )}
              </>
            )}
          </div>
        </div>
      </div>
    </div>
  )
}
