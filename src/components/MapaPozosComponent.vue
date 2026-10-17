<template>
  <div ref="mapa" class="mapa"></div>
</template>

<script>
import L from 'leaflet'
import 'leaflet/dist/leaflet.css'

const COLORES = { verde: '#22c55e', amarillo: '#eab308', rojo: '#ef4444' }

export default {
  name: 'MapaPozosComponent',
  props: {
    pozos: { type: Array, default: () => [] },
    reportes: { type: Array, default: () => [] },
    centro: { type: Array, default: () => [11.2408, -74.211] }
  },
  mounted() {
    this.map = L.map(this.$refs.mapa).setView(this.centro, 16)
    L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
      attribution: '© OpenStreetMap'
    }).addTo(this.map)
    this.capa = L.layerGroup().addTo(this.map)
    this.dibujar()
  },
  watch: {
    pozos: 'dibujar',
    reportes: 'dibujar'
  },
  methods: {
    dibujar() {
      this.capa.clearLayers()
      // RF04 + RF05: pozos coloreados según su estado
      this.pozos.forEach(p => {
        L.circleMarker([p.lat, p.lng], {
          radius: 10, color: '#0f172a', weight: 1,
          fillColor: COLORES[p.estado], fillOpacity: 0.9
        })
          .bindPopup(`<b>${p.codigo}</b><br>${p.nombre}<br>Nivel: ${p.nivel_pct}%`)
          .addTo(this.capa)
      })
      // Reportes ciudadanos abiertos: anillo azul (pendiente) o naranja (inspeccionado)
      this.reportes.filter(r => r.estado !== 'resuelto').forEach(r => {
        const color = r.estado === 'inspeccionado' ? '#f97316' : '#0284c7'
        L.circleMarker([r.lat, r.lng], {
          radius: 7, color, weight: 3, fillColor: '#fff', fillOpacity: 1
        })
          .bindPopup(`<b>Reporte ciudadano</b> (${r.estado})<br>${r.tipo}<br>${r.descripcion || ''}`)
          .addTo(this.capa)
      })
    }
  },
  beforeUnmount() {
    if (this.map) this.map.remove()
  }
}
</script>

<style scoped>
.mapa { height: 460px; width: 100%; border-radius: 10px; border: 1px solid #cbd5e1; }
</style>
