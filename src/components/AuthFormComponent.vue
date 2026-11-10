<template>
  <div class="login-container">
    <div class="card-login">
      <h2>Iniciar sesión</h2>
      <p class="sub">Ingresa con tu correo y contraseña.</p>

      <form @submit.prevent="ingresar">
        <div class="field">
          <label>Correo electrónico</label>
          <input type="email" v-model="email" placeholder="admin@sima.com" required class="input-cyber" />
        </div>

        <div class="field mt-3">
          <label>Contraseña</label>
          <input type="password" v-model="password" placeholder="••••••••" required class="input-cyber" />
        </div>

        <p v-if="error" class="text-error mt-3">{{ error }}</p>

        <button type="submit" class="btn-primary w-100 mt-3" :disabled="cargando">
          {{ cargando ? 'Verificando...' : 'Entrar' }}
        </button>

        <p class="text-center mt-3">
          ¿No tienes cuenta? <router-link to="/registro">Regístrate</router-link>
        </p>
      </form>
    </div>
  </div>
</template>

<script>
import { login } from '../services/api'
import { iniciarSesion } from '../services/auth'

export default {
  // ...
  methods: {
    async ingresar() {
      this.cargando = true
      this.error = ''

      try {
        // 🚨 Pasar los parámetros por separado: login(this.email, this.password)
        const res = await login(this.email, this.password)

        if (res && res.token && res.user) {
          iniciarSesion(res.token, res.user)

          if (res.user.rol === 'ciudadano') {
            this.$router.push('/reportar')
          } else {
            this.$router.push('/panel')
          }
        }
      } catch (err) {
        this.error = err.message || 'Error al iniciar sesión'
      } finally {
        this.cargando = false
      }
    }
  }
}
</script>

<style scoped>
.login-container {
  min-height: 100vh;
  display: flex;
  align-items: center;
  justify-content: center;
  background: #f1f5f9;
}

.card-login {
  background: #ffffff;
  padding: 2.5rem;
  border-radius: 12px;
  box-shadow: 0 10px 25px rgba(0, 0, 0, 0.05);
  width: 100%;
  max-width: 420px;
}

h2 {
  margin: 0;
  color: #0f172a;
  font-size: 1.5rem;
}

.sub {
  color: #64748b;
  font-size: 0.9rem;
  margin-bottom: 1.5rem;
}

.field label {
  display: block;
  font-size: 0.85rem;
  font-weight: 600;
  color: #334155;
  margin-bottom: 4px;
}

.input-cyber {
  width: 100%;
  padding: 10px 12px;
  border: 1px solid #cbd5e1;
  border-radius: 6px;
  outline: none;
}

.input-cyber:focus {
  border-color: #0284c7;
}

.btn-primary {
  background: #0284c7;
  color: #fff;
  border: none;
  padding: 11px;
  border-radius: 6px;
  font-weight: 600;
  cursor: pointer;
  width: 100%;
}

.btn-primary:hover {
  background: #0369a1;
}

.btn-primary:disabled {
  background: #94a3b8;
}

.text-error {
  background: #fee2e2;
  color: #ef4444;
  padding: 8px 12px;
  border-radius: 6px;
  font-size: 0.85rem;
  text-align: center;
}
</style>