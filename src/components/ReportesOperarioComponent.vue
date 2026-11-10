<template>
  <div class="gestion-reportes">
    <div class="header-reportes">
      <h3>📢 Gestión de Reportes Ciudadanos</h3>
      <div class="filtros">
        <button v-for="f in ['todos', 'pendiente', 'inspeccionado', 'resuelto']" :key="f" @click="filtro = f"
          :class="['btn-filtro', { activo: filtro === f }]">
          {{ f.toUpperCase() }}
        </button>
      </div>
    </div>

    <div class="tabla-card mt-3">
      <table class="tabla-gestion">
        <thead>
          <tr>
            <th>ID</th>
            <th>Evidencia</th>
            <th>Tipo / Detalle</th>
            <th>Ciudadano</th>
            <th>Ubicación</th>
            <th>Estado</th>
            <th>Acciones / Notas</th>
          </tr>
        </thead>
        <tbody>
          <tr v-if="reportesFiltrados.length === 0">
            <td colspan="7" class="text-center py-4">No hay reportes en esta categoría.</td>
          </tr>
          <tr v-for="rep in reportesFiltrados" :key="rep.id">
            <td><strong>#{{ rep.id }}</strong></td>
            <td>
              <img v-if="rep.evidencia" :src="rep.evidencia" alt="Foto" class="thumb-img"
                @click="fotoModal = rep.evidencia" />
              <span v-else class="text-muted">Sin foto</span>
            </td>
            <td>
              <strong class="text-tipo">{{ rep.tipo }}</strong>
              <p class="desc-text">{{ rep.descripcion || 'Sin descripción' }}</p>
            </td>
            <td>{{ rep.ciudadano || 'Ciudadano' }}</td>
            <td>
              <span class="badge-coords">📍 {{ parseFloat(rep.lat).toFixed(4) }}, {{ parseFloat(rep.lng).toFixed(4)
                }}</span>
            </td>
            <td>
              <span :class="['badge-estado', rep.estado]">
                {{ rep.estado.toUpperCase() }}
              </span>
            </td>
            <td>
              <!-- Acciones de cambio de estado -->
              <div v-if="rep.estado === 'pendiente'" class="action-box">
                <input type="text" v-model="notas[rep.id]" placeholder="Nota de inspección..." class="input-nota" />
                <button @click="actualizarEstado(rep.id, 'inspeccionado')" class="btn-act btn-inspeccionar">
                  🔍 Inspeccionar
                </button>
              </div>

              <div v-else-if="rep.estado === 'inspeccionado'" class="action-box">
                <input type="text" v-model="notas[rep.id]" placeholder="Nota de solución..." class="input-nota" />
                <button @click="actualizarEstado(rep.id, 'resuelto')" class="btn-act btn-resolver">
                  ✅ Resolver
                </button>
              </div>

              <div v-else class="text-resuelto">
                <small v-if="rep.nota_resolucion"><strong>Nota:</strong> {{ rep.nota_resolucion }}</small>
                <small v-else>Atendido por {{ rep.resuelto_por_nombre || 'Personal' }}</small>
              </div>
            </td>
          </tr>
        </tbody>
      </table>
    </div>

    <!-- Modal Foto Ampliada -->
    <div v-if="fotoModal" class="modal-overlay" @click="fotoModal = null">
      <div class="modal-content">
        <img :src="fotoModal" alt="Foto Evidencia" />
      </div>
    </div>
  </div>
</template>

<script>
import { reportes, cambiarEstadoReporte } from '../services/api'

export default {
  name: 'ReportesOperarioComponent',
  data() {
    return {
      listaReportes: [],
      filtro: 'todos',
      notas: {},
      fotoModal: null
    }
  },
  computed: {
    reportesFiltrados() {
      if (this.filtro === 'todos') return this.listaReportes
      return this.listaReportes.filter(r => r.estado === this.filtro)
    }
  },
  mounted() {
    this.cargarReportes()
  },
  methods: {
    async cargarReportes() {
      try {
        this.listaReportes = await reportes()
      } catch (err) {
        console.error('Error cargando reportes:', err)
      }
    },
    async actualizarEstado(id, nuevoEstado) {
      const nota = this.notas[id] || ''
      try {
        await cambiarEstadoReporte(id, nuevoEstado, nota)
        this.notas[id] = ''
        await this.cargarReportes()
      } catch (err) {
        alert(err.message || 'Error actualizando el reporte')
      }
    }
  }
}
</script>

<style scoped>
.gestion-reportes {
  color: #f8fafc;
}

.header-reportes {
  display: flex;
  justify-content: space-between;
  align-items: center;
}

.header-reportes h3 {
  margin: 0;
  color: #38bdf8;
}

.filtros {
  display: flex;
  gap: 8px;
}

.btn-filtro {
  background: #0f172a;
  border: 1px solid #334155;
  color: #94a3b8;
  padding: 5px 12px;
  border-radius: 6px;
  font-size: 0.75rem;
  font-weight: 600;
  cursor: pointer;
}

.btn-filtro.activo {
  background: #0284c7;
  color: #fff;
  border-color: #38bdf8;
}

.tabla-card {
  background: #1e293b;
  border-radius: 10px;
  border: 1px solid #334155;
  overflow: hidden;
}

.tabla-gestion {
  width: 100%;
  border-collapse: collapse;
  text-align: left;
  font-size: 0.85rem;
}

.tabla-gestion th {
  background: #0f172a;
  padding: 12px;
  color: #94a3b8;
}

.tabla-gestion td {
  padding: 12px;
  border-top: 1px solid #334155;
  vertical-align: middle;
}

.thumb-img {
  width: 40px;
  height: 40px;
  object-fit: cover;
  border-radius: 6px;
  cursor: pointer;
  border: 1px solid #0284c7;
}

.text-tipo {
  color: #38bdf8;
}

.desc-text {
  margin: 2px 0 0 0;
  font-size: 0.8rem;
  color: #94a3b8;
}

.badge-coords {
  background: #0f172a;
  padding: 3px 6px;
  border-radius: 4px;
  font-size: 0.75rem;
  color: #cbd5e1;
}

.action-box {
  display: flex;
  gap: 6px;
  flex-direction: column;
}

.input-nota {
  background: #0f172a;
  border: 1px solid #334155;
  color: #fff;
  padding: 4px 8px;
  border-radius: 4px;
  font-size: 0.75rem;
}

.btn-act {
  border: none;
  padding: 5px 10px;
  border-radius: 4px;
  font-weight: 600;
  font-size: 0.75rem;
  cursor: pointer;
}

.btn-inspeccionar {
  background: #0284c7;
  color: #fff;
}

.btn-resolver {
  background: #22c55e;
  color: #fff;
}

.badge-estado {
  padding: 3px 8px;
  border-radius: 99px;
  font-size: 0.7rem;
  font-weight: 700;
}

.badge-estado.pendiente {
  background: rgba(234, 179, 8, 0.2);
  color: #facc15;
}

.badge-estado.inspeccionado {
  background: rgba(56, 189, 248, 0.2);
  color: #38bdf8;
}

.badge-estado.resuelto {
  background: rgba(34, 197, 94, 0.2);
  color: #4ade80;
}

.modal-overlay {
  position: fixed;
  top: 0;
  left: 0;
  width: 100vw;
  height: 100vh;
  background: rgba(0, 0, 0, 0.85);
  display: flex;
  align-items: center;
  justify-content: center;
  z-index: 2000;
}

.modal-content img {
  max-width: 90vw;
  max-height: 80vh;
  border-radius: 8px;
}
</style>