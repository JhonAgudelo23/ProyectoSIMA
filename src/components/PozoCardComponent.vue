<template>
  <div class="pozo-card-dark" :class="pozo.estado">
    <div class="pozo-header">
      <div>
        <span class="codigo-pozo">{{ pozo.codigo }}</span>
        <h5 class="nombre-pozo">{{ pozo.nombre }}</h5>
      </div>
      <span class="badge-estado" :class="pozo.estado">{{ pozo.estado.toUpperCase() }}</span>
    </div>

    <div class="pozo-body">
      <div class="nivel-info">
        <span>Nivel de Agua: <strong>{{ pozo.nivel_pct }}%</strong></span>
      </div>
      <div class="progress-bar-bg">
        <div class="progress-fill" :class="pozo.estado" :style="{ width: pozo.nivel_pct + '%' }"></div>
      </div>
    </div>
  </div>
</template>

<script>
export default {
  name: 'PozoCardComponent',
  props: {
    pozo: { type: Object, required: true }
  }
}
</script>

<style scoped>
.pozo-card-dark {
  background: #0f172a;
  border: 1px solid #334155;
  border-radius: 8px;
  padding: 0.9rem;
  transition: transform 0.2s, box-shadow 0.2s;
}

.pozo-card-dark:hover {
  transform: translateY(-2px);
  box-shadow: 0 4px 12px rgba(0, 0, 0, 0.4);
}

.pozo-header {
  display: flex;
  justify-content: space-between;
  align-items: flex-start;
  margin-bottom: 0.6rem;
}

.codigo-pozo {
  font-family: monospace;
  font-size: 0.8rem;
  color: #38bdf8;
}

.nombre-pozo {
  margin: 0;
  font-size: 0.95rem;
  color: #f8fafc;
  font-weight: 600;
}

.badge-estado {
  font-size: 0.7rem;
  font-weight: 700;
  padding: 3px 8px;
  border-radius: 4px;
}

.badge-estado.verde {
  background: rgba(34, 197, 94, 0.2);
  color: #4ade80;
  border: 1px solid #22c55e;
}

.badge-estado.amarillo {
  background: rgba(234, 179, 8, 0.2);
  color: #fde047;
  border: 1px solid #eab308;
}

.badge-estado.rojo {
  background: rgba(239, 68, 68, 0.2);
  color: #fca5a5;
  border: 1px solid #ef4444;
}

.nivel-info {
  font-size: 0.8rem;
  color: #94a3b8;
  margin-bottom: 0.4rem;
}

.progress-bar-bg {
  background: #1e293b;
  height: 8px;
  border-radius: 99px;
  overflow: hidden;
}

.progress-fill {
  height: 100%;
  border-radius: 99px;
  transition: width 0.5s ease-in-out;
}

.progress-fill.verde {
  background: #22c55e;
}

.progress-fill.amarillo {
  background: #eab308;
}

.progress-fill.rojo {
  background: #ef4444;
}
</style>