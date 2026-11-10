<template>
  <div class="pagina-vista">
    <NavbarComponent></NavbarComponent>

    <main class="contenido-vista">

      <h1 class="titulo-vista">📘 Documentación del Proyecto SIMA</h1>
      <p class="subtitulo-vista">Sistema Inteligente de Monitoreo de Alcantarillado - Zona Piloto Santa Marta.</p>

      <div class="bloque-doc mb-4">
        <h2>1. Descripción del Problema</h2>
        <p>Las obstrucciones por basuras y grasas en los pozos de inspección urbana generan colapsos en la red de
          alcantarillado durante épocas de lluvia. SIMA automatiza la supervisión subterránea para convertir un esquema
          reactivo en un modelo de prevención en tiempo real.</p>
      </div>

      <div class="bloque-doc">
        <h2>2. Matriz de Roles y Accesos (RBAC)</h2>
        <div class="grid-roles mt-3">
          <div class="card-rol">
            <h4>👤 Ciudadanos</h4>
            <p>Acceso al mapa público, creación de reportes geolocalizados por malos olores o rebosamientos y adjunción
              de fotos.</p>
          </div>
          <div class="card-rol">
            <h4>👷 Operarios</h4>
            <p>Monitoreo del semáforo operacional, inspección en campo y registro de notas técnicas de resolución de
              fallas.</p>
          </div>
          <div class="card-rol">
            <h4>🛠️ Administradores</h4>
            <p>Gestión completa de hardware: alta, edición y baja de sensores telemétricos asignados a los pozos.</p>
          </div>
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
  name: 'Proyecto',
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

.bloque-doc {
  background: #1e293b;
  border: 1px solid #334155;
  border-radius: 12px;
  padding: 2rem;
}

.bloque-doc h2 {
  color: #f8fafc;
  font-size: 1.3rem;
  margin-bottom: 0.8rem;
}

.bloque-doc p {
  color: #94a3b8;
  line-height: 1.6;
}

.grid-roles {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(260px, 1fr));
  gap: 1rem;
}

.card-rol {
  background: #0f172a;
  border: 1px solid #334155;
  padding: 1.2rem;
  border-radius: 8px;
}

.card-rol h4 {
  color: #38bdf8;
  margin-bottom: 0.4rem;
}

.card-rol p {
  font-size: 0.85rem;
  color: #cbd5e1;
  margin: 0;
}
</style>