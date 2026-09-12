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
          <button class="btn btn-primary" @click="mostrarPanel = !mostrarPanel">
            {{ mostrarPanel ? 'Ocultar Panel' : 'Ver Panel' }}
          </button>
        </div>
      </div>

      <div class="hero-card">
        <h3>Estado General</h3>

        <p v-if="sistemaActivo" class="status-live">● En vivo (Sistema Operativo)</p>
        <p v-else class="status-off">○ Sistema fuera de línea</p>
        
        <hr />

        <ul class="stats-list">
          <li v-for="(stat, index) in estadisticas" :key="index">
            <strong>{{ stat.porcentaje }}</strong> {{ stat.etiqueta }}
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
          v-for="modulo in modulos" 
          :key="modulo.id"
        >
          <h3>{{ modulo.titulo }}</h3>
          <p>{{ modulo.descripcion }}</p>
        </div>
      </div>
    </section>

    <FooterComponent></FooterComponent>
  </div>
</template>

<script>
export default {
  name: 'Principal',
  data() {
    return {
      sistemaActivo: true,
      mostrarPanel: false,
      estadisticas: [
        { porcentaje: '85%', etiqueta: 'Operativos' },
        { porcentaje: '10%', etiqueta: 'Alerta' },
        { porcentaje: '5%', etiqueta: 'Críticos' }
      ],
      modulos: [
        { id: 1, titulo: 'Monitoreo Continuo', descripcion: 'Lectura constante del nivel de agua en la red.' },
        { id: 2, titulo: 'Alertas Tempranas', descripcion: 'Notificaciones ordenadas según el nivel de riesgo.' },
        { id: 3, titulo: 'Ubicación', descripcion: 'Visualización de los puntos de control en la ciudad.' }
      ]
    };
  },

  created() {
    console.log("MODULOS DEL SISTEMA:")
    console.log(this.modulos)
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
  display: flex;
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
</style>
