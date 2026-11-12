const fs = require('fs');
const path = require('path');

const DB_FILE = path.join(__dirname, 'data.json');

const datosIniciales = {
  usuarios: [
    {
      id: 1,
      nombre: 'Administrador',
      email: 'admin@sima.com',
      password: 'admin123',
      rol: 'admin'
    },
    {
      id: 2,
      nombre: 'Operario SIMA',
      email: 'operario@sima.com',
      password: 'operario123',
      rol: 'operario'
    },
    {
      id: 3,
      nombre: 'Ciudadano Demo',
      email: 'ciudadano@sima.com',
      password: '123456',
      rol: 'ciudadano'
    }
  ],
  pozos: [
    {
      id: 1,
      codigo: 'PZ-001',
      nombre: 'Pozo Centro Histórico',
      sector: 'Centro',
      lat: 11.2408,
      lng: -74.2110,
      nivel_pct: 38,
      capacidad_cm: 250
    },
    {
      id: 2,
      codigo: 'PZ-002',
      nombre: 'Pozo Av. Libertador',
      sector: 'Libertador',
      lat: 11.2425,
      lng: -74.2050,
      nivel_pct: 64,
      capacidad_cm: 300
    },
    {
      id: 3,
      codigo: 'PZ-003',
      nombre: 'Pozo Mercado Público',
      sector: 'Mercado',
      lat: 11.2385,
      lng: -74.2095,
      nivel_pct: 81,
      capacidad_cm: 280
    },
    {
      id: 4,
      codigo: 'PZ-004',
      nombre: 'Pozo Pescaíto Norte',
      sector: 'Pescaíto',
      lat: 11.2510,
      lng: -74.2080,
      nivel_pct: 25,
      capacidad_cm: 260
    },
    {
      id: 5,
      codigo: 'PZ-005',
      nombre: 'Pozo El Rodadero',
      sector: 'Rodadero',
      lat: 11.2045,
      lng: -74.2255,
      nivel_pct: 52,
      capacidad_cm: 320
    }
  ],
  reportes: [
    {
      id: 1,
      usuario_id: 3,
      ciudadano: 'Ciudadano Demo',
      lat: 11.2412,
      lng: -74.2105,
      tipo: 'Mal olor',
      descripcion: 'Olor fuerte en alcantarilla principal del sector',
      evidencia: null,
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
    }
  ],
  lecturas: []
};

function leerDB() {
  if (!fs.existsSync(DB_FILE)) {
    fs.writeFileSync(DB_FILE, JSON.stringify(datosIniciales, null, 2), 'utf8');
    return JSON.parse(JSON.stringify(datosIniciales));
  }
  return JSON.parse(fs.readFileSync(DB_FILE, 'utf8'));
}

function guardarDB(data) {
  fs.writeFileSync(DB_FILE, JSON.stringify(data, null, 2), 'utf8');
}

async function probar() {
  leerDB();
  console.log('✅ Base de datos local lista en server/data.json (sin MySQL)');
}

module.exports = { leerDB, guardarDB, probar };