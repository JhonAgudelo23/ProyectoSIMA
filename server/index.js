const express = require('express');
const cors = require('cors');
const jwt = require('jsonwebtoken');
const { leerDB, guardarDB, probar } = require('./db');

const app = express();
const PORT = 3000;
const SECRET = '1234';

app.use(cors());
app.use(express.json({ limit: '10mb' }));
app.use(express.urlencoded({ limit: '10mb', extended: true }));

const TIPOS = ['Mal olor', 'Desbordamiento', 'Tapa dañada o sin tapa', 'Basura acumulada', 'Agua estancada', 'Otro'];

function estadoDe(pct) {
  if (pct >= 75) return 'rojo';
  if (pct >= 50) return 'amarillo';
  return 'verde';
}

function auth(rolesPermitidos) {
  return (req, res, next) => {
    const token = (req.headers.authorization || '').replace('Bearer ', '');
    try {
      const u = jwt.verify(token, SECRET);
      if (rolesPermitidos && !rolesPermitidos.includes(u.rol)) {
        return res.status(403).json({ error: 'No tienes permiso para esta acción' });
      }
      req.user = u;
      next();
    } catch (e) {
      res.status(401).json({ error: 'Debes iniciar sesión' });
    }
  };
}

const crearToken = u =>
  jwt.sign({ id: u.id, nombre: u.nombre, email: u.email, rol: u.rol }, SECRET, { expiresIn: '8h' });

// ---------- Ruta raíz informativa de la API ----------
app.get('/', (req, res) => {
  res.json({
    api: 'SIMA REST API Independiente',
    estado: 'online',
    endpoints: [
      'POST   /api/login',
      'POST   /api/auth/registro',
      'GET    /api/admin/operarios',
      'POST   /api/admin/crear-operario',
      'DELETE /api/admin/operarios/:id',
      'GET    /api/pozos',
      'POST   /api/lecturas',
      'GET    /api/reportes/tipos',
      'GET    /api/reportes/comunitarios',
      'GET    /api/reportes',
      'POST   /api/reportes',
      'PATCH  /api/reportes/:id',
      'DELETE /api/reportes/:id',
      'POST   /api/contacto',
      'GET    /api/contacto'
    ]
  });
});

// ---------- Formulario de Contacto (Respaldo en JSON) ----------
app.get('/api/contacto', (req, res) => {
  const db = leerDB();
  res.json(db.mensajes || []);
});

app.post('/api/contacto', (req, res) => {
  const { nombre, email, asunto, mensaje } = req.body;
  if (!nombre || !email || !mensaje) {
    return res.status(400).json({ error: 'Completa nombre, correo y mensaje' });
  }

  const db = leerDB();
  if (!db.mensajes) db.mensajes = [];

  const nuevoMensaje = {
    id: db.mensajes.length ? Math.max(...db.mensajes.map(m => m.id)) + 1 : 1,
    nombre: String(nombre).trim(),
    email: String(email).trim(),
    asunto: String(asunto || 'Consulta desde Portal SIMA').trim(),
    mensaje: String(mensaje).trim(),
    fecha: new Date().toISOString()
  };

  db.mensajes.push(nuevoMensaje);
  guardarDB(db);

  res.status(201).json({
    ok: true,
    mensaje: '¡Mensaje guardado correctamente!'
  });
});

// ---------- Autenticación y Administración ----------
app.post('/api/auth/registro', (req, res) => {
  const { nombre, email, password } = req.body;
  if (!nombre || !email || !password) return res.status(400).json({ error: 'Completa todos los campos' });

  const db = leerDB();
  const correo = String(email).trim().toLowerCase();
  if (db.usuarios.some(u => u.email === correo)) {
    return res.status(409).json({ error: 'Ya existe una cuenta con ese correo' });
  }

  const nuevoId = db.usuarios.length ? Math.max(...db.usuarios.map(u => u.id)) + 1 : 1;
  const user = {
    id: nuevoId,
    nombre: String(nombre).trim(),
    email: correo,
    password: String(password),
    rol: 'ciudadano'
  };
  db.usuarios.push(user);
  guardarDB(db);

  const userSinPass = { id: user.id, nombre: user.nombre, email: user.email, rol: user.rol };
  res.status(201).json({ token: crearToken(userSinPass), user: userSinPass });
});

app.get('/api/admin/operarios', auth(['admin']), (req, res) => {
  const db = leerDB();
  const operarios = db.usuarios
    .filter(u => u.rol === 'operario')
    .map(u => ({ id: u.id, nombre: u.nombre, email: u.email, rol: u.rol }));
  res.json(operarios);
});

app.post('/api/admin/crear-operario', auth(['admin']), (req, res) => {
  const { nombre, email, password } = req.body;
  if (!nombre || !email || !password) return res.status(400).json({ error: 'Faltan datos' });

  const db = leerDB();
  const correo = String(email).trim().toLowerCase();
  if (db.usuarios.some(u => u.email === correo)) {
    return res.status(409).json({ error: 'Ya existe un usuario con este correo' });
  }

  const nuevoId = db.usuarios.length ? Math.max(...db.usuarios.map(u => u.id)) + 1 : 1;
  const operario = {
    id: nuevoId,
    nombre: String(nombre).trim(),
    email: correo,
    password: String(password),
    rol: 'operario'
  };
  db.usuarios.push(operario);
  guardarDB(db);

  res.status(201).json({
    ok: true,
    mensaje: 'Cuenta de operario creada exitosamente',
    usuario: { id: operario.id, nombre: operario.nombre, email: operario.email, rol: 'operario' }
  });
});

app.delete('/api/admin/operarios/:id', auth(['admin']), (req, res) => {
  const db = leerDB();
  const id = Number(req.params.id);
  const index = db.usuarios.findIndex(u => u.id === id && u.rol === 'operario');

  if (index === -1) {
    return res.status(404).json({ error: 'El operario no existe' });
  }

  db.usuarios.splice(index, 1);
  guardarDB(db);
  res.json({ ok: true, mensaje: 'Operario eliminado correctamente' });
});

app.post('/api/login', (req, res) => {
  const email = String(req.body.email || '').trim().toLowerCase();
  const password = String(req.body.password || '');

  const db = leerDB();
  const usuario = db.usuarios.find(u => u.email.toLowerCase() === email);
  if (!usuario) return res.status(400).json({ error: 'Usuario no encontrado' });
  if (usuario.password !== password) return res.status(400).json({ error: 'Contraseña incorrecta' });

  const userObj = { id: usuario.id, nombre: usuario.nombre, email: usuario.email, rol: usuario.rol };
  res.json({ token: crearToken(userObj), user: userObj });
});

// ---------- Pozos y Telemetría ----------
app.get('/api/pozos', auth(), (req, res) => {
  const db = leerDB();
  const lista = db.pozos
    .sort((a, b) => a.codigo.localeCompare(b.codigo))
    .map(p => ({ ...p, estado: estadoDe(p.nivel_pct) }));
  res.json(lista);
});

app.post('/api/lecturas', (req, res) => {
  const { pozo_id, nivel_pct } = req.body;
  const db = leerDB();
  const pozo = db.pozos.find(p => p.id === Number(pozo_id));
  if (pozo) pozo.nivel_pct = Number(nivel_pct);
  db.lecturas.push({
    id: db.lecturas.length + 1,
    pozo_id: Number(pozo_id),
    nivel_pct: Number(nivel_pct),
    fecha: new Date().toISOString()
  });
  guardarDB(db);
  res.status(201).json({ ok: true });
});

// ---------- Rutas de Reportes (CRUD Completo + Evidencia) ----------
app.get('/api/reportes/tipos', (req, res) => res.json(TIPOS));

app.get('/api/reportes/comunitarios', auth(), (req, res) => {
  const db = leerDB();
  const filas = db.reportes
    .filter(r => r.estado !== 'resuelto')
    .sort((a, b) => b.id - a.id)
    .map(r => ({
      id: r.id,
      lat: r.lat,
      lng: r.lng,
      tipo: r.tipo,
      descripcion: r.descripcion,
      evidencia: r.evidencia || null,
      estado: r.estado,
      fecha_reporte: r.fecha_reporte,
      ciudadano: r.ciudadano
    }));
  res.json(filas);
});

app.get('/api/reportes', auth(), (req, res) => {
  const db = leerDB();
  let filas = db.reportes;
  if (req.user.rol === 'ciudadano') {
    filas = filas.filter(r => r.usuario_id === req.user.id);
  }
  res.json([...filas].sort((a, b) => b.id - a.id));
});

app.post('/api/reportes', auth(), (req, res) => {
  const { lat, lng, tipo, descripcion, evidencia, foto, imagen } = req.body;
  if (lat == null || lng == null) return res.status(400).json({ error: 'Selecciona una ubicación en el mapa' });
  if (!TIPOS.includes(tipo)) return res.status(400).json({ error: 'Selecciona el tipo de problema' });

  const db = leerDB();
  const nuevoId = db.reportes.length ? Math.max(...db.reportes.map(r => r.id)) + 1 : 1;
  const archivoEvidencia = evidencia || foto || imagen || null;

  const nuevoReporte = {
    id: nuevoId,
    usuario_id: req.user.id,
    ciudadano: req.user.nombre,
    lat,
    lng,
    tipo,
    descripcion: (descripcion || '').trim(),
    evidencia: archivoEvidencia,
    estado: 'pendiente',
    fecha_reporte: new Date().toISOString(),
    inspeccionado_por: null,
    inspeccionado_por_nombre: null,
    inspeccionado_en: null,
    nota_inspeccion: null,
    resuelto_por: null,
    resuelto_por_nombre: null,
    resuelto_en: null,
    nota_resolucion: null
  };

  db.reportes.push(nuevoReporte);
  guardarDB(db);
  res.status(201).json({ id: nuevoId, reporte: nuevoReporte });
});

app.patch('/api/reportes/:id', auth(['operario', 'admin']), (req, res) => {
  const { estado } = req.body;
  const nota = ((req.body.nota || '') + '').trim() || null;

  const db = leerDB();
  const reporte = db.reportes.find(r => r.id === Number(req.params.id));
  if (!reporte) return res.status(404).json({ error: 'El reporte no existe' });

  if (estado === 'inspeccionado' && reporte.estado === 'pendiente') {
    reporte.estado = 'inspeccionado';
    reporte.inspeccionado_por = req.user.id;
    reporte.inspeccionado_por_nombre = req.user.nombre;
    reporte.inspeccionado_en = new Date().toISOString();
    reporte.nota_inspeccion = nota;
  } else if (estado === 'resuelto' && reporte.estado === 'inspeccionado') {
    reporte.estado = 'resuelto';
    reporte.resuelto_por = req.user.id;
    reporte.resuelto_por_nombre = req.user.nombre;
    reporte.resuelto_en = new Date().toISOString();
    reporte.nota_resolucion = nota;
  } else {
    return res.status(400).json({ error: 'Transición de estado no permitida' });
  }

  guardarDB(db);
  res.json({ ok: true });
});

app.delete('/api/reportes/:id', auth(['admin', 'ciudadano']), (req, res) => {
  const db = leerDB();
  const id = Number(req.params.id);
  const index = db.reportes.findIndex(r => r.id === id);

  if (index === -1) {
    return res.status(404).json({ error: 'El reporte no existe' });
  }

  if (req.user.rol === 'ciudadano' && db.reportes[index].usuario_id !== req.user.id) {
    return res.status(403).json({ error: 'No tienes permiso para eliminar este reporte' });
  }

  db.reportes.splice(index, 1);
  guardarDB(db);
  res.json({ ok: true, mensaje: 'Reporte eliminado correctamente' });
});

// ---------- Simulador IoT (2 segundos - sobrescribe lectura anterior) ----------
setInterval(() => {
  const db = leerDB();
  const ahora = new Date().toISOString();

  db.lecturas = db.pozos.map(p => {
    const delta = Math.floor(Math.random() * 9) - 4;
    p.nivel_pct = Math.max(5, Math.min(100, p.nivel_pct + delta));
    return {
      pozo_id: p.id,
      codigo: p.codigo,
      nivel_pct: p.nivel_pct,
      fecha: ahora
    };
  });

  guardarDB(db);
}, 2000);

probar().then(() => {
  app.listen(PORT, '0.0.0.0', () => console.log('🚀 API SIMA independiente lista en http://localhost:' + PORT));
});