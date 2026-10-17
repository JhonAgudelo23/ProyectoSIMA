<template>
  <div class="pozo" :class="pozo.estado">
    <div class="top">
      <strong>{{ pozo.codigo }}</strong>
      <span class="etiqueta">{{ textoEstado }}</span>
    </div>
    <p class="nombre">{{ pozo.nombre }}</p>
    <div class="barra"><div class="relleno" :style="{ width: pozo.nivel_pct + '%' }"></div></div>
    <small>Nivel: {{ pozo.nivel_pct }}%</small>
  </div>
</template>

<script>
export default {
  name: 'PozoCardComponent',
  props: { pozo: { type: Object, required: true } },
  computed: {
    textoEstado() {
      return { verde: 'Normal', amarillo: 'Advertencia', rojo: 'Riesgo' }[this.pozo.estado]
    }
  }
}
</script>

<style scoped>
.pozo { background: #fff; border: 1px solid #e2e8f0; border-left: 6px solid; border-radius: 8px; padding: 0.7rem 0.9rem; }
.pozo.verde { border-left-color: #22c55e; }
.pozo.amarillo { border-left-color: #eab308; }
.pozo.rojo { border-left-color: #ef4444; }
.top { display: flex; justify-content: space-between; align-items: center; }
.etiqueta { font-size: 0.75rem; font-weight: 700; padding: 2px 8px; border-radius: 99px; background: #f1f5f9; }
.verde .etiqueta { background: #dcfce7; color: #166534; }
.amarillo .etiqueta { background: #fef9c3; color: #854d0e; }
.rojo .etiqueta { background: #fee2e2; color: #991b1b; }
.nombre { margin: 0.25rem 0 0.5rem; font-size: 0.85rem; color: #64748b; }
.barra { height: 8px; background: #e2e8f0; border-radius: 99px; overflow: hidden; }
.relleno { height: 100%; background: #0284c7; transition: width 0.5s; }
.rojo .relleno { background: #ef4444; }
.amarillo .relleno { background: #eab308; }
.verde .relleno { background: #22c55e; }
small { color: #64748b; }
</style>
