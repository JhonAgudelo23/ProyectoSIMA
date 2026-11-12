<template>
  <div class="reportes-panel">
    <div class="header-panel">
      <h3>Incidencias Reportadas ({{ listaReportes.length }})</h3>
      <button class="btn-recargar" @click="cargarReportes">Actualizar</button>
    </div>

    <div v-if="cargando" class="estado-msg">Cargando incidencias...</div>
    <div v-else-if="error" class="error-msg">{{ error }}</div>
    <div v-else-if="listaReportes.length === 0" class="estado-msg">No hay incidencias registradas aún.</div>

    <div v-else class="grid-tarjetas">
      <div v-for="rep in listaReportes" :key="rep.id" class="tarjeta-reporte">
        <div class="tarjeta-top">
          <span class="badge-tipo">{{ rep.tipo }}</span>
          <span :class="['badge-estado', rep.estado]">{{ rep.estado.toUpperCase() }}</span>
        </div>

        <p class="descripcion">{{ rep.descripcion || 'Sin descripción adicional.' }}</p>

        <!-- Evidencia Fotográfica -->
        <div v-if="rep.evidencia" class="evidencia-contenedor">
          <img :src="rep.evidencia" alt="Evidencia del reporte" class="foto-evidencia" />
        </div>
        <p v-else class="sin-foto">Sin evidencia fotográfica adjunta</p>

        <div class="meta-info">
          <span>👤 {{ rep.ciudadano || 'Ciudadano' }}</span>
          <span>📍 {{ Number(rep.lat).toFixed(4) }}, {{ Number(rep.lng).toFixed(4) }}</span>
        </div>

        <!-- Acciones según estado y rol -->
        <div class="acciones">
          <button
            v-if="rep.estado === 'pendiente' && puedeGestionar"
            class="btn-accion inspeccionar"
            @click="cambiarEstado(rep.id, 'inspeccionado')"
          >
            Marcar Inspeccionado
          </button>

          <button
            v-if="rep.estado === 'inspeccionado' && puedeGestionar"
            class="btn-accion resolver"
            @click="cambiarEstado(rep.id, 'resuelto')"
          >
            Marcar Resuelto
          </button>

          <button
            v-if="puedeEliminar"
            class="btn-accion eliminar"
            @click="borrarReporte(rep.id)"
          >
            Eliminar
          </button>
        </div>
      </div>
    </div>
  </div>
</template>

<script>
import { reportes, cambiarEstadoReporte, eliminarReporte } from '../services/api';

export default {
  name: 'ReportesOperarioComponent',
  data() {
    return {
      listaReportes: [],
      cargando: false,
      error: ''
    };
  },
  computed: {
    usuario() {
      try {
        return JSON.parse(localStorage.getItem('user')) || {};
      } catch {
        return {};
      }
    },
    puedeGestionar() {
      return ['operario', 'admin'].includes(this.usuario.rol);
    },
    puedeEliminar() {
      return ['admin', 'ciudadano'].includes(this.usuario.rol);
    }
  },
  mounted() {
    this.cargarReportes();
  },
  methods: {
    async cargarReportes() {
      this.cargando = true;
      this.error = '';
      try {
        this.listaReportes = await reportes();
      } catch (err) {
        this.error = err.message || 'Error al cargar las incidencias';
      } finally {
        this.cargando = false;
      }
    },
    async cambiarEstado(id, nuevoEstado) {
      const nota = prompt(`Nota opcional para marcar como ${nuevoEstado}:`) || '';
      try {
        await cambiarEstadoReporte(id, nuevoEstado, nota);
        await this.cargarReportes();
      } catch (err) {
        alert(err.message);
      }
    },
    async borrarReporte(id) {
      if (!confirm('¿Seguro que deseas eliminar este reporte?')) return;
      try {
        await eliminarReporte(id);
        await this.cargarReportes();
      } catch (err) {
        alert(err.message);
      }
    }
  }
};
</script>

<style scoped>
.reportes-panel {
  margin-top: 1.5rem;
}
.header-panel {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 1rem;
}
.btn-recargar {
  background: #334155;
  color: #f8fafc;
  border: none;
  padding: 0.45rem 0.9rem;
  border-radius: 6px;
  cursor: pointer;
}
.grid-tarjetas {
  display: grid;
  grid-template-columns: repeat(auto-fill, minmax(300px, 1fr));
  gap: 1.2rem;
}
.tarjeta-reporte {
  background: #1e293b;
  border: 1px solid #334155;
  border-radius: 10px;
  padding: 1.1rem;
  display: flex;
  flex-direction: column;
  gap: 0.75rem;
}
.tarjeta-top {
  display: flex;
  justify-content: space-between;
  align-items: center;
}
.badge-tipo {
  font-weight: 700;
  color: #38bdf8;
}
.badge-estado {
  font-size: 0.75rem;
  font-weight: 700;
  padding: 0.25rem 0.6rem;
  border-radius: 999px;
}
.badge-estado.pendiente { background: rgba(245, 158, 11, 0.2); color: #fbbf24; }
.badge-estado.inspeccionado { background: rgba(56, 189, 248, 0.2); color: #38bdf8; }
.badge-estado.resuelto { background: rgba(16, 185, 129, 0.2); color: #34d399; }
.descripcion {
  color: #cbd5e1;
  font-size: 0.92rem;
}
.evidencia-contenedor {
  width: 100%;
  border-radius: 8px;
  overflow: hidden;
  border: 1px solid #475569;
}
.foto-evidencia {
  width: 100%;
  max-height: 180px;
  object-fit: cover;
  display: block;
}
.sin-foto {
  font-size: 0.8rem;
  color: #64748b;
  font-style: italic;
}
.meta-info {
  display: flex;
  justify-content: space-between;
  font-size: 0.8rem;
  color: #94a3b8;
}
.acciones {
  display: flex;
  gap: 0.5rem;
  flex-wrap: wrap;
  margin-top: auto;
}
.btn-accion {
  border: none;
  padding: 0.45rem 0.75rem;
  border-radius: 6px;
  font-size: 0.82rem;
  font-weight: 600;
  cursor: pointer;
  color: white;
}
.inspeccionar { background: #0284c7; }
.resolver { background: #059669; }
.eliminar { background: #dc2626; }
</style>