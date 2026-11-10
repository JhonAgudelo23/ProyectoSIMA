<template>
  <div class="pagina-vista">
    <NavbarComponent></NavbarComponent>

    <main class="contenido-vista">


      <h1 class="titulo-vista">⚡ Características Técnicas & Sensores</h1>
      <p class="subtitulo-vista">Especificaciones de hardware IoT y arquitectura telemétrica de SIMA.</p>

      <div class="grid-caracteristicas">
        <div class="card-tech-vista">
          <div class="icon-header">📡</div>
          <h3>Sensor Ultrasónico de Nivel (JSN-SR04T)</h3>
          <p>Mide de forma continua la distancia respecto a la superficie del fluido desde la parte superior del pozo.
          </p>
          <ul class="lista-detalles">
            <li><strong>Protección:</strong> Envolvente industrial IP67 a prueba de humedad.</li>
            <li><strong>Rango:</strong> 20 cm a 450 cm de precisión.</li>
            <li><strong>Muestreo:</strong> Transmisión de telemetría cada 5 segundos.</li>
          </ul>
        </div>

        <div class="card-tech-vista">
          <div class="icon-header">☣️</div>
          <h3>Sensor Toxicológico (MQ-136 / MQ-4)</h3>
          <p>Monitorea la acumulación de gas sulfhídrico ($H_2S$) y metano ($CH_4$) por descomposición orgánica.</p>
          <ul class="lista-detalles">
            <li><strong>Unidad:</strong> Concentración en Partes Por Millón (PPM).</li>
            <li><strong>Umbral crítico:</strong> Disparo de alerta al superar los 50 PPM.</li>
            <li><strong>Seguridad:</strong> Alerta previa para operarios de cuadrilla.</li>
          </ul>
        </div>

        <div class="card-tech-vista">
          <div class="icon-header">💻</div>
          <h3>API & Algoritmo de Coherencia</h3>
          <p>Backend en Node.js Express que procesa las variaciones hidrodinámicas con modelo de caminata aleatoria.</p>
          <ul class="lista-detalles">
            <li><strong>Seguridad:</strong> Autenticación por Tokens JWT.</li>
            <li><strong>Normalización:</strong> Cálculo de porcentaje de llenado ($0\%$ a $100\%$).</li>
            <li><strong>Persistencia:</strong> Registro histórico en MySQL.</li>
          </ul>
        </div>
      </div>
    </main>

    <FooterComponent></FooterComponent>
  </div>
</template>

<script>
import NavbarComponent from '../components/NavbarComponent.vue'
import FooterComponent from '../components/FooterComponent.vue'

export default {
  name: 'Caracteristicas',
  components: {
    NavbarComponent,
    FooterComponent
  }
}
</script>

<style scoped>
.pagina-vista {
  background: #0f172a;
  color: #e2e8f0;
  min-height: 100vh;
  display: flex;
  flex-direction: column;
}

.contenido-vista {
  flex: 1;
  padding: 2.5rem 3rem;
}

.btn-volver {
  display: inline-block;
  color: #38bdf8;
  text-decoration: none;
  font-weight: 600;
  font-size: 0.9rem;
  padding: 6px 12px;
  background: rgba(56, 189, 248, 0.1);
  border: 1px solid #0284c7;
  border-radius: 6px;
  transition: all 0.2s;
}

.btn-volver:hover {
  background: #0284c7;
  color: #fff;
}

.titulo-vista {
  color: #38bdf8;
  font-size: 2.2rem;
  font-weight: 700;
  margin-top: 0.5rem;
}

.subtitulo-vista {
  color: #94a3b8;
  margin-bottom: 2.5rem;
}

.grid-caracteristicas {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(300px, 1fr));
  gap: 1.5rem;
}

.card-tech-vista {
  background: #1e293b;
  border: 1px solid #334155;
  border-radius: 12px;
  padding: 1.8rem;
}

.icon-header {
  font-size: 2.2rem;
  margin-bottom: 0.8rem;
}

.card-tech-vista h3 {
  color: #f8fafc;
  margin-bottom: 0.5rem;
}

.card-tech-vista p {
  color: #94a3b8;
  font-size: 0.9rem;
  line-height: 1.5;
}

.lista-detalles {
  padding-left: 1.2rem;
  margin-top: 1rem;
  color: #cbd5e1;
  font-size: 0.85rem;
}

.lista-detalles li {
  margin-bottom: 0.4rem;
}
</style>