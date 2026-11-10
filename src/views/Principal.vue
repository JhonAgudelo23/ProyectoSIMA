<template>
  <div class="pagina-principal">
    <NavbarComponent />

    <main class="contenido-principal">
      <!-- Seccion Hero -->
      <section class="hero-section">
        <div class="hero-content">
          <span class="badge-status">🟢 SIMA - Monitoreo de Alcantarillado</span>
          <h1 class="titulo-hero">Prevención de Inundaciones</h1>
          <p class="descripcion-hero">
            Sistema telemétrico en tiempo real para el control de niveles de agua en pozos de inspección urbana.
            Detectamos bloqueos por basuras y grasas antes de que se produzcan desbordamientos.
          </p>
          <div class="hero-buttons">
            <router-link v-if="sesion?.user && sesion.user.rol !== 'ciudadano'" to="/panel" class="btn-primary">Ir al
              sistema</router-link>
            <router-link v-else-if="sesion?.user" to="/reportar" class="btn-primary">Reportar un problema</router-link>
            <router-link v-else to="/login" class="btn-primary">Ir al sistema</router-link>
            <router-link to="/contacto" class="btn-secondary">Contacto & Soporte</router-link>
          </div>
        </div>

        <div class="estado-card">
          <h3>Estado General</h3>
          <p class="sub-estado">● En vivo (Sistema Operativo)</p>
          <hr class="divider" />
          <div class="metricas-rapidas">
            <div class="metrica-item">
              <span><strong>{{ resumen.verde || 0 }}%</strong> Operativos</span>
            </div>
            <div class="metrica-item">
              <span><strong>{{ resumen.amarillo || 0 }}%</strong> Alerta</span>
            </div>
            <div class="metrica-item">
              <span><strong>{{ resumen.rojo || 0 }}%</strong> Críticos</span>
            </div>
            <div class="metrica-item mt-2">
              <span><strong>{{ resumen.reportesAbiertos || 0 }}</strong> Reportes ciudadanos abiertos</span>
            </div>
          </div>
        </div>
      </section>

      <!-- Seccion Modulos -->
      <section class="modulos-section">
        <h2>Módulos del Sistema</h2>
        <p class="sub-modulos">Opciones disponibles para el usuario</p>

        <div class="grid-modulos">
          <div class="card-modulo">
            <div class="icon-mod">📡</div>
            <h3>Monitoreo Continuo</h3>
            <p>Lectura constante del nivel de agua y concentración de gases en los pozos.</p>
          </div>

          <div class="card-modulo">
            <div class="icon-mod">⚠️</div>
            <h3>Alertas Tempranas</h3>
            <p>Notificaciones ordenadas según el nivel de riesgo operacional en la red.</p>
          </div>

          <div class="card-modulo">
            <div class="icon-mod">🗺️</div>
            <h3>Ubicación Geolocalizada</h3>
            <p>Visualización de los puntos de inspección en el mapa interactivo de la ciudad.</p>
          </div>

          <div class="card-modulo">
            <div class="icon-mod">📢</div>
            <h3>Reportes Ciudadanos</h3>
            <p>Los vecinos pueden reportar incidencias directas adjuntando fotos de evidencia.</p>
          </div>
        </div>
      </section>
    </main>

    <FooterComponent />
  </div>
</template>

<script>
import NavbarComponent from '../components/NavbarComponent.vue'
import FooterComponent from '../components/FooterComponent.vue'
import { sesion } from '../services/auth'
import api from '../services/api'

export default {
  name: 'Principal',
  components: { NavbarComponent, FooterComponent },
  data() {
    return {
      sesion,
      resumen: { verde: 40, amarillo: 20, rojo: 40, reportesAbiertos: 0 }
    }
  },
  async created() {
    try {
      const data = await api.resumen()
      if (data && data.total > 0) {
        this.resumen = {
          verde: Math.round((data.verde / data.total) * 100),
          amarillo: Math.round((data.amarillo / data.total) * 100),
          rojo: Math.round((data.rojo / data.total) * 100),
          reportesAbiertos: data.reportesAbiertos || 0
        }
      }
    } catch (e) {
      console.warn('Usando métricas por defecto')
    }
  }
}
</script>

<style scoped>
.pagina-principal {
  background: #0f172a;
  color: #e2e8f0;
  min-height: 100vh;
  display: flex;
  flex-direction: column;
}

.contenido-principal {
  flex: 1;
  padding: 3rem 4rem;
}

.hero-section {
  display: grid;
  grid-template-columns: 2fr 1fr;
  gap: 3rem;
  align-items: center;
  margin-bottom: 4rem;
}

.badge-status {
  background: rgba(56, 189, 248, 0.1);
  color: #38bdf8;
  border: 1px solid #0284c7;
  padding: 6px 14px;
  border-radius: 99px;
  font-size: 0.85rem;
  font-weight: 600;
}

.titulo-hero {
  font-size: 3rem;
  font-weight: 800;
  color: #f8fafc;
  margin: 1rem 0;
}

.descripcion-hero {
  color: #94a3b8;
  font-size: 1.1rem;
  line-height: 1.6;
  margin-bottom: 2rem;
}

.hero-buttons {
  display: flex;
  gap: 1rem;
}

.btn-primary {
  background: #0284c7;
  color: #fff;
  padding: 12px 24px;
  border-radius: 8px;
  text-decoration: none;
  font-weight: 700;
}

.btn-secondary {
  background: rgba(239, 68, 68, 0.15);
  color: #fca5a5;
  border: 1px solid #ef4444;
  padding: 12px 24px;
  border-radius: 8px;
  text-decoration: none;
  font-weight: 700;
}

.estado-card {
  background: #1e293b;
  border: 1px solid #334155;
  padding: 2rem;
  border-radius: 12px;
}

.estado-card h3 {
  color: #f8fafc;
  margin: 0;
  font-size: 1.3rem;
}

.sub-estado {
  color: #4ade80;
  font-size: 0.85rem;
  font-weight: 600;
  margin-top: 4px;
}

.divider {
  border-color: #334155;
  margin: 1rem 0;
}

.metrica-item {
  color: #cbd5e1;
  margin-bottom: 0.8rem;
  font-size: 0.95rem;
}

.metrica-item strong {
  color: #38bdf8;
}

.modulos-section h2 {
  color: #38bdf8;
  font-size: 2rem;
  margin-bottom: 0.2rem;
}

.sub-modulos {
  color: #94a3b8;
  margin-bottom: 2rem;
}

.grid-modulos {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(240px, 1fr));
  gap: 1.5rem;
}

.card-modulo {
  background: #1e293b;
  border: 1px solid #334155;
  padding: 1.8rem;
  border-radius: 12px;
}

.icon-mod {
  font-size: 2rem;
  margin-bottom: 0.8rem;
}

.card-modulo h3 {
  color: #f8fafc;
  font-size: 1.1rem;
  margin-bottom: 0.5rem;
}

.card-modulo p {
  color: #94a3b8;
  font-size: 0.88rem;
  line-height: 1.5;
  margin: 0;
}

@media (max-width: 992px) {
  .hero-section {
    grid-template-columns: 1fr;
  }

  .contenido-principal {
    padding: 2rem;
  }
}
</style>