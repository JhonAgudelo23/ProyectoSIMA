<template>
  <div class="mapa-container">
    <div id="mapa-pozos" class="mapa-leaflet"></div>
  </div>
</template>

<script>
import L from 'leaflet'
import 'leaflet/dist/leaflet.css'

export default {
  name: 'MapaPozosComponent',
  props: {
    pozos: {
      type: Array,
      default: () => []
    },
    pozoSeleccionadoId: {
      type: [Number, String],
      default: null
    }
  },
  emits: ['seleccionar-pozo'],
  data() {
    return {
      map: null,
      layerGroup: null
    }
  },
  mounted() {
    this.initMap()
  },
  watch: {
    pozos: {
      handler() {
        this.renderMarcadores()
      },
      deep: true
    },
    pozoSeleccionadoId() {
      this.centrarEnPozo()
    }
  },
  methods: {
    initMap() {
      const latInicial = 11.2408
      const lngInicial = -74.2110

      this.map = L.map('mapa-pozos').setView([latInicial, lngInicial], 13)

      // Servidor de mapas en modo oscuro de alta velocidad y compatibilidad global
      L.tileLayer('https://tiles.stadiamaps.com/tiles/alidade_smooth_dark/{z}/{x}/{y}{r}.png', {
        maxZoom: 20,
        attribution: '&copy; <a href="https://stadiamaps.com/">Stadia Maps</a>'
      }).addTo(this.map)

      this.layerGroup = L.layerGroup().addTo(this.map)
      this.renderMarcadores()
    },
    renderMarcadores() {
      if (!this.map || !this.layerGroup) return
      this.layerGroup.clearLayers()

      if (!Array.isArray(this.pozos) || this.pozos.length === 0) return

      this.pozos.forEach(pozo => {
        const lat = parseFloat(pozo.latitud ?? pozo.lat)
        const lng = parseFloat(pozo.longitud ?? pozo.lng)

        if (isNaN(lat) || isNaN(lng)) return

        let color = '#22c55e'
        if (pozo.estado === 'alerta' || (pozo.nivel_pct >= 50 && pozo.nivel_pct < 75)) {
          color = '#facc15'
        }
        if (pozo.estado === 'critico' || pozo.nivel_pct >= 75) {
          color = '#f87171'
        }

        const marker = L.circleMarker([lat, lng], {
          radius: 10,
          fillColor: color,
          color: '#ffffff',
          weight: 2,
          opacity: 1,
          fillOpacity: 0.9
        })

        const popupContent = `
          <div style="color: #0f172a; font-family: sans-serif; padding: 4px;">
            <strong style="font-size: 0.95rem; color: #0284c7;">${pozo.codigo || 'Pozo'}</strong><br/>
            <span style="font-size: 0.85rem;">📍 ${pozo.ubicacion}</span><br/>
            <span style="font-size: 0.85rem;">🌊 Nivel: <strong>${pozo.nivel_pct}%</strong></span>
          </div>
        `

        marker.bindPopup(popupContent)
        marker.on('click', () => this.$emit('seleccionar-pozo', pozo))
        this.layerGroup.addLayer(marker)
      })
    },
    centrarEnPozo() {
      if (!this.pozoSeleccionadoId || !this.pozos.length) return
      const pozo = this.pozos.find(p => p.id === this.pozoSeleccionadoId)
      if (pozo) {
        const lat = parseFloat(pozo.latitud ?? pozo.lat)
        const lng = parseFloat(pozo.longitud ?? pozo.lng)
        if (!isNaN(lat) && !isNaN(lng)) {
          this.map.setView([lat, lng], 15, { animate: true })
        }
      }
    }
  }
}
</script>

<style scoped>
.mapa-container {
  width: 100%;
  height: 100%;
  min-height: 480px;
  border-radius: 12px;
  overflow: hidden;
  border: 1px solid rgba(56, 189, 248, 0.2);
  box-shadow: inset 0 0 20px rgba(0, 0, 0, 0.8);
}

.mapa-leaflet {
  width: 100%;
  height: 100%;
  min-height: 480px;
  background: #090d16;
}
</style>