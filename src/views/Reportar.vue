<template>
  <div class="page-container">
    <NavbarComponent />

    <main class="main-content">
      <header class="d-flex-between">
        <div>
          <h2 class="title-gradient">📢 Portal de Atención y Participación Ciudadana</h2>
          <p class="sub">Notifica fallas en la red de alcantarillado y monitorea el estado comunal en tiempo real.</p>
        </div>
      </header>

      <!-- Pestañas -->
      <div class="tabs-container mt-4">
        <button @click="cambiarPestana('crear')" :class="['tab-btn', { activo: pestanaActiva === 'crear' }]">
          ✍️ Registrar Nueva Incidencia
        </button>
        <button @click="cambiarPestana('mapa_comunitario')"
          :class="['tab-btn', { activo: pestanaActiva === 'mapa_comunitario' }]">
          🌐 Mapa de Incidencias en Vivo (Comunitario)
        </button>
        <button @click="cambiarPestana('historial')" :class="['tab-btn', { activo: pestanaActiva === 'historial' }]">
          📋 Historial y Seguimiento Detallado
        </button>
      </div>

      <!-- Formulario -->
      <section v-show="pestanaActiva === 'crear'" class="mt-4">
        <div class="grid-reportar">
          <div class="card-section">
            <div class="card-header">
              <h4>1. Ubicación Geográfica del Problema</h4>
              <span class="hint">Haz clic en el mapa para fijar el punto</span>
            </div>
            <div class="card-body">
              <div id="mapa-selector" class="mapa-leaflet"></div>
            </div>
          </div>

          <div class="card-section">
            <div class="card-header">
              <h4>2. Detalles y Evidencia Fotográfica</h4>
            </div>
            <div class="card-body">
              <form @submit.prevent="enviarFormulario">
                <div class="field">
                  <label>Tipo de Problema</label>
                  <select v-model="form.tipo" required class="input-cyber">
                    <option value="" disabled>Selecciona una categoría...</option>
                    <option v-for="t in listaTipos" :key="t" :value="t">{{ t }}</option>
                  </select>
                </div>

                <div class="field mt-3">
                  <label>Descripción</label>
                  <textarea v-model="form.descripcion" rows="3" class="input-cyber textarea-cyber"
                    placeholder="Describe el incidente..."></textarea>
                </div>

                <p v-if="exitoMsg" class="text-exito mt-3">{{ exitoMsg }}</p>

                <button type="submit" class="btn-send mt-4" :disabled="enviando || !form.lat">
                  {{ enviando ? 'Enviando...' : '🚀 Enviar Reporte a la Red SIMA' }}
                </button>
              </form>
            </div>
          </div>
        </div>
      </section>

      <!-- Mapa Comunitario en Vivo -->
      <section v-show="pestanaActiva === 'mapa_comunitario'" class="mt-4">
        <div class="card-section">
          <div class="card-header">
            <h4>🌐 Mapa Comunitario de Incidencias Activas</h4>
          </div>
          <div class="card-body">
            <div id="mapa-comunitario" class="mapa-leaflet-lg"></div>
          </div>
        </div>
      </section>
    </main>
  </div>
</template>

<script>
import L from 'leaflet'
import 'leaflet/dist/leaflet.css'
import NavbarComponent from '../components/NavbarComponent.vue'
import { reportesTipos, crearReporte, reportes, reportesComunitarios } from '../services/api'

export default {
  name: 'Reportar',
  components: { NavbarComponent },
  data() {
    return {
      pestanaActiva: 'crear',
      mapSelector: null,
      mapComunitario: null,
      markerSelector: null,
      capaGroup: null,
      listaTipos: [],
      todosLosReportes: [],
      enviando: false,
      exitoMsg: '',
      form: { lat: null, lng: null, tipo: '', descripcion: '' }
    }
  },
  mounted() {
    this.cargarTipos()
    this.cargarReportesComunitarios()
    this.$nextTick(() => this.initMapaSelector())
  },
  methods: {
    cambiarPestana(p) {
      this.pestanaActiva = p
      this.$nextTick(() => {
        setTimeout(() => {
          if (p === 'crear' && this.mapSelector) this.mapSelector.invalidateSize()
          if (p === 'mapa_comunitario') {
            if (!this.mapComunitario) this.initMapaComunitario()
            else { this.mapComunitario.invalidateSize(); this.cargarReportesComunitarios() }
          }
        }, 150)
      })
    },
    initMapaSelector() {
      const container = document.getElementById('mapa-selector')
      if (!container || this.mapSelector) return
      this.mapSelector = L.map('mapa-selector').setView([11.2408, -74.2110], 14)
      L.tileLayer('https://tiles.stadiamaps.com/tiles/alidade_smooth_dark/{z}/{x}/{y}{r}.png').addTo(this.mapSelector)

      this.mapSelector.on('click', (e) => {
        const { lat, lng } = e.latlng
        this.form.lat = lat; this.form.lng = lng
        if (this.markerSelector) this.markerSelector.setLatLng([lat, lng])
        else this.markerSelector = L.marker([lat, lng]).addTo(this.mapSelector)
      })
    },
    initMapaComunitario() {
      const container = document.getElementById('mapa-comunitario')
      if (!container || this.mapComunitario) return
      this.mapComunitario = L.map('mapa-comunitario').setView([11.2408, -74.2110], 13)
      L.tileLayer('https://tiles.stadiamaps.com/tiles/alidade_smooth_dark/{z}/{x}/{y}{r}.png').addTo(this.mapComunitario)
      this.capaGroup = L.layerGroup().addTo(this.mapComunitario)
      this.renderComunitarios()
    },
    renderComunitarios() {
      if (!this.capaGroup) return
      this.capaGroup.clearLayers()
      this.todosLosReportes.forEach(r => {
        const circle = L.circleMarker([r.lat, r.lng], {
          radius: 9,
          fillColor: r.estado === 'inspeccionado' ? '#38bdf8' : '#facc15',
          color: '#ffffff',
          fillOpacity: 0.9
        })
        circle.bindPopup(`<strong>${r.tipo}</strong><br/>${r.descripcion || ''}`)
        this.capaGroup.addLayer(circle)
      })
    },
    async cargarTipos() { this.listaTipos = await reportesTipos() },
    async cargarReportesComunitarios() {
      this.todosLosReportes = await reportesComunitarios()
      if (this.mapComunitario) this.renderComunitarios()
    },
    async enviarFormulario() {
      this.enviando = true
      await crearReporte(this.form)
      this.exitoMsg = '¡Reporte enviado exitosamente!'
      this.form = { lat: null, lng: null, tipo: '', descripcion: '' }
      this.enviando = false
      await this.cargarReportesComunitarios()
    }
  }
}
</script>

<style scoped>
.grid-reportar {
  display: grid;
  grid-template-columns: 1fr 1fr;
  gap: 1.5rem;
}

.mapa-leaflet {
  width: 100%;
  height: 380px;
  border-radius: 8px;
}

.mapa-leaflet-lg {
  width: 100%;
  height: 500px;
  border-radius: 8px;
}
</style>