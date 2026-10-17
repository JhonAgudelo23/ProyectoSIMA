// Conexión a MySQL (la base de datos se crea ejecutando database/sima.sql en Workbench)
const mysql = require('mysql2/promise')

const config = {
  host: process.env.DB_HOST || 'localhost',
  port: process.env.DB_PORT || 3306,
  user: process.env.DB_USER || 'root',
  password: process.env.DB_PASSWORD || '1234',
  database: process.env.DB_NAME || 'sima'
}

const pool = mysql.createPool({
  ...config,
  waitForConnections: true,
  connectionLimit: 10,
  charset: 'utf8mb4',
  dateStrings: true // las fechas llegan como texto "2026-10-16 14:30:00"
})

// Prueba la conexión al arrancar y da un mensaje claro si algo falla
async function probar() {
  try {
    await pool.query('SELECT 1')
    console.log('Conectado a MySQL (base de datos "' + config.database + '")')
  } catch (e) {
    console.error('\n No se pudo conectar a MySQL: ' + e.message)
    if (e.code === 'ER_ACCESS_DENIED_ERROR') console.error('   → Revisa usuario y contraseña en server/db.js')
    if (e.code === 'ER_BAD_DB_ERROR') console.error('   → La base "sima" no existe. Ejecuta database/sima.sql en Workbench')
    if (e.code === 'ECONNREFUSED') console.error('   → MySQL no está corriendo. Inícialo desde Servicios o Workbench')
    process.exit(1)
  }
}

module.exports = { pool, probar }
