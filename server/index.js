const express = require('express')
const cors = require('cors')
const jwt = require('jsonwebtoken')
const { pool, probar } = require('./db')

const app = express()
const PORT = 3000
const SECRET = '1234'

app.use(cors())
app.use(express.json({ limit: '10mb' }))
app.use(express.urlencoded({ limit: '10mb', extended: true }))

const TIPOS = ['Mal olor', 'Desbordamiento', 'Tapa dañada o sin tapa', 'Basura acumulada', 'Agua estancada', 'Otro']

function estadoDe(pct) {
  if (pct >= 75) return 'rojo'
  if (pct >= 50) return 'amarillo'
  return 'verde'
}

function auth(rolesPermitidos) {
  return (req, res, next) => {
    const token = (req.headers.authorization || '').replace('Bearer ', '')
    try {
      const u = jwt.verify(token, SECRET)
      if (rolesPermitidos && !rolesPermitidos.includes(u.rol)) {
        return res.status(403).json({ error: 'No tienes permiso para esta acción' })
      }
      req.user = u
      next()
    } catch (e) {
      res.status(401).json({ error: 'Debes iniciar sesión' })
    }
  }
}

const crearToken = u =>
  jwt.sign({ id: u.id, nombre: u.nombre, email: u.email, rol: u.rol }, SECRET, { expiresIn: '8h' })

// ---------- Autenticación ----------
app.post('/api/auth/registro', async (req, res) => {
  try {
    const { nombre, email, password } = req.body
    if (!nombre || !email || !password) return res.status(400).json({ error: 'Completa todos los campos' })

    const correo = String(email).trim().toLowerCase()
    const [existe] = await pool.query('SELECT id FROM usuarios WHERE email = ?', [correo])
    if (existe.length) return res.status(409).json({ error: 'Ya existe una cuenta con ese correo' })

    const [info] = await pool.query(
      'INSERT INTO usuarios (nombre, email, password, rol) VALUES (?, ?, ?, ?)',
      [String(nombre).trim(), correo, String(password), 'ciudadano']
    )
    const user = { id: info.insertId, nombre: String(nombre).trim(), email: correo, rol: 'ciudadano' }
    res.status(201).json({ token: crearToken(user), user })
  } catch (err) {
    res.status(500).json({ error: err.message })
  }
})

app.post('/api/admin/crear-operario', auth(['admin']), async (req, res) => {
  try {
    const { nombre, email, password } = req.body
    if (!nombre || !email || !password) return res.status(400).json({ error: 'Faltan datos' })

    const correo = String(email).trim().toLowerCase()
    const [existe] = await pool.query('SELECT id FROM usuarios WHERE email = ?', [correo])
    if (existe.length) return res.status(409).json({ error: 'Ya existe un usuario con este correo' })

    const [info] = await pool.query(
      'INSERT INTO usuarios (nombre, email, password, rol) VALUES (?, ?, ?, ?)',
      [String(nombre).trim(), correo, String(password), 'operario']
    )
    res.status(201).json({ ok: true, mensaje: 'Cuenta de operario creada exitosamente', usuario: { id: info.insertId, nombre, email: correo, rol: 'operario' } })
  } catch (err) {
    res.status(500).json({ error: err.message })
  }
})

app.post('/api/login', async (req, res) => {
  try {
    const email = String(req.body.email || '').trim().toLowerCase()
    const password = String(req.body.password || '')

    const [rows] = await pool.query('SELECT * FROM usuarios WHERE LOWER(email) = ?', [email])
    if (rows.length === 0) return res.status(400).json({ error: 'Usuario no encontrado' })

    const usuario = rows[0]
    if (usuario.password !== password) return res.status(400).json({ error: 'Contraseña incorrecta' })

    const userObj = { id: usuario.id, nombre: usuario.nombre, email: usuario.email, rol: usuario.rol }
    res.json({ token: crearToken(userObj), user: userObj })
  } catch (err) {
    res.status(500).json({ error: err.message })
  }
})

// ---------- Pozos y Telemetría ----------
app.get('/api/pozos', auth(), async (req, res) => {
  try {
    const [pozos] = await pool.query('SELECT * FROM pozos ORDER BY codigo')
    res.json(pozos.map(p => ({ ...p, estado: estadoDe(p.nivel_pct) })))
  } catch (err) {
    res.status(500).json({ error: err.message })
  }
})

app.post('/api/lecturas', async (req, res) => {
  try {
    const { pozo_id, nivel_pct } = req.body
    await pool.query('INSERT INTO lecturas (pozo_id, nivel_pct) VALUES (?, ?)', [pozo_id, nivel_pct])
    await pool.query('UPDATE pozos SET nivel_pct = ? WHERE id = ?', [nivel_pct, pozo_id])
    res.status(201).json({ ok: true })
  } catch (err) {
    res.status(500).json({ error: err.message })
  }
})

// ---------- Rutas de Reportes ----------
app.get('/api/reportes/tipos', (req, res) => res.json(TIPOS))

app.get('/api/reportes/comunitarios', auth(), async (req, res) => {
  try {
    const [filas] = await pool.query(
      `SELECT r.id, r.lat, r.lng, r.tipo, r.descripcion, r.estado, r.fecha_reporte, u.nombre AS ciudadano
       FROM reportes r
       JOIN usuarios u ON u.id = r.usuario_id
       WHERE r.estado <> 'resuelto'
       ORDER BY r.id DESC`
    )
    res.json(filas)
  } catch (err) {
    res.status(500).json({ error: err.message })
  }
})

app.get('/api/reportes', auth(), async (req, res) => {
  try {
    const base = `SELECT r.*, u.nombre AS ciudadano,
                         ui.nombre AS inspeccionado_por_nombre,
                         ur.nombre AS resuelto_por_nombre
                  FROM reportes r
                  JOIN usuarios u ON u.id = r.usuario_id
                  LEFT JOIN usuarios ui ON ui.id = r.inspeccionado_por
                  LEFT JOIN usuarios ur ON ur.id = r.resuelto_por`
    const [filas] = req.user.rol === 'ciudadano'
      ? await pool.query(base + ' WHERE r.usuario_id = ? ORDER BY r.id DESC', [req.user.id])
      : await pool.query(base + ' ORDER BY r.id DESC')
    res.json(filas)
  } catch (err) {
    res.status(500).json({ error: err.message })
  }
})

app.post('/api/reportes', auth(), async (req, res) => {
  try {
    const { lat, lng, tipo, descripcion, evidencia } = req.body
    if (lat == null || lng == null) return res.status(400).json({ error: 'Selecciona una ubicación en el mapa' })
    if (!TIPOS.includes(tipo)) return res.status(400).json({ error: 'Selecciona el tipo de problema' })

    const [info] = await pool.query(
      'INSERT INTO reportes (usuario_id, lat, lng, tipo, descripcion, evidencia) VALUES (?, ?, ?, ?, ?, ?)',
      [req.user.id, lat, lng, tipo, (descripcion || '').trim(), evidencia || null]
    )
    res.status(201).json({ id: info.insertId })
  } catch (err) {
    res.status(500).json({ error: err.message })
  }
})

app.patch('/api/reportes/:id', auth(['operario', 'admin']), async (req, res) => {
  try {
    const { estado } = req.body
    const nota = ((req.body.nota || '') + '').trim() || null

    const [filas] = await pool.query('SELECT estado FROM reportes WHERE id = ?', [req.params.id])
    if (!filas.length) return res.status(404).json({ error: 'El reporte no existe' })
    const actual = filas[0].estado

    if (estado === 'inspeccionado' && actual === 'pendiente') {
      await pool.query(
        `UPDATE reportes SET estado = 'inspeccionado', inspeccionado_por = ?,
               inspeccionado_en = NOW(), nota_inspeccion = ? WHERE id = ?`,
        [req.user.id, nota, req.params.id]
      )
    } else if (estado === 'resuelto' && actual === 'inspeccionado') {
      await pool.query(
        `UPDATE reportes SET estado = 'resuelto', resuelto_por = ?,
               resuelto_en = NOW(), nota_resolucion = ? WHERE id = ?`,
        [req.user.id, nota, req.params.id]
      )
    } else {
      return res.status(400).json({ error: 'Transición de estado no permitida' })
    }
    res.json({ ok: true })
  } catch (err) {
    res.status(500).json({ error: err.message })
  }
})

// ---------- Simulador IoT (2 segundos) ----------
setInterval(async () => {
  try {
    await pool.query('UPDATE pozos SET nivel_pct = GREATEST(5, LEAST(100, nivel_pct + FLOOR(RAND() * 9) - 4))')
    await pool.query('INSERT INTO lecturas (pozo_id, nivel_pct) SELECT id, nivel_pct FROM pozos')
  } catch (e) {
    console.error('Error en simulador:', e.message)
  }
}, 2000)

probar().then(() => {
  app.listen(PORT, () => console.log('🚀 API SIMA lista en http://localhost:' + PORT))
})