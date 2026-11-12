<template>
  <div class="page-container">
    <NavbarComponent />

    <main class="main-content">
      <header class="d-flex-between">
        <div>
          <h2 class="title-gradient">⚡ Centro de Control Operativo SIMA</h2>
          <p class="sub">Plataforma IoT de monitoreo hidráulico en tiempo real</p>
        </div>
      </header>

      <!-- Control de Pestañas -->
      <div class="tabs-container mt-4">
        <button @click="pestanaActiva = 'monitoreo'" :class="['tab-btn', { activo: pestanaActiva === 'monitoreo' }]">
          🌐 Mapa Geográfico & Telemetría
        </button>
        <button @click="pestanaActiva = 'reportes'" :class="['tab-btn', { activo: pestanaActiva === 'reportes' }]">
          📋 Gestión de Incidencias
        </button>
        <button v-if="esAdmin" @click="abrirPestanaOperarios"
          :class="['tab-btn', { activo: pestanaActiva === 'operarios' }]">
          👤 Operarios de Campo
        </button>
      </div>

      <!-- Pestaña 1: Monitoreo -->
      <section v-if="pestanaActiva === 'monitoreo'" class="mt-4">
        <div class="grid-panel">
          <div class="card-section">
            <div class="card-header">
              <h4>🗺️ Cobertura Territorial de Pozos</h4>
            </div>
            <div class="card-body">
              <MapaPozosComponent :pozos="listaPozos" :pozoSeleccionadoId="pozoSeleccionadoId"
                @seleccionar-pozo="seleccionarPozo" />
            </div>
          </div>

          <div class="card-section">
            <div class="card-body">
              <SensoresComponent />
            </div>
          </div>
        </div>
      </section>

      <!-- Pestaña 2: Reportes -->
      <section v-if="pestanaActiva === 'reportes'" class="mt-4">
        <div class="card-section">
          <div class="card-body">
            <ReportesOperarioComponent />
          </div>
        </div>
      </section>

      <!-- Pestaña 3: Gestionar Operarios (Exclusivo Admin) -->
      <section v-if="pestanaActiva === 'operarios' && esAdmin" class="mt-4">
        <div class="grid-operarios">
          <!-- Formulario de creación -->
          <div class="card-section">
            <div class="card-header">
              <h4>👤 Registrar Nuevo Operario de Campo</h4>
            </div>
            <div class="card-body">
              <form @submit.prevent="registrarNuevoOperario">
                <div class="field">
                  <label>Nombre Completo</label>
                  <input type="text" v-model="formOperario.nombre" placeholder="Ej. Carlos Ramírez" required
                    class="input-cyber" />
                </div>

                <div class="field mt-3">
                  <label>Correo Electrónico Institucional</label>
                  <input type="email" v-model="formOperario.email" placeholder="operario@sima.com" required
                    class="input-cyber" />
                </div>

                <div class="field mt-3">
                  <label>Contraseña Acceso</label>
                  <input type="password" v-model="formOperario.password" placeholder="••••••••" required
                    class="input-cyber" />
                </div>

                <p v-if="exitoOperario" class="text-exito mt-3">{{ exitoOperario }}</p>
                <p v-if="errorOperario" class="text-error mt-3">{{ errorOperario }}</p>

                <button type="submit" class="btn-send mt-4" :disabled="guardandoOperario">
                  {{ guardandoOperario ? 'Guardando...' : '➕ Guardar Nuevo Operario' }}
                </button>
              </form>
            </div>
          </div>

          <!-- Lista de operarios activos con opción de eliminar -->
          <div class="card-section">
            <div class="card-header">
              <h4>📋 Operarios Activos ({{ listaOperarios.length }})</h4>
            </div>
            <div class="card-body">
              <p v-if="listaOperarios.length === 0" class="sub">No hay operarios registrados actualmente.</p>

              <div v-else class="lista-operarios">
                <div v-for="op in listaOperarios" :key="op.id" class="item-operario">
                  <div>
                    <strong>{{ op.nombre }}</strong>
                    <div class="sub">{{ op.email }}</div>
                  </div>
                  <button type="button" class="btn-eliminar-op" @click="borrarOperario(op)">
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
import NavbarComponent from '../components/NavbarComponent.vue'
import MapaPozosComponent from '../components/MapaPozosComponent.vue'
import SensoresComponent from '../components/SensoresComponent.vue'
import ReportesOperarioComponent from '../components/ReportesOperarioComponent.vue'
import { pozos, crearOperario, obtenerOperarios, eliminarOperario } from '../services/api'
import { sesion } from '../services/auth'

export default {
  name: 'Panel',
  components: { NavbarComponent, MapaPozosComponent, SensoresComponent, ReportesOperarioComponent },
  data() {
    return {
      sesion,
      pestanaActiva: 'monitoreo',
      listaPozos: [],
      listaOperarios: [],
      pozoSeleccionadoId: null,
      intervaloRefresco: null,
      guardandoOperario: false,
      exitoOperario: '',
      errorOperario: '',
      formOperario: { nombre: '', email: '', password: '', rol: 'operario' }
    }
  },
  computed: {
    esAdmin() { return this.sesion?.user?.rol === 'admin' }
  },
  mounted() {
    this.cargarPozos()
    if (this.esAdmin) {
      this.cargarOperarios()
    }
    this.intervaloRefresco = setInterval(() => this.cargarPozos(), 2000)
  },
  beforeUnmount() {
    if (this.intervaloRefresco) clearInterval(this.intervaloRefresco)
  },
  methods: {
    async cargarPozos() {
      try { this.listaPozos = await pozos() } catch (err) { console.error(err) }
    },
    async cargarOperarios() {
      try {
        this.listaOperarios = await obtenerOperarios()
      } catch (err) {
        console.error(err)
      }
    },
    abrirPestanaOperarios() {
      this.pestanaActiva = 'operarios'
      this.cargarOperarios()
    },
    seleccionarPozo(pozo) { this.pozoSeleccionadoId = pozo.id },
    async registrarNuevoOperario() {
      this.guardandoOperario = true
      this.exitoOperario = ''
      this.errorOperario = ''
      try {
        this.formOperario.rol = 'operario'
        const res = await crearOperario(this.formOperario)
        this.exitoOperario = res.mensaje || '¡Operario registrado exitosamente!'
        this.formOperario = { nombre: '', email: '', password: '', rol: 'operario' }
        await this.cargarOperarios()
      } catch (err) {
        this.errorOperario = err.message || 'Error al crear la cuenta.'
      } finally {
        this.guardandoOperario = false
      }
    },
    async borrarOperario(op) {
      if (!confirm(`¿Seguro que deseas eliminar al operario ${op.nombre}?`)) return
      this.exitoOperario = ''
      this.errorOperario = ''
      try {
        await eliminarOperario(op.id)
        this.exitoOperario = `Operario ${op.nombre} eliminado correctamente.`
        await this.cargarOperarios()
      } catch (err) {
        this.errorOperario = err.message || 'No se pudo eliminar el operario.'
      }
    }
  }
}
</script>

<style scoped>
.grid-panel {
  display: grid;
  grid-template-columns: 45% 55%;
  gap: 1.5rem;
}

.grid-operarios {
  display: grid;
  grid-template-columns: 1fr 1fr;
  gap: 1.5rem;
}

.lista-operarios {
  display: flex;
  flex-direction: column;
  gap: 0.75rem;
}

.item-operario {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 0.85rem 1rem;
  border-radius: 8px;
  background: rgba(15, 23, 42, 0.6);
  border: 1px solid rgba(56, 189, 248, 0.2);
}

.btn-eliminar-op {
  background: #dc2626;
  color: #fff;
  border: none;
  padding: 0.45rem 0.85rem;
  border-radius: 6px;
  font-size: 0.85rem;
  font-weight: 600;
  cursor: pointer;
}

.btn-eliminar-op:hover {
  background: #b91c1c;
}

@media (max-width: 1100px) {
  .grid-panel,
  .grid-operarios {
    grid-template-columns: 1fr;
  }
}
</style>