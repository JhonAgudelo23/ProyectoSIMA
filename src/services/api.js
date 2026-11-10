const API_URL = process.env.VUE_APP_API_URL || 'http://localhost:3000/api'

function getHeaders() {
  const token = localStorage.getItem('token')
  return {
    'Content-Type': 'application/json',
    ...(token ? { Authorization: `Bearer ${token}` } : {})
  }
}

async function request(endpoint, options = {}) {
  const url = `${API_URL}${endpoint}`
  let response

  try {
    response = await fetch(url, {
      ...options,
      headers: { ...getHeaders(), ...options.headers }
    })
  } catch (e) {
    throw new Error(`No se pudo conectar con ${url}. ¿Está corriendo el servidor backend Node.js?`)
  }

  const raw = await response.text()
  let data = null
  if (raw) {
    try { data = JSON.parse(raw) } catch { }
  }

  if (!response.ok) {
    throw new Error((data && data.error) || `Error ${response.status}`)
  }

  return data
}

export const login = (email, password) => request('/login', { method: 'POST', body: JSON.stringify({ email, password }) })
export const register = (datos) => request('/auth/registro', { method: 'POST', body: JSON.stringify(datos) })
export const crearOperario = (datos) => request('/admin/crear-operario', { method: 'POST', body: JSON.stringify(datos) })
export const pozos = () => request('/pozos')
export const enviarLectura = (pozo_id, nivel_pct) => request('/lecturas', { method: 'POST', body: JSON.stringify({ pozo_id, nivel_pct }) })
export const reportesTipos = () => request('/reportes/tipos')
export const crearReporte = (reporte) => request('/reportes', { method: 'POST', body: JSON.stringify(reporte) })
export const reportes = () => request('/reportes')
export const reportesComunitarios = () => request('/reportes/comunitarios')
export const cambiarEstadoReporte = (id, estado, nota) => request(`/reportes/${id}`, { method: 'PATCH', body: JSON.stringify({ estado, nota }) })

export default { login, register, crearOperario, pozos, enviarLectura, reportesTipos, crearReporte, reportes, reportesComunitarios, cambiarEstadoReporte }