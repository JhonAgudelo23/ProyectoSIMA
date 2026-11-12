<template>
  <div ref="mapaContenedor" class="mapa-selector"></div>
</template>

<script>
import L from 'leaflet';
import 'leaflet/dist/leaflet.css';

const iconoPin = L.divIcon({
  className: 'pin-personalizado',
  html: `<div style="
    width: 28px;
    height: 28px;
    background: #ef4444;
    border: 3px solid #ffffff;
    border-radius: 50% 50% 50% 0;
    transform: rotate(-45deg);
    box-shadow: 0 3px 8px rgba(0,0,0,0.45);
  "></div>`,
  iconSize: [28, 28],
  iconAnchor: [14, 28]
});

export default {
  name: 'MapaSelectorComponent',
  emits: ['seleccionar'],
  created() {
    // Se definen aquí para que Vue 3 no los convierta en Proxy reactivo
    this.mapa = null;
    this.marcador = null;
    this.timerResize = null;
  },
  mounted() {
    if (!this.$refs.mapaContenedor) return;

    this.mapa = L.map(this.$refs.mapaContenedor).setView([11.2408, -74.2110], 14);

    L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
      attribution: '&copy; OpenStreetMap contributors'
    }).addTo(this.mapa);

    this.mapa.on('click', e => {
      const { lat, lng } = e.latlng;
      if (this.marcador) {
        this.marcador.setLatLng([lat, lng]);
      } else {
        this.marcador = L.marker([lat, lng], { icon: iconoPin }).addTo(this.mapa);
      }
      this.$emit('seleccionar', { lat, lng });
    });

    this.timerResize = setTimeout(() => {
      if (this.mapa && this.$refs.mapaContenedor) {
        this.mapa.invalidateSize();
      }
    }, 250);
  },
  beforeUnmount() {
    if (this.timerResize) {
      clearTimeout(this.timerResize);
      this.timerResize = null;
    }
    if (this.mapa) {
      this.mapa.remove();
      this.mapa = null;
    }
  }
};
</script>

<style scoped>
.mapa-selector {
  width: 100%;
  height: 360px;
  border-radius: 10px;
  z-index: 1;
  cursor: crosshair;
}
</style>