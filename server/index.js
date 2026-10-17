const express = require('express')
const cors = require('cors')
const bcrypt = require('bcryptjs')
const jwt = require('jsonwebtoken')
const { pool, probar } = require('./db')

const app = express()
const PORT = 3000
const SECRET = '1234'

app.use(cors())
app.use(express.json())


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
  const { nombre, email, password } = req.body
  if (!nombre || !email || !password) return res.status(400).json({ error: 'Completa todos los campos' })
  if (password.length < 6) return res.status(400).json({ error: 'La contraseña debe tener mínimo 6 caracteres' })
  if (!/^\S+@\S+\.\S+$/.test(email)) return res.status(400).json({ error: 'Correo no válido' })

  const correo = email.toLowerCase()
  const [existe] = await pool.query('SELECT id FROM usuarios WHERE email = ?', [correo])
  if (existe.length) return res.status(409).json({ error: 'Ya existe una cuenta con ese correo' })

  // Las cuentas creadas desde la web siempre son de ciudadano
  const [info] = await pool.query(
    'INSERT INTO usuarios (nombre, email, password_hash, rol) VALUES (?, ?, ?, ?)',
    [nombre.trim(), correo, bcrypt.hashSync(password, 10), 'ciudadano']
  )
  const user = { id: info.insertId, nombre: nombre.trim(), email: correo, rol: 'ciudadano' }
  res.status(201).json({ token: crearToken(user), user })
})

app.post('/api/auth/login', async (req, res) => {
  const { email, password } = req.body
  const [filas] = await pool.query('SELECT * FROM usuarios WHERE email = ?', [(email || '').toLowerCase()])
  const u = filas[0]
  if (!u || !bcrypt.compareSync(password || '', u.password_hash)) {
    return res.status(401).json({ error: 'Correo o contraseña incorrectos' })
  }
  const user = { id: u.id, nombre: u.nombre, email: u.email, rol: u.rol }
  res.json({ token: crearToken(user), user })
})

// ---------- Pozos (RF01, RF04, RF05, RF07, RF09) ----------
app.get('/api/pozos', auth(), async (req, res) => {
  const [pozos] = await pool.query('SELECT * FROM pozos ORDER BY codigo')
  res.json(pozos.map(p => ({ ...p, estado: estadoDe(p.nivel_pct) })))
})

app.get('/api/pozos/:id/lecturas', auth(), async (req, res) => {
  const [filas] = await pool.query(
    'SELECT nivel_pct, fecha FROM lecturas WHERE pozo_id = ? ORDER BY id DESC LIMIT 20',
    [req.params.id]
  )
  res.json(filas)
})

// RF06: aquí "enviaría" su dato un sensor real
app.post('/api/lecturas', async (req, res) => {
  const { pozo_id, nivel_pct } = req.body
  if (!pozo_id || nivel_pct == null) return res.status(400).json({ error: 'Faltan datos' })
  await pool.query('INSERT INTO lecturas (pozo_id, nivel_pct) VALUES (?, ?)', [pozo_id, nivel_pct])
  await pool.query('UPDATE pozos SET nivel_pct = ? WHERE id = ?', [nivel_pct, pozo_id])
  res.status(201).json({ ok: true })
})

// ---------- Reportes ciudadanos ----------
const TIPOS = ['Mal olor', 'Desbordamiento', 'Tapa dañada o sin tapa', 'Basura acumulada', 'Agua estancada', 'Otro']

app.get('/api/reportes/tipos', (req, res) => res.json(TIPOS))

app.post('/api/reportes', auth(), async (req, res) => {
  const { lat, lng, tipo, descripcion } = req.body
  if (lat == null || lng == null) return res.status(400).json({ error: 'Selecciona una ubicación en el mapa' })
  if (!TIPOS.includes(tipo)) return res.status(400).json({ error: 'Selecciona el tipo de problema' })

  const [info] = await pool.query(
    'INSERT INTO reportes (usuario_id, lat, lng, tipo, descripcion) VALUES (?, ?, ?, ?, ?)',
    [req.user.id, lat, lng, tipo, (descripcion || '').trim()]
  )
  res.status(201).json({ id: info.insertId })
})

// Ciudadano: ve solo los suyos. Operario/admin/tecnico: ven todos.
app.get('/api/reportes', auth(), async (req, res) => {
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
})

// Flujo del reporte: pendiente -> inspeccionado -> resuelto
// Solo el personal (operario, técnico, admin) puede avanzarlo. Se guarda quién y cuándo.
app.patch('/api/reportes/:id', auth(['operario', 'tecnico', 'admin']), async (req, res) => {
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
    let error = 'Cambio de estado no permitido'
    if (actual === 'resuelto') error = 'Este reporte ya está resuelto'
    else if (actual === estado) error = 'Este reporte ya está en ese estado'
    else if (estado === 'resuelto') error = 'Primero debe marcarse como inspeccionado'
    return res.status(400).json({ error })
  }
  res.json({ ok: true })
})

// Resumen público (solo números, sin datos sensibles) para la página principal
app.get('/api/resumen', async (req, res) => {
  const [pozos] = await pool.query('SELECT nivel_pct FROM pozos')
  const conteo = { verde: 0, amarillo: 0, rojo: 0 }
  pozos.forEach(p => conteo[estadoDe(p.nivel_pct)]++)
  const [[abiertos]] = await pool.query("SELECT COUNT(*) AS n FROM reportes WHERE estado <> 'resuelto'")
  res.json({ total: pozos.length, ...conteo, reportesAbiertos: abiertos.n })
})

// ---------- Simulador de sensores (para la demo) ----------
// Cada 5 s mueve un poco el nivel de cada pozo y guarda la lectura.
setInterval(async () => {
  try {
    await pool.query(
      'UPDATE pozos SET nivel_pct = GREATEST(5, LEAST(100, nivel_pct + FLOOR(RAND() * 9) - 4))'
    )
    await pool.query('INSERT INTO lecturas (pozo_id, nivel_pct) SELECT id, nivel_pct FROM pozos')
  } catch (e) {
    console.error('Error en simulador:', e.message)
  }
}, 5000)

// Si algo falla en una consulta, responde JSON en vez de colgarse
app.use((err, req, res, next) => { // eslint-disable-line no-unused-vars
  console.error(err)
  res.status(500).json({ error: 'Error del servidor' })
})

probar().then(() => {
  app.listen(PORT, () => console.log('API SIMA lista en http://localhost:' + PORT))
})