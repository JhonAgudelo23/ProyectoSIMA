import { sesion } from './auth'

// Todas las llamadas al backend pasan por aquí
async function pedir(ruta, opciones = {}) {
  const headers = { 'Content-Type': 'application/json' }
  if (sesion.token) headers.Authorization = 'Bearer ' + sesion.token

  const res = await fetch('/api' + ruta, { ...opciones, headers })
  const datos = await res.json().catch(() => ({}))
  if (!res.ok) throw new Error(datos.error || 'Error del servidor')
  return datos
}

export default {
  registro: d => pedir('/auth/registro', { method: 'POST', body: JSON.stringify(d) }),
  login: d => pedir('/auth/login', { method: 'POST', body: JSON.stringify(d) }),
  pozos: () => pedir('/pozos'),
  tiposReporte: () => pedir('/reportes/tipos'),
  crearReporte: d => pedir('/reportes', { method: 'POST', body: JSON.stringify(d) }),
  reportes: () => pedir('/reportes'),
  cambiarEstadoReporte: (id, estado, nota) =>
    pedir('/reportes/' + id, { method: 'PATCH', body: JSON.stringify({ estado, nota }) }),
  resumen: () => pedir('/resumen')
}
