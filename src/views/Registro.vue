<template>
  <div class="auth-page">
    <NavbarComponent />

    <main class="auth-container">
      <div class="card-auth">
        <h2>Crear una cuenta</h2>
        <p class="sub">Regístrate como ciudadano para enviar reportes del sistema.</p>

        <form @submit.prevent="procesarRegistro">
          <div class="field">
            <label>Nombre completo</label>
            <input type="text" v-model="nombre" placeholder="Ej. Juan Pérez" required class="input-cyber" />
          </div>

          <div class="field mt-3">
            <label>Correo electrónico</label>
            <input type="email" v-model="email" placeholder="correo@ejemplo.com" required class="input-cyber" />
          </div>

          <div class="field mt-3">
            <label>Contraseña</label>
            <input type="password" v-model="password" placeholder="••••••••" required class="input-cyber" />
          </div>

          <p v-if="error" class="text-error mt-3">{{ error }}</p>

          <button type="submit" class="btn-primary w-100 mt-3" :disabled="cargando">
            {{ cargando ? 'Registrando...' : 'Registrarse' }}
          </button>

          <p class="text-center mt-3 link-login">
            ¿Ya tienes cuenta? <router-link to="/login">Inicia sesión aquí</router-link>
          </p>
        </form>
      </div>
    </main>
  </div>
</template>

<script>
import NavbarComponent from '../components/NavbarComponent.vue'
import { register } from '../services/api'
import { iniciarSesion } from '../services/auth'

export default {
  name: 'Registro',
  components: { NavbarComponent },
  data() {
    return {
      nombre: '',
      email: '',
      password: '',
      cargando: false,
      error: ''
    }
  },
  methods: {
    async procesarRegistro() {
      this.cargando = true
      this.error = ''

      try {
        const res = await register({
          nombre: this.nombre,
          email: this.email,
          password: this.password
        })

        if (res && res.token && res.user) {
          iniciarSesion(res.token, res.user)
          this.$router.push('/reportar')
        } else {
          this.error = 'Respuesta de registro inválida.'
        }
      } catch (err) {
        this.error = err.message || 'Error al completar el registro.'
      } finally {
        this.cargando = false
      }
    }
  }
}
</script>

<style scoped>
.auth-page {
  min-height: 100vh;
  background: #090d16;
  display: flex;
  flex-direction: column;
}

.auth-container {
  flex: 1;
  display: flex;
  align-items: center;
  justify-content: center;
  padding: 2rem;
}

.card-auth {
  background: #ffffff;
  padding: 2.5rem;
  border-radius: 12px;
  box-shadow: 0 10px 30px rgba(0, 0, 0, 0.5);
  width: 100%;
  max-width: 420px;
  box-sizing: border-box;
}

h2 {
  margin: 0;
  color: #0f172a;
  font-size: 1.5rem;
  font-weight: 700;
}

.sub {
  color: #64748b;
  font-size: 0.9rem;
  margin-top: 4px;
  margin-bottom: 1.5rem;
}

.field label {
  display: block;
  font-size: 0.85rem;
  font-weight: 600;
  color: #334155;
  margin-bottom: 4px;
}

.mt-3 {
  margin-top: 1rem;
}

.input-cyber {
  width: 100%;
  padding: 10px 12px;
  border: 1px solid #cbd5e1;
  border-radius: 6px;
  outline: none;
  box-sizing: border-box;
  font-size: 0.95rem;
}

.input-cyber:focus {
  border-color: #0284c7;
  box-shadow: 0 0 0 3px rgba(2, 132, 199, 0.15);
}

.btn-primary {
  background: #0284c7;
  color: #ffffff;
  border: none;
  padding: 11px;
  border-radius: 6px;
  font-weight: 600;
  cursor: pointer;
  width: 100%;
  font-size: 0.95rem;
  transition: background 0.2s;
}

.btn-primary:hover {
  background: #0369a1;
}

.btn-primary:disabled {
  background: #94a3b8;
  cursor: not-allowed;
}

.text-error {
  background: #fee2e2;
  color: #ef4444;
  padding: 8px 12px;
  border-radius: 6px;
  font-size: 0.85rem;
  text-align: center;
}

.text-center {
  text-align: center;
}

.link-login {
  color: #64748b;
  font-size: 0.85rem;
}

.link-login a {
  color: #0284c7;
  font-weight: 600;
  text-decoration: none;
}

.link-login a:hover {
  text-decoration: underline;
}
</style>