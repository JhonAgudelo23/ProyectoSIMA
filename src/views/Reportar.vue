<template>
  <div class="pagina">
    <NavbarComponent></NavbarComponent>

    <main class="contenido">
      <h1>Reportar un problema</h1>
      <p class="sub">Marca en el mapa dónde está el problema y cuéntanos qué pasa.</p>

      <div class="layout">
        <section class="col-mapa">
          <MapaSelectorComponent v-model="ubicacion" :pozos="pozos"></MapaSelectorComponent>
        </section>

        <section class="col-form">
          <form @submit.prevent="enviar">
            <label>
              Tipo de problema
              <select v-model="tipo">
                <option value="" disabled>Selecciona...</option>
                <option v-for="t in tipos" :key="t" :value="t">{{ t }}</option>
              </select>
            </label>

            <label>
              Descripción (opcional)
              <textarea v-model="descripcion" rows="4" placeholder="Ej: Sale agua por la tapa desde ayer"></textarea>
            </label>

            <p v-if="error" class="msg error">{{ error }}</p>
            <p v-if="ok" class="msg ok">{{ ok }}</p>

            <button class="btn btn-primary" :disabled="enviando">
              {{ enviando ? 'Enviando...' : 'Enviar reporte' }}
            </button>
          </form>
        </section>
      </div>

      <h2>Mis reportes</h2>
      <p v-if="reportes.length === 0" class="vacio">Aún no has enviado reportes.</p>
      <ul class="lista">
        <li v-for="r in reportes" :key="r.id">
          <div>
            <strong>{{ r.tipo }}</strong>
            <small> · {{ r.creado }}</small>
            <p v-if="r.descripcion">{{ r.descripcion }}</p>
            <p v-if="r.inspeccionado_en" class="traza">
              Inspeccionado por {{ r.inspeccionado_por_nombre }} · {{ r.inspeccionado_en }}
              <span v-if="r.nota_inspeccion">— “{{ r.nota_inspeccion }}”</span>
            </p>
            <p v-if="r.resuelto_en" class="traza">
              Resuelto por {{ r.resuelto_por_nombre }} · {{ r.resuelto_en }}
              <span v-if="r.nota_resolucion">— “{{ r.nota_resolucion }}”</span>
            </p>
          </div>
          <span class="estado" :class="r.estado">{{ etiquetas[r.estado] }}</span>
        </li>
      </ul>
    </main>

    <FooterComponent></FooterComponent>
  </div>
</template>

<script>
import api from '../services/api'
import MapaSelectorComponent from '../components/MapaSelectorComponent.vue'

export default {
  name: 'Reportar',
  components: { MapaSelectorComponent },
  data() {
    return {
      ubicacion: null,
      tipo: '',
      descripcion: '',
      tipos: [],
      pozos: [],
      reportes: [],
      error: '',
      ok: '',
      enviando: false,
      etiquetas: { pendiente: 'Pendiente', inspeccionado: 'Inspeccionado', resuelto: 'Resuelto' },
      listo: false
    }
  },
  async created() {
    this.tipos = await api.tiposReporte()
    this.pozos = await api.pozos()
    await this.cargarReportes()
    this.listo = true
  },
  methods: {
    async cargarReportes() {
      this.reportes = await api.reportes()
    },
    async enviar() {
      this.error = ''
      this.ok = ''
      if (!this.ubicacion) return (this.error = 'Marca la ubicación en el mapa')
      if (!this.tipo) return (this.error = 'Selecciona el tipo de problema')

      this.enviando = true
      try {
        await api.crearReporte({
          lat: this.ubicacion.lat,
          lng: this.ubicacion.lng,
          tipo: this.tipo,
          descripcion: this.descripcion
        })
        this.ok = '¡Reporte enviado! Gracias por avisar.'
        this.ubicacion = null
        this.tipo = ''
        this.descripcion = ''
        await this.cargarReportes()
      } catch (e) {
        this.error = e.message
      } finally {
        this.enviando = false
      }
    }
  }
}
</script>

<style scoped>
.pagina { min-height: 100vh; display: flex; flex-direction: column; background: #f1f5f9; font-family: Arial, sans-serif; color: #334155; }
.contenido { flex: 1; padding: 2rem 4rem; }
h1 { margin: 0; color: #0f172a; }
.sub { color: #64748b; margin: 0.3rem 0 1.5rem; }
.layout { display: grid; grid-template-columns: 2fr 1fr; gap: 1.5rem; }
form { background: #fff; padding: 1.2rem; border-radius: 10px; display: flex; flex-direction: column; gap: 1rem; border: 1px solid #e2e8f0; }
label { display: flex; flex-direction: column; gap: 0.3rem; font-size: 0.85rem; font-weight: 600; }
select, textarea { padding: 0.6rem; border: 1px solid #cbd5e1; border-radius: 8px; font-size: 0.95rem; font-family: inherit; }
.btn { padding: 0.7rem; border-radius: 8px; border: none; font-weight: 600; cursor: pointer; }
.btn-primary { background: #0284c7; color: #fff; }
.btn-primary:hover { background: #0369a1; }
.btn:disabled { opacity: 0.6; }
.msg { margin: 0; padding: 0.6rem 0.8rem; border-radius: 8px; font-size: 0.85rem; }
.msg.error { background: #fee2e2; color: #b91c1c; }
.msg.ok { background: #dcfce7; color: #166534; }
h2 { margin-top: 2rem; color: #0f172a; }
.vacio { color: #94a3b8; }
.lista { list-style: none; padding: 0; display: flex; flex-direction: column; gap: 0.6rem; }
.lista li { background: #fff; border: 1px solid #e2e8f0; border-radius: 8px; padding: 0.8rem 1rem; display: flex; justify-content: space-between; align-items: center; }
.lista p { margin: 0.2rem 0 0; font-size: 0.88rem; color: #64748b; }
.lista small { color: #94a3b8; }
.estado { font-size: 0.75rem; font-weight: 700; padding: 3px 10px; border-radius: 99px; white-space: nowrap; }
.estado.pendiente { background: #fef9c3; color: #854d0e; }
.estado.inspeccionado { background: #ffedd5; color: #9a3412; }
.traza { font-size: 0.82rem; color: #0f766e; }
.estado.resuelto { background: #dcfce7; color: #166534; }
@media (max-width: 800px) { .layout { grid-template-columns: 1fr; } .contenido { padding: 1.5rem; } }
</style>
