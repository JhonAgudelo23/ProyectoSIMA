<template>
  <div class="page-container">
    <NavbarComponent />

    <main class="main-content">
      <header class="d-flex-between">
        <div>
          <h2 class="title-gradient">📢 Portal Ciudadano SIMA</h2>
          <p class="sub">Reporta incidencias en el alcantarillado y consulta el estado de tu sector</p>
        </div>
      </header>

      <!-- Pestañas de navegación del Ciudadano -->
      <div class="tabs-container mt-4">
        <button @click="pestana = 'nuevo'" :class="['tab-btn', { activo: pestana === 'nuevo' }]">
          ➕ Nuevo Reporte
        </button>
        <button @click="abrirComunitarios" :class="['tab-btn', { activo: pestana === 'comunitarios' }]">
          🌍 Reportes Activos en la Comunidad ({{ comunitarios.length }})
        </button>
        <button @click="abrirMisReportes" :class="['tab-btn', { activo: pestana === 'mios' }]">
          📋 Mis Reportes ({{ misReportes.length }})
        </button>
      </div>

      <!-- Pestaña 1: Crear Nuevo Reporte -->
      <section v-if="pestana === 'nuevo'" class="mt-4">
        <div class="grid-reportar">
          <!-- Mapa Selector -->
          <div class="card-section">
            <div class="card-header">
              <h4>1. Ubicación de la Incidencia</h4>
            </div>
            <div class="card-body">
              <p class="sub mb-2">Haz clic sobre el mapa para marcar el punto exacto del problema.</p>
              <MapaSelectorComponent @seleccionar="alSeleccionarUbicacion" />
              <p v-if="form.lat && form.lng" class="text-exito mt-3">
                📍 Coordenadas fijadas: {{ form.lat.toFixed(5) }}, {{ form.lng.toFixed(5) }}
              </p>
            </div>
          </div>

          <!-- Formulario de Reporte -->
          <div class="card-section">
            <div class="card-header">
              <h4>2. Detalles y Evidencia</h4>
            </div>
            <div class="card-body">
              <form @submit.prevent="enviarReporte">
                <div class="field">
                  <label>Tipo de Problema *</label>
                  <select v-model="form.tipo" class="input-cyber" required>
                    <option value="" disabled>-- Selecciona una categoría --</option>
                    <option v-for="t in tipos" :key="t" :value="t">{{ t }}</option>
                  </select>
                </div>

                <div class="field mt-3">
                  <label>Descripción del Problema</label>
                  <textarea
                    v-model="form.descripcion"
                    rows="3"
                    class="input-cyber"
                    placeholder="Describe brevemente lo que ocurre..."
                  ></textarea>
                </div>

                <div class="field mt-3">
                  <label>Evidencia Fotográfica (Opcional)</label>
                  <input
                    type="file"
                    accept="image/*"
                    @change="procesarImagen"
                    ref="inputArchivo"
                    class="input-cyber"
                  />
                  <div v-if="form.evidencia" class="preview-box mt-2">
                    <img :src="form.evidencia" alt="Vista previa" class="img-preview" />
                    <button type="button" class="btn-quitar" @click="quitarImagen">🗑️ Quitar foto</button>
                  </div>
                </div>

                <p v-if="error" class="text-error mt-3">{{ error }}</p>
                <p v-if="exito" class="text-exito mt-3">{{ exito }}</p>

                <button type="submit" class="btn-send mt-4" :disabled="enviando">
                  {{ enviando ? 'Enviando reporte...' : '🚀 Enviar Reporte Ciudadano' }}
                </button>
              </form>
            </div>
          </div>
        </div>
      </section>

      <!-- Pestaña 2: Reportes Comunitarios Activos (CON MAPA INTERACTIVO) -->
      <section v-if="pestana === 'comunitarios'" class="mt-4">
        <div class="card-section">
          <div class="card-header d-flex-between">
            <h4>🌍 Mapa e Incidencias Activas Reportadas por la Comunidad</h4>
            <button class="btn-refrescar" @click="refrescarComunitarios">🔄 Actualizar</button>
          </div>
          <div class="card-body">
            <!-- Mapa Geográfico de Reportes Activos -->
            <div class="contenedor-mapa-comunidad mb-4">
              <div ref="mapaComunidad" class="mapa-comunidad"></div>
              <div class="leyenda-mapa">
                <span><i class="punto-leyenda pendiente"></i> Pendiente</span>
                <span><i class="punto-leyenda inspeccionado"></i> Inspeccionado</span>
              </div>
            </div>

            <p v-if="comunitarios.length === 0" class="sub">No hay reportes comunitarios activos en este momento.</p>

            <div v-else class="grid-tarjetas">
              <div
                v-for="rep in comunitarios"
                :key="rep.id"
                class="tarjeta-item tarjeta-clicable"
                @click="centrarEnReporte(rep)"
                title="Haz clic para ubicar en el mapa"
              >
                <div class="d-flex-between">
                  <strong class="tipo-titulo">{{ rep.tipo }}</strong>
                  <span :class="['badge-estado', rep.estado]">{{ rep.estado.toUpperCase() }}</span>
                </div>
                <p class="desc-texto">{{ rep.descripcion || 'Sin descripción adicional.' }}</p>
                <img v-if="rep.evidencia" :src="rep.evidencia" alt="Evidencia" class="foto-card" />
                <div class="meta-footer">
                  <span>👤 {{ rep.ciudadano }}</span>
                  <span>📍 {{ Number(rep.lat).toFixed(4) }}, {{ Number(rep.lng).toFixed(4) }}</span>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      <!-- Pestaña 3: Mis Reportes -->
      <section v-if="pestana === 'mios'" class="mt-4">
        <div class="card-section">
          <div class="card-header d-flex-between">
            <h4>📋 Historial de Mis Reportes</h4>
            <button class="btn-refrescar" @click="cargarTodo">🔄 Actualizar</button>
          </div>
          <div class="card-body">
            <p v-if="misReportes.length === 0" class="sub">Aún no has enviado ningún reporte.</p>

            <div v-else class="grid-tarjetas">
              <div v-for="rep in misReportes" :key="rep.id" class="tarjeta-item">
                <div class="d-flex-between">
                  <strong class="tipo-titulo">{{ rep.tipo }}</strong>
                  <span :class="['badge-estado', rep.estado]">{{ rep.estado.toUpperCase() }}</span>
                </div>
                <p class="desc-texto">{{ rep.descripcion || 'Sin descripción adicional.' }}</p>
                <img v-if="rep.evidencia" :src="rep.evidencia" alt="Evidencia" class="foto-card" />

                <p v-if="rep.nota_inspeccion" class="nota-tecnica">
                  🔧 Inspección: {{ rep.nota_inspeccion }}
                </p>
                <p v-if="rep.nota_resolucion" class="nota-tecnica">
                  ✅ Resolución: {{ rep.nota_resolucion }}
                </p>

                <div class="meta-footer">
                  <span>📍 {{ Number(rep.lat).toFixed(4) }}, {{ Number(rep.lng).toFixed(4) }}</span>
                  <button
                    v-if="rep.estado === 'pendiente'"
                    class="btn-eliminar-mi"
                    @click="borrarMiReporte(rep.id)"
                  >
                    🗑️ Eliminar
                  </button>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>
    </main>
  </div>
</template>

<script>
import L from 'leaflet';
import 'leaflet/dist/leaflet.css';
import NavbarComponent from '../components/NavbarComponent.vue';
import MapaSelectorComponent from '../components/MapaSelectorComponent.vue';
import {
  reportesTipos,
  reportesComunitarios,
  reportes,
  crearReporte,
  eliminarReporte
} from '../services/api';

function crearIconoEstado(estado) {
  const color = estado === 'inspeccionado' ? '#38bdf8' : '#f59e0b';
  return L.divIcon({
    className: 'pin-comunidad',
    html: `<div style="
      width: 24px;
      height: 24px;
      background: ${color};
      border: 3px solid #ffffff;
      border-radius: 50% 50% 50% 0;
      transform: rotate(-45deg);
      box-shadow: 0 3px 8px rgba(0,0,0,0.5);
    "></div>`,
    iconSize: [24, 24],
    iconAnchor: [12, 24],
    popupAnchor: [0, -24]
  });
}

export default {
  name: 'Reportar',
  components: { NavbarComponent, MapaSelectorComponent },
  created() {
    this.mapaCom = null;
    this.capaMarcadores = null;
    this.marcadoresPorId = {};
  },
  data() {
    return {
      pestana: 'nuevo',
      tipos: [],
      comunitarios: [],
      misReportes: [],
      form: {
        lat: null,
        lng: null,
        tipo: '',
        descripcion: '',
        evidencia: null
      },
      enviando: false,
      error: '',
      exito: ''
    };
  },
  async mounted() {
    await this.cargarTodo();
  },
  beforeUnmount() {
    this.destruirMapaComunidad();
  },
  methods: {
    async cargarTodo() {
      try {
        this.tipos = await reportesTipos();
      } catch {
        this.tipos = ['Mal olor', 'Desbordamiento', 'Tapa dañada o sin tapa', 'Basura acumulada', 'Agua estancada', 'Otro'];
      }
      try {
        this.comunitarios = await reportesComunitarios();
      } catch (e) {
        console.error(e);
      }
      try {
        this.misReportes = await reportes();
      } catch (e) {
        console.error(e);
      }
    },
    async abrirComunitarios() {
      this.pestana = 'comunitarios';
      await this.cargarTodo();
      this.$nextTick(() => {
        this.iniciarMapaComunidad();
      });
    },
    async refrescarComunitarios() {
      await this.cargarTodo();
      this.pintarMarcadoresComunidad();
    },
    iniciarMapaComunidad() {
      this.destruirMapaComunidad();
      if (!this.$refs.mapaComunidad) return;

      this.mapaCom = L.map(this.$refs.mapaComunidad).setView([11.2408, -74.2110], 14);
      L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
        attribution: '&copy; OpenStreetMap contributors'
      }).addTo(this.mapaCom);

      this.capaMarcadores = L.layerGroup().addTo(this.mapaCom);
      this.pintarMarcadoresComunidad();

      setTimeout(() => {
        if (this.mapaCom && this.$refs.mapaComunidad) {
          this.mapaCom.invalidateSize();
        }
      }, 200);
    },
    pintarMarcadoresComunidad() {
      if (!this.mapaCom || !this.capaMarcadores) return;
      this.capaMarcadores.clearLayers();
      this.marcadoresPorId = {};

      const puntos = [];
      this.comunitarios.forEach(rep => {
        if (rep.lat == null || rep.lng == null) return;
        const lat = Number(rep.lat);
        const lng = Number(rep.lng);
        puntos.push([lat, lng]);

        const imgHtml = rep.evidencia
          ? `<img src="${rep.evidencia}" style="width:100%;max-height:110px;object-fit:cover;border-radius:6px;margin-top:6px;" />`
          : '';

        const popupHtml = `
          <div style="min-width:180px;color:#0f172a;">
            <strong style="font-size:14px;">${rep.tipo}</strong><br/>
            <span style="font-size:11px;font-weight:700;text-transform:uppercase;color:#0284c7;">Estado: ${rep.estado}</span>
            <p style="margin:4px 0;font-size:12px;">${rep.descripcion || 'Sin descripción'}</p>
            <small style="color:#475569;">Reportado por: ${rep.ciudadano}</small>
            ${imgHtml}
          </div>
        `;

        const marker = L.marker([lat, lng], { icon: crearIconoEstado(rep.estado) })
          .bindPopup(popupHtml)
          .addTo(this.capaMarcadores);

        this.marcadoresPorId[rep.id] = marker;
      });

      if (puntos.length > 0) {
        this.mapaCom.fitBounds(puntos, { padding: [40, 40], maxZoom: 15 });
      }
    },
    centrarEnReporte(rep) {
      if (!this.mapaCom) return;
      const lat = Number(rep.lat);
      const lng = Number(rep.lng);
      this.mapaCom.setView([lat, lng], 16, { animate: true });
      const marker = this.marcadoresPorId[rep.id];
      if (marker) marker.openPopup();
    },
    destruirMapaComunidad() {
      if (this.mapaCom) {
        this.mapaCom.remove();
        this.mapaCom = null;
        this.capaMarcadores = null;
        this.marcadoresPorId = {};
      }
    },
    abrirMisReportes() {
      this.destruirMapaComunidad();
      this.pestana = 'mios';
      this.cargarTodo();
    },
    alSeleccionarUbicacion({ lat, lng }) {
      this.form.lat = lat;
      this.form.lng = lng;
      this.error = '';
    },
    procesarImagen(event) {
      const archivo = event.target.files[0];
      if (!archivo) return;

      if (archivo.size > 5 * 1024 * 1024) {
        this.error = 'La imagen no debe superar los 5 MB.';
        this.$refs.inputArchivo.value = '';
        return;
      }

      const reader = new FileReader();
      reader.onload = e => {
        this.form.evidencia = e.target.result;
        this.error = '';
      };
      reader.readAsDataURL(archivo);
    },
    quitarImagen() {
      this.form.evidencia = null;
      if (this.$refs.inputArchivo) this.$refs.inputArchivo.value = '';
    },
    async enviarReporte() {
      this.error = '';
      this.exito = '';

      if (this.form.lat == null || this.form.lng == null) {
        this.error = 'Por favor selecciona una ubicación en el mapa.';
        return;
      }
      if (!this.form.tipo) {
        this.error = 'Selecciona el tipo de problema.';
        return;
      }

      this.enviando = true;
      try {
        await crearReporte(this.form);
        this.exito = '¡Reporte enviado correctamente!';
        this.form.tipo = '';
        this.form.descripcion = '';
        this.quitarImagen();
        await this.cargarTodo();
      } catch (err) {
        this.error = err.message || 'No se pudo enviar el reporte.';
      } finally {
        this.enviando = false;
      }
    },
    async borrarMiReporte(id) {
      if (!confirm('¿Deseas eliminar este reporte?')) return;
      try {
        await eliminarReporte(id);
        await this.cargarTodo();
      } catch (err) {
        alert(err.message);
      }
    }
  }
};
</script>

<style scoped>
.grid-reportar {
  display: grid;
  grid-template-columns: 1fr 1fr;
  gap: 1.5rem;
}
@media (max-width: 900px) {
  .grid-reportar {
    grid-template-columns: 1fr;
  }
}
.contenedor-mapa-comunidad {
  margin-bottom: 1.5rem;
}
.mapa-comunidad {
  width: 100%;
  height: 350px;
  border-radius: 10px;
  border: 1px solid rgba(56, 189, 248, 0.25);
  z-index: 1;
}
.leyenda-mapa {
  display: flex;
  gap: 1.5rem;
  margin-top: 0.65rem;
  font-size: 0.85rem;
  color: #cbd5e1;
}
.punto-leyenda {
  display: inline-block;
  width: 11px;
  height: 11px;
  border-radius: 50%;
  margin-right: 6px;
}
.punto-leyenda.pendiente { background: #f59e0b; }
.punto-leyenda.inspeccionado { background: #38bdf8; }

.preview-box {
  display: flex;
  flex-direction: column;
  align-items: flex-start;
  gap: 0.5rem;
}
.img-preview {
  max-width: 100%;
  max-height: 170px;
  border-radius: 8px;
  border: 1px solid rgba(56, 189, 248, 0.3);
  object-fit: cover;
}
.btn-quitar, .btn-eliminar-mi {
  background: #dc2626;
  color: #fff;
  border: none;
  padding: 0.35rem 0.75rem;
  border-radius: 6px;
  font-size: 0.8rem;
  cursor: pointer;
}
.btn-refrescar {
  background: rgba(56, 189, 248, 0.15);
  color: #38bdf8;
  border: 1px solid rgba(56, 189, 248, 0.3);
  padding: 0.4rem 0.85rem;
  border-radius: 6px;
  cursor: pointer;
}
.grid-tarjetas {
  display: grid;
  grid-template-columns: repeat(auto-fill, minmax(290px, 1fr));
  gap: 1.2rem;
}
.tarjeta-item {
  background: rgba(15, 23, 42, 0.65);
  border: 1px solid rgba(56, 189, 248, 0.2);
  border-radius: 10px;
  padding: 1rem;
  display: flex;
  flex-direction: column;
  gap: 0.65rem;
}
.tarjeta-clicable {
  cursor: pointer;
  transition: border-color 0.2s, transform 0.15s;
}
.tarjeta-clicable:hover {
  border-color: #38bdf8;
  transform: translateY(-2px);
}
.tipo-titulo {
  color: #38bdf8;
}
.badge-estado {
  font-size: 0.72rem;
  font-weight: 700;
  padding: 0.2rem 0.55rem;
  border-radius: 999px;
}
.badge-estado.pendiente { background: rgba(245, 158, 11, 0.2); color: #fbbf24; }
.badge-estado.inspeccionado { background: rgba(56, 189, 248, 0.2); color: #38bdf8; }
.badge-estado.resuelto { background: rgba(16, 185, 129, 0.2); color: #34d399; }
.desc-texto {
  font-size: 0.9rem;
  color: #cbd5e1;
}
.foto-card {
  width: 100%;
  max-height: 160px;
  object-fit: cover;
  border-radius: 8px;
}
.nota-tecnica {
  font-size: 0.82rem;
  color: #93c5fd;
  background: rgba(30, 58, 138, 0.3);
  padding: 0.4rem 0.6rem;
  border-radius: 6px;
}
.meta-footer {
  display: flex;
  justify-content: space-between;
  align-items: center;
  font-size: 0.8rem;
  color: #94a3b8;
  margin-top: auto;
}
</style>