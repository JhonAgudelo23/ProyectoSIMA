<template>
  <div class="sima-landing">
    <NavbarComponent></NavbarComponent>

    <header id="inicio" class="hero">
      <div class="hero-content">
        <span class="badge">SIMA - Monitoreo de Alcantarillado</span>
        <h1>Prevención de Inundaciones</h1>
        <p>
          Sistema de monitoreo de niveles de agua en pozos de inspección para detectar 
          bloqueos y prevenir desbordamientos.
        </p>
        <div class="hero-buttons">
          <button class="btn btn-primary" @click="irAlSistema">
            {{ sesion.user ? 'Ir al sistema' : 'Ingresar al sistema' }}
          </button>
          <button class="btn" @click="$router.push('/reportar')">Reportar un problema</button>
        </div>
      </div>

      <div class="hero-card">
        <h3>Estado General</h3>

        <p v-if="sistemaActivo === true" class="status-live">● En vivo (Sistema Operativo)</p>
        <p v-else-if="sistemaActivo === false" class="status-off">○ Sistema fuera de línea</p>
        <p v-else class="status-conectando">Conectando...</p>
        
        <hr />

        <ul class="stats-list">
          <li v-for="(stat, index) in estadisticas" :key="index">
            <strong>{{ stat.porcentaje }}</strong> {{ stat.etiqueta }}
          </li>
          <li v-if="resumen">
            <strong>{{ resumen.reportesAbiertos }}</strong> Reportes ciudadanos abiertos
          </li>
        </ul>
      </div>
    </header>

    <section id="caracteristicas" class="features">
      <h2>Módulos del Sistema</h2>
      <p class="section-subtitle">Opciones disponibles para el usuario</p>

      <div class="features-grid">
        <div 
          class="feature-card" 
          :class="{ clicable: modulo.ruta }"
          v-for="modulo in modulos" 
          :key="modulo.id"
          @click="modulo.ruta && $router.push(modulo.ruta)"
        >
          <h3>{{ modulo.titulo }}</h3>
          <p>{{ modulo.descripcion }}</p>
          <span v-if="modulo.ruta" class="ir">{{ modulo.accion }} →</span>
          <span v-else-if="modulo.nota" class="nota">{{ modulo.nota }}</span>
        </div>
      </div>
    </section>

    <section id="nosotros" class="about">
      <h2>Sobre el Proyecto</h2>
      <p class="section-subtitle">Un sistema que avisa antes de que las alcantarillas se tapen</p>

      <p class="about-texto">
        SIMA coloca pequeños sensores en tuberías y pozos que miden el nivel del agua. Si el agua empieza
        a subir por basura o grasa, el sistema alerta a los operarios para que limpien antes de que se
        forme un desbordamiento o una inundación en la calle.
      </p>

      <div class="about-grid">
        <div class="about-card">
          <h3>Objetivo general</h3>
          <p>
            Evitar inundaciones y desbordamientos de aguas negras mediante un monitoreo automático
            que avise de los bloqueos a tiempo.
          </p>
        </div>

        <div class="about-card">
          <h3>Objetivos específicos</h3>
          <ul>
            <li v-for="(o, i) in objetivos" :key="i">{{ o }}</li>
          </ul>
        </div>

        <div class="about-card">
          <h3>Semáforo de estados</h3>
          <ul class="semaforo">
            <li v-for="n in semaforo" :key="n.color">
              <span class="punto" :class="n.color"></span>
              <span><strong>{{ n.nombre }}</strong> · {{ n.detalle }}</span>
            </li>
          </ul>
        </div>
      </div>

      <h3 class="actores-titulo">¿Quiénes usan SIMA?</h3>
      <div class="actores">
        <span class="actor" v-for="a in actores" :key="a">{{ a }}</span>
      </div>
    </section>

    <section id="contacto" class="contact">
      <h2>Contacto</h2>
      <p class="section-subtitle">¿Dudas, sugerencias o quieres implementar SIMA en tu zona?</p>

      <div class="contact-grid">
        <!-- ⚠️ CAMBIA estos datos por los reales del equipo -->
        <div class="contact-card" v-for="c in contactos" :key="c.titulo">
          <h3>{{ c.titulo }}</h3>
          <p>{{ c.valor }}</p>
        </div>
      </div>

      <div class="contact-buttons">
        <button class="btn btn-primary" @click="$router.push('/reportar')">Reportar un problema</button>
        <button v-if="!sesion.user" class="btn" @click="$router.push('/login')">Iniciar sesión</button>
      </div>
    </section>

    <FooterComponent></FooterComponent>
  </div>
</template>

<script>
import { sesion } from '../services/auth'
import api from '../services/api'

export default {
  name: 'Principal',
  data() {
    return {
      sesion,
      sistemaActivo: null, // null = conectando, true = en línea, false = sin conexión
      resumen: null,
      // Cada módulo cambia de destino según quién esté mirando la página.
      // null = no disponible para ese tipo de usuario (se muestra una nota).
      catalogo: [
        {
          id: 1, titulo: 'Monitoreo Continuo', descripcion: 'Lectura constante del nivel de agua en la red.',
          visitante: { ruta: '/panel?ver=pozos', accion: 'Ingresar' },
          personal: { ruta: '/panel?ver=pozos', accion: 'Ver pozos' },
          ciudadano: null, notaCiudadano: 'Solo para personal autorizado'
        },
        {
          id: 2, titulo: 'Alertas Tempranas', descripcion: 'Notificaciones ordenadas según el nivel de riesgo.',
          visitante: { ruta: '/panel?ver=alertas', accion: 'Ingresar' },
          personal: { ruta: '/panel?ver=alertas', accion: 'Ver alertas' },
          ciudadano: null, notaCiudadano: 'Solo para personal autorizado'
        },
        {
          id: 3, titulo: 'Ubicación', descripcion: 'Visualización de los puntos de control en la ciudad.',
          visitante: { ruta: '/panel?ver=mapa', accion: 'Ingresar' },
          personal: { ruta: '/panel?ver=mapa', accion: 'Ver mapa' },
          ciudadano: { ruta: '/reportar', accion: 'Ver mapa' }
        },
        {
          id: 4, titulo: 'Reportes Ciudadanos', descripcion: 'Los vecinos marcan en el mapa un problema de su sector.',
          visitante: { ruta: '/reportar', accion: 'Reportar' },
          personal: { ruta: '/panel?ver=reportes', accion: 'Ver pendientes' },
          ciudadano: { ruta: '/reportar', accion: 'Reportar' }
        },
        {
          id: 5, titulo: 'Inspección y Solución', descripcion: 'El personal registra la inspección y cierra cada reporte.',
          visitante: { ruta: '/panel?ver=inspeccion', accion: 'Ingresar' },
          personal: { ruta: '/panel?ver=inspeccion', accion: 'Por resolver' },
          ciudadano: { ruta: '/reportar', accion: 'Ver mis reportes' }
        },
        {
          id: 6, titulo: 'Acceso por Roles', descripcion: 'Ciudadanos, operarios y administradores con permisos distintos.',
          visitante: { ruta: '/registro', accion: 'Crear cuenta' },
          personal: null, ciudadano: null
          // con sesión iniciada se muestra el rol del usuario (ver computed)
        }
      ],
      objetivos: [
        'Vigilar las alcantarillas las 24 horas del día.',
        'Detectar acumulación de basura y bloqueos antes de que causen problemas graves.',
        'Avisar de inmediato a los equipos de limpieza mediante un mapa.',
        'Ahorrar dinero y tiempo evitando reparaciones de emergencia.'
      ],
      semaforo: [
        { color: 'verde', nombre: 'Verde', detalle: 'nivel normal (menos de 50%)' },
        { color: 'amarillo', nombre: 'Amarillo', detalle: 'advertencia (50% a 74%)' },
        { color: 'rojo', nombre: 'Rojo', detalle: 'riesgo de desbordamiento (75% o más)' }
      ],
      actores: ['Operarios de campo', 'Administradores', 'Técnicos de mantenimiento', 'Ciudadanos', 'Autoridades municipales'],
      // ⚠️ CAMBIA estos datos por los reales del equipo
      contactos: [
        { titulo: 'Correo', valor: 'jrrivas0814@gmail.com' },
        { titulo: 'Teléfono', valor: '+57 3022706762' },
        { titulo: 'Zona piloto', valor: 'Santa Marta, Magdalena' }
      ]
    }
  },

  computed: {
    // Módulos adaptados al usuario actual (visitante, ciudadano o personal)
    modulos() {
      const u = sesion.user
      const tipo = !u ? 'visitante' : u.rol === 'ciudadano' ? 'ciudadano' : 'personal'
      return this.catalogo.map(m => {
        const destino = m[tipo]
        let nota = ''
        if (!destino) {
          nota = m.id === 6 ? 'Tu rol: ' + (u ? u.rol : '') : (m.notaCiudadano || '')
        }
        return {
          id: m.id, titulo: m.titulo, descripcion: m.descripcion,
          ruta: destino ? destino.ruta : null,
          accion: destino ? destino.accion : '',
          nota
        }
      })
    },
    // Porcentaje de pozos en cada estado (datos reales de la base de datos)
    estadisticas() {
      const r = this.resumen
      const pct = n => (r && r.total ? Math.round((n * 100) / r.total) + '%' : '—')
      return [
        { porcentaje: pct(r && r.verde), etiqueta: 'Operativos' },
        { porcentaje: pct(r && r.amarillo), etiqueta: 'Alerta' },
        { porcentaje: pct(r && r.rojo), etiqueta: 'Críticos' }
      ]
    }
  },

  methods: {
    irAlSistema() {
      if (!sesion.user) return this.$router.push('/login')
      this.$router.push(sesion.user.rol === 'ciudadano' ? '/reportar' : '/panel')
    },
    async cargarResumen() {
      try {
        this.resumen = await api.resumen()
        this.sistemaActivo = true
      } catch (e) {
        this.sistemaActivo = false
      }
    }
  },

  created() {
    this.cargarResumen()
    this.timer = setInterval(this.cargarResumen, 10000)
  },

  beforeUnmount() {
    clearInterval(this.timer)
  }
};
</script>

<style scoped>
.sima-landing {
  font-family: Arial, sans-serif;
  color: #333;
  background-color: #f4f4f4;
}

.hero {
  display: flex;
  justify-content: space-between;
  align-items: flex-start;
  padding: 30px;
  background-color: #e9ecef;
  border-bottom: 1px solid #ccc;
  gap: 20px;
}

.hero-content {
  max-width: 550px;
}

.badge {
  background-color: #d1ecf1;
  color: #0c5460;
  padding: 3px 8px;
  font-size: 0.85rem;
  border-radius: 3px;
}

.hero h1 {
  font-size: 2rem;
  margin: 10px 0;
  color: #222;
}

.hero p {
  font-size: 1rem;
  color: #555;
  line-height: 1.4;
  margin-bottom: 15px;
}

.hero-buttons {
  display: flex;
  gap: 10px;
}

.btn {
  padding: 8px 15px;
  border: 1px solid #ccc;
  border-radius: 4px;
  cursor: pointer;
  font-size: 0.9rem;
}

.btn-primary {
  background-color: #007bff;
  color: white;
  border-color: #007bff;
}

.hero-card {
  background: #ffffff;
  padding: 15px;
  border: 1px solid #ccc;
  border-radius: 5px;
  width: 250px;
}

.hero-card h3 {
  margin: 0;
  font-size: 1.1rem;
}

.status-live {
  color: #28a745;
  font-size: 0.8rem;
  margin: 5px 0 10px 0;
}

.status-off {
  color: #dc3545;
  font-size: 0.8rem;
  margin: 5px 0 10px 0;
}

.stats-list {
  list-style: none;
  padding: 0;
  margin: 10px 0 0 0;
}

.stats-list li {
  padding: 5px 0;
  border-bottom: 1px solid #eee;
  font-size: 0.9rem;
}

.features {
  padding: 30px;
  background-color: #ffffff;
}

.features h2 {
  font-size: 1.5rem;
  margin-bottom: 5px;
}

.section-subtitle {
  color: #666;
  font-size: 0.9rem;
  margin-bottom: 20px;
}

.features-grid {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(220px, 1fr));
  gap: 15px;
}

.feature-card {
  flex: 1;
  background: #f8f9fa;
  padding: 15px;
  border: 1px solid #ddd;
  border-radius: 4px;
}

.feature-card h3 {
  font-size: 1.1rem;
  margin-top: 0;
  margin-bottom: 8px;
}

.feature-card p {
  font-size: 0.88rem;
  color: #555;
  margin: 0;
}

.status-conectando {
  color: #6c757d;
  font-weight: bold;
}

/* Módulos clicables */
.feature-card.clicable {
  cursor: pointer;
  transition: transform 0.15s, box-shadow 0.15s;
}
.feature-card.clicable:hover {
  transform: translateY(-3px);
  box-shadow: 0 6px 16px rgba(0, 0, 0, 0.1);
}
.nota {
  display: inline-block;
  margin-top: 8px;
  color: #6c757d;
  font-size: 0.85rem;
  font-style: italic;
}
.ir {
  display: inline-block;
  margin-top: 8px;
  color: #0284c7;
  font-weight: bold;
  font-size: 0.9rem;
}

/* Sección Proyecto */
.about, .contact {
  padding: 40px 30px;
}
.about {
  background: #fff;
  border-top: 1px solid #ddd;
}
.about h2, .contact h2 {
  margin: 0 0 4px;
  color: #222;
}
.about-texto {
  max-width: 800px;
  line-height: 1.6;
  color: #555;
}
.about-grid {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(260px, 1fr));
  gap: 15px;
  margin-top: 20px;
}
.about-card {
  background: #f8f9fa;
  border: 1px solid #ddd;
  border-radius: 6px;
  padding: 18px;
}
.about-card h3 {
  margin: 0 0 8px;
  font-size: 1.05rem;
}
.about-card p, .about-card li {
  color: #555;
  font-size: 0.92rem;
  line-height: 1.5;
}
.about-card ul {
  padding-left: 18px;
  margin: 0;
}
.semaforo {
  list-style: none;
  padding: 0 !important;
}
.semaforo li {
  display: flex;
  align-items: center;
  gap: 10px;
  margin-bottom: 8px;
}
.punto {
  width: 14px;
  height: 14px;
  border-radius: 50%;
  flex-shrink: 0;
}
.punto.verde { background: #22c55e; }
.punto.amarillo { background: #eab308; }
.punto.rojo { background: #ef4444; }
.actores-titulo {
  margin: 28px 0 10px;
}
.actores {
  display: flex;
  flex-wrap: wrap;
  gap: 8px;
}
.actor {
  background: #d1ecf1;
  color: #0c5460;
  padding: 5px 12px;
  border-radius: 99px;
  font-size: 0.88rem;
}

/* Sección Contacto */
.contact {
  background: #e9ecef;
  border-top: 1px solid #ccc;
}
.contact-grid {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(220px, 1fr));
  gap: 15px;
  margin: 20px 0;
}
.contact-card {
  background: #fff;
  border: 1px solid #ddd;
  border-radius: 6px;
  padding: 18px;
}
.contact-card h3 {
  margin: 0 0 6px;
  font-size: 0.95rem;
  color: #6c757d;
}
.contact-card p {
  margin: 0;
  font-weight: bold;
  color: #222;
}
.contact-buttons {
  display: flex;
  gap: 10px;
}
</style>
