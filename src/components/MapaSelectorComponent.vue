<template>
  <div class="mapa-wrap">
    <div ref="mapa" class="mapa"></div>
    <p class="hint">
      <span v-if="!modelValue">Haz clic en el mapa para marcar la ubicación del problema.</span>
      <span v-else>Ubicación: {{ modelValue.lat.toFixed(5) }}, {{ modelValue.lng.toFixed(5) }}</span>
    </p>
  </div>
</template>

<script>
import L from 'leaflet'
import 'leaflet/dist/leaflet.css'

export default {
  name: 'MapaSelectorComponent',
  props: {
    modelValue: { type: Object, default: null }, // { lat, lng }
    centro: { type: Array, default: () => [11.2408, -74.211] },
    pozos: { type: Array, default: () => [] }
  },
  emits: ['update:modelValue'],
  mounted() {
    this.map = L.map(this.$refs.mapa).setView(this.centro, 16)
    L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
      attribution: '© OpenStreetMap'
    }).addTo(this.map)

    // Pozos de referencia (grises) para que el ciudadano se ubique
    this.pozos.forEach(p => {
      L.circleMarker([p.lat, p.lng], { radius: 6, color: '#64748b', fillOpacity: 0.5 })
        .bindTooltip(p.codigo)
        .addTo(this.map)
    })

    this.map.on('click', e => {
      this.$emit('update:modelValue', { lat: e.latlng.lat, lng: e.latlng.lng })
    })
    this.dibujar()
  },
  watch: {
    modelValue() { this.dibujar() }
  },
  methods: {
    dibujar() {
      if (this.marcador) this.map.removeLayer(this.marcador)
      if (this.modelValue) {
        this.marcador = L.circleMarker([this.modelValue.lat, this.modelValue.lng], {
          radius: 11, color: '#b91c1c', fillColor: '#ef4444', fillOpacity: 0.85, weight: 3
        }).addTo(this.map)
      }
    }
  },
  beforeUnmount() {
    if (this.map) this.map.remove()
  }
}
</script>

<style scoped>
.mapa { height: 380px; width: 100%; border-radius: 10px; border: 1px solid #cbd5e1; }
.hint { font-size: 0.85rem; color: #64748b; margin: 0.5rem 0 0; }
</style>
