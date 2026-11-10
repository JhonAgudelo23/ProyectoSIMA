<template>
  <div class="sensores-card">
    <div class="card-header-cyber">
      <div>
        <h4 class="title-cyber">📡 Telemetría de Sensores IoT</h4>
        <span class="sub-cyber">Monitoreo ultrasónico y de gases en pozos activos</span>
      </div>

      <button v-if="esPersonal" @click="mostrarFormulario = !mostrarFormulario" class="btn-agregar-cyber">
        {{ mostrarFormulario ? '✕ Cancelar' : '⚡ + Registrar Lectura' }}
      </button>
    </div>

    <!-- Formulario para Operarios y Admin -->
    <div v-if="mostrarFormulario && esPersonal" class="form-panel-cyber">
      <h5 class="form-title">Ingresar Nueva Lectura Manual</h5>
      <form @submit.prevent="guardarSensor" class="form-grid">
        <div class="field-group">
          <label>Pozo de Inspección</label>
          <select v-model="nuevoSensor.pozo_id" required class="select-cyber">
            <option value="" disabled>Selecciona un pozo...</option>
            <option v-for="pozo in listaPozos" :key="pozo.id" :value="pozo.id">
              {{ pozo.codigo }} — {{ pozo.ubicacion }}
            </option>
          </select>
        </div>

        <div class="field-group">
          <label>Nivel de Agua (%)</label>
          <input type="number" v-model.number="nuevoSensor.nivel_pct" min="0" max="100" required class="input-cyber"
            placeholder="0 - 100" />
        </div>

        <div class="field-group btn-field">
          <button type="submit" class="btn-guardar-cyber" :disabled="guardando">
            {{ guardando ? 'Enviando...' : '💾 Guardar Dato' }}
          </button>
        </div>
      </form>
      <p v-if="errorForm" class="text-error-cyber">{{ errorForm }}</p>
    </div>

    <!-- Tabla de Pozos y Telemetría -->
    <div class="table-container">
      <table class="table-cyber">
        <thead>
          <tr>
            <th>Código</th>
            <th>Ubicación</th>
            <th>Nivel Monitoreado</th>
            <th>Estado</th>
            <th>Actualización</th>
          </tr>
        </thead>
        <tbody>
          <tr v-if="listaPozos.length === 0">
            <td colspan="5" class="empty-row">Sincronizando sensores...</td>
          </tr>
          <tr v-for="pozo in listaPozos" :key="pozo.id" class="row-cyber">
            <td>
              <span class="badge-code">{{ pozo.codigo }}</span>
            </td>
            <td>
              <span class="location-text">{{ pozo.ubicacion }}</span>
            </td>
            <td>
              <div class="telemetry-bar-wrapper">
                <div class="bar-track">
                  <div class="bar-fill-animated"
                    :style="{ width: pozo.nivel_pct + '%', backgroundColor: colorSemaf(pozo.nivel_pct) }"></div>
                </div>
                <span class="pct-text" :style="{ color: colorSemaf(pozo.nivel_pct) }">
                  {{ parseFloat(pozo.nivel_pct).toFixed(1) }}%
                </span>
              </div>
            </td>
            <td>
              <span class="status-pill" :class="claseEstado(pozo.nivel_pct)">
                {{ textoEstado(pozo.nivel_pct) }}
              </span>
            </td>
            <td>
              <span class="time-pulse">● En vivo (2s)</span>
            </td>
          </tr>
        </tbody>
      </table>
    </div>
  </div>
</template>

<script>
import { sesion } from '../services/auth'
import { pozos, enviarLectura } from '../services/api'

export default {
  name: 'SensoresComponent',
  data() {
    return {
      sesion,
      listaPozos: [],
      mostrarFormulario: false,
      guardando: false,
      errorForm: '',
      intervaloRefresco: null,
      nuevoSensor: {
        pozo_id: '',
        nivel_pct: 50
      }
    }
  },
  computed: {
    esPersonal() {
      const rol = this.sesion?.user?.rol
      return rol === 'admin' || rol === 'operario' || rol === 'tecnico'
    }
  },
  mounted() {
    this.cargarDatos()
    this.intervaloRefresco = setInterval(() => {
      this.cargarDatos()
    }, 2000)
  },
  beforeUnmount() {
    if (this.intervaloRefresco) clearInterval(this.intervaloRefresco)
  },
  methods: {
    async cargarDatos() {
      try {
        this.listaPozos = await pozos()
      } catch (err) {
        console.error('Error cargando pozos:', err)
      }
    },
    colorSemaf(pct) {
      if (pct >= 75) return '#ef4444'
      if (pct >= 50) return '#eab308'
      return '#22c55e'
    },
    claseEstado(pct) {
      if (pct >= 75) return 'critico'
      if (pct >= 50) return 'alerta'
      return 'normal'
    },
    textoEstado(pct) {
      if (pct >= 75) return 'CRÍTICO'
      if (pct >= 50) return 'ALERTA'
      return 'NORMAL'
    },
    async guardarSensor() {
      if (!this.nuevoSensor.pozo_id) {
        this.errorForm = 'Selecciona un pozo'
        return
      }

      this.guardando = true
      this.errorForm = ''

      try {
        await enviarLectura(this.nuevoSensor.pozo_id, this.nuevoSensor.nivel_pct)
        this.mostrarFormulario = false
        this.nuevoSensor.pozo_id = ''
        this.nuevoSensor.nivel_pct = 50
        await this.cargarDatos()
      } catch (err) {
        this.errorForm = err.message || 'Error al guardar lectura.'
      } finally {
        this.guardando = false
      }
    }
  }
}
</script>

<style scoped>
.sensores-card {
  font-family: system-ui, -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif;
  color: #f8fafc;
}

.card-header-cyber {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 1.2rem;
  flex-wrap: wrap;
  gap: 10px;
}

.title-cyber {
  margin: 0;
  font-size: 1.15rem;
  font-weight: 700;
  color: #38bdf8;
}

.sub-cyber {
  font-size: 0.8rem;
  color: #94a3b8;
}

.btn-agregar-cyber {
  background: linear-gradient(135deg, #0284c7 0%, #0369a1 100%);
  color: #ffffff;
  border: none;
  padding: 8px 14px;
  border-radius: 6px;
  font-size: 0.85rem;
  font-weight: 600;
  cursor: pointer;
  box-shadow: 0 2px 10px rgba(2, 132, 199, 0.3);
  transition: all 0.2s;
  white-space: nowrap;
}

.btn-agregar-cyber:hover {
  transform: translateY(-1px);
  box-shadow: 0 4px 14px rgba(2, 132, 199, 0.5);
}

.form-panel-cyber {
  background: #0f172a;
  border: 1px solid #334155;
  border-radius: 8px;
  padding: 1rem;
  margin-bottom: 1.2rem;
}

.form-title {
  margin: 0 0 10px 0;
  font-size: 0.85rem;
  color: #38bdf8;
  font-weight: 600;
}

.form-grid {
  display: grid;
  grid-template-columns: 2fr 1fr 1fr;
  gap: 10px;
  align-items: end;
}

@media (max-width: 600px) {
  .form-grid {
    grid-template-columns: 1fr;
  }
}

.field-group label {
  display: block;
  font-size: 0.75rem;
  color: #94a3b8;
  margin-bottom: 4px;
}

.select-cyber,
.input-cyber {
  width: 100%;
  padding: 8px 10px;
  background: #1e293b;
  border: 1px solid #334155;
  color: #fff;
  border-radius: 6px;
  font-size: 0.85rem;
  outline: none;
  box-sizing: border-box;
}

.select-cyber:focus,
.input-cyber:focus {
  border-color: #0284c7;
}

.btn-guardar-cyber {
  background: #22c55e;
  color: #fff;
  border: none;
  padding: 9px 12px;
  border-radius: 6px;
  font-weight: 600;
  font-size: 0.85rem;
  cursor: pointer;
  width: 100%;
}

.btn-guardar-cyber:hover {
  background: #16a34a;
}

.text-error-cyber {
  color: #f87171;
  font-size: 0.8rem;
  margin: 8px 0 0 0;
}

.table-container {
  overflow-x: auto;
  border-radius: 8px;
  border: 1px solid #334155;
  background: #0f172a;
}

.table-cyber {
  width: 100%;
  border-collapse: collapse;
  text-align: left;
  font-size: 0.85rem;
}

.table-cyber th {
  background: #090d16;
  padding: 10px 12px;
  color: #94a3b8;
  font-weight: 600;
  border-bottom: 1px solid #334155;
  white-space: nowrap;
}

.row-cyber td {
  padding: 10px 12px;
  border-bottom: 1px solid #1e293b;
  vertical-align: middle;
}

/* Fix del Badge para evitar saltos de línea */
.badge-code {
  display: inline-flex;
  align-items: center;
  justify-content: center;
  white-space: nowrap;
  background: rgba(2, 132, 199, 0.2);
  color: #38bdf8;
  border: 1px solid rgba(56, 189, 248, 0.3);
  padding: 3px 8px;
  border-radius: 6px;
  font-family: monospace;
  font-weight: 700;
  font-size: 0.8rem;
  min-width: 60px;
}

.location-text {
  color: #cbd5e1;
  font-size: 0.82rem;
  line-height: 1.2;
  display: block;
}

.telemetry-bar-wrapper {
  display: flex;
  align-items: center;
  gap: 8px;
  min-width: 120px;
}

.bar-track {
  flex: 1;
  height: 8px;
  background: #1e293b;
  border-radius: 99px;
  overflow: hidden;
}

.bar-fill-animated {
  height: 100%;
  border-radius: 99px;
  transition: width 0.8s ease-in-out, background-color 0.5s ease;
}

.pct-text {
  font-weight: 700;
  font-size: 0.8rem;
  min-width: 42px;
}

.status-pill {
  display: inline-block;
  padding: 2px 8px;
  border-radius: 99px;
  font-size: 0.7rem;
  font-weight: 800;
  letter-spacing: 0.5px;
  white-space: nowrap;
}

.status-pill.normal {
  background: rgba(34, 197, 94, 0.15);
  color: #4ade80;
  border: 1px solid rgba(34, 197, 94, 0.3);
}

.status-pill.alerta {
  background: rgba(234, 179, 8, 0.15);
  color: #facc15;
  border: 1px solid rgba(234, 179, 8, 0.3);
}

.status-pill.critico {
  background: rgba(239, 68, 68, 0.15);
  color: #f87171;
  border: 1px solid rgba(239, 68, 68, 0.3);
}

.time-pulse {
  color: #22c55e;
  font-size: 0.75rem;
  font-weight: 600;
  white-space: nowrap;
}

.empty-row {
  text-align: center;
  padding: 1.5rem;
  color: #64748b;
}
</style>