const API_URL = 'http://localhost:3000/api';

function getHeaders(conJson = true) {
  const token = localStorage.getItem('token');
  const headers = {};
  if (conJson) headers['Content-Type'] = 'application/json';
  if (token) headers['Authorization'] = `Bearer ${token}`;
  return headers;
}

async function manejarRespuesta(res) {
  const texto = await res.text();
  let data;
  try {
    data = JSON.parse(texto);
  } catch {
    throw new Error('Respuesta inválida del servidor');
  }
  if (!res.ok) {
    throw new Error(data.error || 'Error en la petición a la API');
  }
  return data;
}

// --- Contacto ---
export async function enviarContacto(datos) {
  const res = await fetch(`${API_URL}/contacto`, {
    method: 'POST',
    headers: getHeaders(true),
    body: JSON.stringify(datos)
  });
  return manejarRespuesta(res);
}

// --- Funciones de Autenticación y Administración ---
export async function login(emailOrObj, password) {
  const payload = typeof emailOrObj === 'object'
    ? emailOrObj
    : { email: emailOrObj, password };

  const res = await fetch(`${API_URL}/login`, {
    method: 'POST',
    headers: getHeaders(true),
    body: JSON.stringify(payload)
  });
  return manejarRespuesta(res);
}

export async function register(nombreOrObj, email, password) {
  const payload = typeof nombreOrObj === 'object'
    ? nombreOrObj
    : { nombre: nombreOrObj, email, password };

  const res = await fetch(`${API_URL}/auth/registro`, {
    method: 'POST',
    headers: getHeaders(true),
    body: JSON.stringify(payload)
  });
  return manejarRespuesta(res);
}

export async function obtenerOperarios() {
  const res = await fetch(`${API_URL}/admin/operarios`, {
    headers: getHeaders(false)
  });
  return manejarRespuesta(res);
}

export async function crearOperario(nombreOrObj, email, password) {
  const payload = typeof nombreOrObj === 'object'
    ? nombreOrObj
    : { nombre: nombreOrObj, email, password };

  const res = await fetch(`${API_URL}/admin/crear-operario`, {
    method: 'POST',
    headers: getHeaders(true),
    body: JSON.stringify(payload)
  });
  return manejarRespuesta(res);
}

export async function eliminarOperario(id) {
  const res = await fetch(`${API_URL}/admin/operarios/${id}`, {
    method: 'DELETE',
    headers: getHeaders(false)
  });
  return manejarRespuesta(res);
}

// --- Funciones de Pozos y Telemetría ---
export async function pozos() {
  const res = await fetch(`${API_URL}/pozos`, {
    headers: getHeaders(false)
  });
  return manejarRespuesta(res);
}

export const getPozos = pozos;
export const obtenerPozos = pozos;

export async function enviarLectura(pozoIdOrObj, nivel_pct) {
  const payload = typeof pozoIdOrObj === 'object'
    ? pozoIdOrObj
    : { pozo_id: pozoIdOrObj, nivel_pct };

  const res = await fetch(`${API_URL}/lecturas`, {
    method: 'POST',
    headers: getHeaders(true),
    body: JSON.stringify(payload)
  });
  return manejarRespuesta(res);
}

// --- Funciones de Reportes (CRUD Completo + Evidencia) ---
export async function reportesTipos() {
  const res = await fetch(`${API_URL}/reportes/tipos`);
  return manejarRespuesta(res);
}

export const obtenerTipos = reportesTipos;

export async function reportesComunitarios() {
  const res = await fetch(`${API_URL}/reportes/comunitarios`, {
    headers: getHeaders(false)
  });
  return manejarRespuesta(res);
}

export const obtenerReportesComunitarios = reportesComunitarios;

export async function reportes() {
  const res = await fetch(`${API_URL}/reportes`, {
    headers: getHeaders(false)
  });
  return manejarRespuesta(res);
}

export const getReportes = reportes;
export const obtenerReportes = reportes;

export async function crearReporte(datos) {
  const res = await fetch(`${API_URL}/reportes`, {
    method: 'POST',
    headers: getHeaders(true),
    body: JSON.stringify(datos)
  });
  return manejarRespuesta(res);
}

export async function cambiarEstadoReporte(id, estado, nota = '') {
  const res = await fetch(`${API_URL}/reportes/${id}`, {
    method: 'PATCH',
    headers: getHeaders(true),
    body: JSON.stringify({ estado, nota })
  });
  return manejarRespuesta(res);
}

export const actualizarReporte = cambiarEstadoReporte;

export async function eliminarReporte(id) {
  const res = await fetch(`${API_URL}/reportes/${id}`, {
    method: 'DELETE',
    headers: getHeaders(false)
  });
  return manejarRespuesta(res);
}

export default {
  enviarContacto,
  login,
  register,
  obtenerOperarios,
  crearOperario,
  eliminarOperario,
  pozos,
  getPozos,
  obtenerPozos,
  enviarLectura,
  reportesTipos,
  obtenerTipos,
  reportesComunitarios,
  obtenerReportesComunitarios,
  reportes,
  getReportes,
  obtenerReportes,
  crearReporte,
  cambiarEstadoReporte,
  actualizarReporte,
  eliminarReporte
};