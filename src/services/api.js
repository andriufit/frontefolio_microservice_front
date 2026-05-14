const BASE = 'http://localhost:3000/api'

function getToken() {
  return localStorage.getItem('token')
}

async function req(path, options = {}) {
  const headers = { 'Content-Type': 'application/json', ...options.headers }
  const t = getToken()
  if (t) headers.Authorization = `Bearer ${t}`

  const res = await fetch(`${BASE}${path}`, { ...options, headers })
  let data
  try { data = await res.json() } catch { data = {} }

  if (!res.ok) {
    const err = new Error(data.message || `Error ${res.status}`)
    err.status = res.status
    throw err
  }
  return data
}

export const api = {
  get: (path) => req(path),
  post: (path, body) => req(path, { method: 'POST', body: JSON.stringify(body) }),
  put: (path, body) => req(path, { method: 'PUT', body: JSON.stringify(body) }),
  patch: (path, body) => req(path, { method: 'PATCH', body: JSON.stringify(body) }),
  del: (path) => req(path, { method: 'DELETE' }),
}
