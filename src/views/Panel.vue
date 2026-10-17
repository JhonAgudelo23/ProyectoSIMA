<template>
  <div class="pagina">
    <NavbarComponent></NavbarComponent>

    <main class="contenido">
      <div class="encabezado">
        <div>
          <h1>Panel de monitoreo</h1>
          <p class="sub">Se actualiza automáticamente cada 5 segundos.</p>
        </div>
        <div class="resumen">
          <span class="chip verde">{{ contar('verde') }} normales</span>
          <span class="chip amarillo">{{ contar('amarillo') }} advertencia</span>
          <span class="chip rojo">{{ contar('rojo') }} riesgo</span>
          <span class="chip azul">{{ contarReportes('abiertos') }} reportes abiertos</span>
        </div>
      </div>

      <p v-if="alertas.length" class="alerta">
        ⚠ Alerta: {{ alertas.map(p => p.codigo).join(', ') }} con nivel de riesgo. Se requiere limpieza.
      </p>

      <div id="seccion-mapa" class="layout">
        <MapaPozosComponent :pozos="pozos" :reportes="reportes"></MapaPozosComponent>

        <aside id="seccion-pozos">
          <div class="filtros">
            <button v-for="f in filtros" :key="f.valor"
                    :class="{ activo: filtro === f.valor }" @click="filtro = f.valor">
              {{ f.texto }}
            </button>
          </div>
          <div class="pozos">
            <PozoCardComponent v-for="p in pozosFiltrados" :key="p.id" :pozo="p"></PozoCardComponent>
          </div>
        </aside>
      </div>

      <h2 id="seccion-reportes">Reportes de ciudadanos</h2>
      <div class="filtros">
        <button v-for="f in filtrosReporte" :key="f.valor"
                :class="{ activo: filtroReporte === f.valor }" @click="filtroReporte = f.valor">
          {{ f.texto }} ({{ contarReportes(f.valor) }})
        </button>
      </div>

      <p v-if="reportesFiltrados.length === 0" class="vacio">No hay reportes en esta categoría.</p>
      <table v-else>
        <thead>
          <tr><th>Fecha</th><th>Ciudadano</th><th>Problema</th><th>Seguimiento</th><th>Estado</th><th>Acción</th></tr>
        </thead>
        <tbody>
          <template v-for="r in reportesFiltrados" :key="r.id">
            <tr>
              <td>{{ r.creado }}</td>
              <td>{{ r.ciudadano }}</td>
              <td>
                <strong>{{ r.tipo }}</strong>
                <div class="detalle">{{ r.descripcion || 'Sin descripción' }}</div>
              </td>
              <td class="detalle">
                <div v-if="r.inspeccionado_en">
                  Inspeccionado por {{ r.inspeccionado_por_nombre }}<br>{{ r.inspeccionado_en }}
                  <em v-if="r.nota_inspeccion"><br>“{{ r.nota_inspeccion }}”</em>
                </div>
                <div v-if="r.resuelto_en" class="sep">
                  Resuelto por {{ r.resuelto_por_nombre }}<br>{{ r.resuelto_en }}
                  <em v-if="r.nota_resolucion"><br>“{{ r.nota_resolucion }}”</em>
                </div>
                <span v-if="!r.inspeccionado_en">—</span>
              </td>
              <td><span class="estado" :class="r.estado">{{ etiquetas[r.estado] }}</span></td>
              <td>
                <button v-if="r.estado === 'pendiente'" class="btn-accion insp" @click="abrir(r, 'inspeccionado')">
                  Marcar inspeccionado
                </button>
                <button v-else-if="r.estado === 'inspeccionado'" class="btn-accion res" @click="abrir(r, 'resuelto')">
                  Marcar resuelto
                </button>
                <span v-else class="ok">Cerrado</span>
              </td>
            </tr>
            <tr v-if="accion && accion.id === r.id" class="fila-nota">
              <td colspan="6">
                <label>
                  {{ accion.estado === 'inspeccionado' ? 'Nota de la inspección' : 'Nota de la solución' }} (opcional)
                  <input v-model="nota" type="text" maxlength="250"
                         :placeholder="accion.estado === 'inspeccionado' ? 'Ej: Tubería con grasa acumulada' : 'Ej: Se realizó limpieza del pozo'"
                         @keyup.enter="confirmar" />
                </label>
                <button class="btn-accion res" :disabled="guardando" @click="confirmar">
                  {{ guardando ? 'Guardando...' : 'Confirmar' }}
                </button>
                <button class="btn-accion cancelar" @click="cancelar">Cancelar</button>
                <p v-if="errorAccion" class="error">{{ errorAccion }}</p>
              </td>
            </tr>
          </template>
        </tbody>
      </table>
    </main>

    <FooterComponent></FooterComponent>
  </div>
</template>

<script>
import api from '../services/api'
import MapaPozosComponent from '../components/MapaPozosComponent.vue'
import PozoCardComponent from '../components/PozoCardComponent.vue'

export default {
  name: 'Panel',
  components: { MapaPozosComponent, PozoCardComponent },
  data() {
    return {
      pozos: [],
      reportes: [],
      filtro: 'todos',
      filtroReporte: 'abiertos',
      accion: null,       // { id, estado } del reporte que se está actualizando
      nota: '',
      guardando: false,
      errorAccion: '',
      etiquetas: { pendiente: 'Pendiente', inspeccionado: 'Inspeccionado', resuelto: 'Resuelto' },
      filtrosReporte: [
        { valor: 'abiertos', texto: 'Abiertos' },
        { valor: 'pendiente', texto: 'Pendientes' },
        { valor: 'inspeccionado', texto: 'Inspeccionados' },
        { valor: 'resuelto', texto: 'Resueltos' },
        { valor: 'todos', texto: 'Todos' }
      ],
      filtros: [
        { valor: 'todos', texto: 'Todos' },
        { valor: 'rojo', texto: 'Riesgo' },
        { valor: 'amarillo', texto: 'Advertencia' },
        { valor: 'verde', texto: 'Normales' }
      ]
    }
  },
  computed: {
    pozosFiltrados() {
      return this.filtro === 'todos' ? this.pozos : this.pozos.filter(p => p.estado === this.filtro)
    },
    reportesFiltrados() {
      return this.reportes.filter(r => this.coincide(r, this.filtroReporte))
    },
    alertas() {
      return this.pozos.filter(p => p.estado === 'rojo')
    }
  },
  watch: {
    // Si ya estás en el panel y eliges otro módulo desde la URL
    '$route.query.ver': 'aplicarVista'
  },
  created() {
    this.aplicarVista()
    this.cargar()
    this.timer = setInterval(this.cargar, 5000)
  },
  beforeUnmount() {
    clearInterval(this.timer)
  },
  methods: {
    async cargar() {
      try {
        this.pozos = await api.pozos()
        this.reportes = await api.reportes()
      } catch (e) {
        console.error(e)
      }
    },
    contar(estado) {
      return this.pozos.filter(p => p.estado === estado).length
    },
    // Lee ?ver=... de la URL: aplica el filtro correspondiente y baja a esa sección
    aplicarVista() {
      const vistas = {
        pozos:      { filtro: 'todos', seccion: 'seccion-pozos' },
        alertas:    { filtro: 'rojo', seccion: 'seccion-pozos' },
        mapa:       { filtro: 'todos', seccion: 'seccion-mapa' },
        reportes:   { filtroReporte: 'pendiente', seccion: 'seccion-reportes' },
        inspeccion: { filtroReporte: 'inspeccionado', seccion: 'seccion-reportes' }
      }
      const v = vistas[this.$route.query.ver]
      if (!v) return
      if (v.filtro) this.filtro = v.filtro
      if (v.filtroReporte) this.filtroReporte = v.filtroReporte
      this.$nextTick(() => {
        const el = document.getElementById(v.seccion)
        if (el) el.scrollIntoView({ behavior: 'smooth', block: 'start' })
      })
    },
    coincide(r, filtro) {
      if (filtro === 'todos') return true
      if (filtro === 'abiertos') return r.estado !== 'resuelto'
      return r.estado === filtro
    },
    contarReportes(filtro) {
      return this.reportes.filter(r => this.coincide(r, filtro)).length
    },
    abrir(reporte, estado) {
      this.accion = { id: reporte.id, estado }
      this.nota = ''
      this.errorAccion = ''
    },
    cancelar() {
      this.accion = null
    },
    async confirmar() {
      this.guardando = true
      this.errorAccion = ''
      try {
        await api.cambiarEstadoReporte(this.accion.id, this.accion.estado, this.nota)
        this.accion = null
        await this.cargar()
      } catch (e) {
        this.errorAccion = e.message
      } finally {
        this.guardando = false
      }
    }
  }
}
</script>

<style scoped>
.pagina { min-height: 100vh; display: flex; flex-direction: column; background: #f1f5f9; font-family: Arial, sans-serif; color: #334155; }
.contenido { flex: 1; padding: 2rem 4rem; }
.encabezado { display: flex; justify-content: space-between; align-items: flex-end; flex-wrap: wrap; gap: 1rem; }
h1 { margin: 0; color: #0f172a; }
.sub { color: #64748b; margin: 0.3rem 0 1rem; }
.resumen { display: flex; gap: 0.5rem; margin-bottom: 1rem; }
.chip { padding: 4px 12px; border-radius: 99px; font-size: 0.8rem; font-weight: 700; }
.chip.verde { background: #dcfce7; color: #166534; }
.chip.amarillo { background: #fef9c3; color: #854d0e; }
.chip.rojo { background: #fee2e2; color: #991b1b; }
.chip.azul { background: #dbeafe; color: #1e40af; }
.alerta { background: #fee2e2; color: #991b1b; border: 1px solid #fecaca; padding: 0.7rem 1rem; border-radius: 8px; font-weight: 600; }
.layout { display: grid; grid-template-columns: 2fr 1fr; gap: 1.5rem; align-items: start; }
.filtros { display: flex; gap: 0.4rem; margin-bottom: 0.8rem; flex-wrap: wrap; }
.filtros button { border: 1px solid #cbd5e1; background: #fff; padding: 4px 12px; border-radius: 99px; cursor: pointer; font-size: 0.8rem; }
.filtros button.activo { background: #0284c7; color: #fff; border-color: #0284c7; }
.pozos { display: flex; flex-direction: column; gap: 0.6rem; max-height: 410px; overflow-y: auto; }
h2 { margin-top: 2rem; color: #0f172a; }
.vacio { color: #94a3b8; }
table { width: 100%; border-collapse: collapse; background: #fff; border-radius: 10px; overflow: hidden; font-size: 0.9rem; }
th, td { text-align: left; padding: 0.7rem 1rem; border-bottom: 1px solid #e2e8f0; }
th { background: #f8fafc; color: #64748b; font-size: 0.8rem; text-transform: uppercase; }
td { vertical-align: top; }
.detalle { font-size: 0.8rem; color: #64748b; margin-top: 2px; }
.detalle .sep { margin-top: 6px; }
.estado { font-size: 0.75rem; font-weight: 700; padding: 3px 10px; border-radius: 99px; }
.estado.pendiente { background: #fef9c3; color: #854d0e; }
.estado.inspeccionado { background: #ffedd5; color: #9a3412; }
.estado.resuelto { background: #dcfce7; color: #166534; }
.btn-accion { border: none; padding: 6px 12px; border-radius: 6px; cursor: pointer; font-size: 0.8rem; font-weight: 600; color: #fff; }
.btn-accion.insp { background: #f97316; }
.btn-accion.res { background: #16a34a; }
.btn-accion.cancelar { background: #94a3b8; margin-left: 6px; }
.btn-accion:disabled { opacity: 0.6; }
.ok { color: #16a34a; font-weight: 600; font-size: 0.85rem; }
.fila-nota td { background: #f8fafc; }
.fila-nota label { display: inline-flex; flex-direction: column; gap: 4px; font-size: 0.8rem; font-weight: 600; margin-right: 10px; vertical-align: bottom; }
.fila-nota input { width: 360px; max-width: 100%; padding: 6px 10px; border: 1px solid #cbd5e1; border-radius: 6px; font-size: 0.85rem; }
.error { color: #b91c1c; font-size: 0.85rem; margin: 6px 0 0; }
@media (max-width: 900px) { .layout { grid-template-columns: 1fr; } .contenido { padding: 1.5rem; } }
</style>
