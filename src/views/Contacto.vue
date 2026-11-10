<template>
  <div class="page-container">
    <NavbarComponent />

    <main class="main-content d-flex-center">
      <div class="card-section form-card-compact">
        <div class="card-header">
          <h4>🛠️ Soporte Técnico SIMA</h4>
        </div>
        <div class="card-body">
          <p class="sub">Envía tu consulta o reporte de fallas directamente al equipo técnico.</p>

          <form @submit.prevent="enviarSoporte">
            <div class="field">
              <label>Nombre Completo</label>
              <input type="text" v-model="form.nombre" placeholder="Ej. Juan Pérez" required class="input-cyber" />
            </div>

            <div class="field mt-3">
              <label>Correo Electrónico</label>
              <input type="email" v-model="form.email" placeholder="correo@ejemplo.com" required class="input-cyber" />
            </div>

            <div class="field mt-3">
              <label>Asunto</label>
              <select v-model="form.asunto" required class="input-cyber">
                <option value="" disabled>Selecciona un asunto...</option>
                <option value="Error de acceso">Error de acceso o credenciales</option>
                <option value="Falla en el mapa">Falla en visualización del mapa</option>
                <option value="Problema con fotos">Problema con la carga de fotos</option>
                <option value="Consulta general">Consulta técnica general</option>
              </select>
            </div>

            <div class="field mt-3">
              <label>Mensaje o Descripción del Problema</label>
              <textarea v-model="form.mensaje" rows="4" placeholder="Describe detalladamente lo que sucede..." required
                class="input-cyber textarea-cyber"></textarea>
            </div>

            <p v-if="exitoMsg" class="text-exito mt-3">{{ exitoMsg }}</p>

            <button type="submit" class="btn-send mt-4" :disabled="enviando">
              {{ enviando ? 'Enviando...' : '💬 Enviar Mensaje Directo' }}
            </button>
          </form>
        </div>
      </div>
    </main>
  </div>
</template>

<script>
import NavbarComponent from '../components/NavbarComponent.vue'

export default {
  name: 'Contacto',
  components: { NavbarComponent },
  data() {
    return {
      enviando: false,
      exitoMsg: '',
      form: { nombre: '', email: '', asunto: '', mensaje: '' }
    }
  },
  methods: {
    async enviarSoporte() {
      this.enviando = true
      this.exitoMsg = ''
      await new Promise(r => setTimeout(r, 800))
      this.exitoMsg = '¡Tu mensaje ha sido enviado exitosamente al soporte técnico!'
      this.form = { nombre: '', email: '', asunto: '', mensaje: '' }
      this.enviando = false
    }
  }
}
</script>