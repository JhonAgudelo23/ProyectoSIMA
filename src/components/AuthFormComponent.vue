<template>
  <form class="auth-form" @submit.prevent="enviar">
    <h2>{{ modo === 'login' ? 'Iniciar sesión' : 'Crear cuenta' }}</h2>
    <p class="sub">
      {{ modo === 'login'
        ? 'Ingresa con tu correo y contraseña.'
        : 'Crea tu cuenta de ciudadano para reportar problemas en tu sector.' }}
    </p>

    <label v-if="modo === 'registro'">
      Nombre completo
      <input v-model.trim="form.nombre" type="text" placeholder="Tu nombre" />
    </label>

    <label>
      Correo electrónico
      <input v-model.trim="form.email" type="email" placeholder="correo@ejemplo.com" />
    </label>

    <label>
      Contraseña
      <input v-model="form.password" type="password" placeholder="Mínimo 6 caracteres" />
    </label>

    <label v-if="modo === 'registro'">
      Confirmar contraseña
      <input v-model="form.confirmar" type="password" placeholder="Repite la contraseña" />
    </label>

    <p v-if="error" class="msg error">{{ error }}</p>

    <button class="btn btn-primary" type="submit" :disabled="cargando">
      {{ cargando ? 'Procesando...' : (modo === 'login' ? 'Entrar' : 'Registrarme') }}
    </button>

    <p class="cambio">
      <template v-if="modo === 'login'">
        ¿No tienes cuenta? <router-link to="/registro">Regístrate</router-link>
      </template>
      <template v-else>
        ¿Ya tienes cuenta? <router-link to="/login">Inicia sesión</router-link>
      </template>
    </p>
  </form>
</template>

<script>
import api from '../services/api'
import { iniciarSesion } from '../services/auth'

export default {
  name: 'AuthFormComponent',
  props: {
    modo: { type: String, default: 'login' } // 'login' o 'registro'
  },
  data() {
    return {
      form: { nombre: '', email: '', password: '', confirmar: '' },
      error: '',
      cargando: false
    }
  },
  methods: {
    async enviar() {
      this.error = ''
      const f = this.form

      if (!f.email || !f.password) return (this.error = 'Completa todos los campos')
      if (this.modo === 'registro') {
        if (!f.nombre) return (this.error = 'Escribe tu nombre')
        if (f.password.length < 6) return (this.error = 'La contraseña debe tener mínimo 6 caracteres')
        if (f.password !== f.confirmar) return (this.error = 'Las contraseñas no coinciden')
      }

      this.cargando = true
      try {
        const r = this.modo === 'login'
          ? await api.login({ email: f.email, password: f.password })
          : await api.registro({ nombre: f.nombre, email: f.email, password: f.password })

        iniciarSesion(r.token, r.user)
        // Si venía de un módulo protegido, regresa ahí (solo rutas internas)
        const destino = this.$route.query.redirect
        const seguro = typeof destino === 'string' && destino.startsWith('/') && !destino.startsWith('//')
        this.$router.push(seguro ? destino : (r.user.rol === 'ciudadano' ? '/reportar' : '/panel'))
      } catch (e) {
        this.error = e.message
      } finally {
        this.cargando = false
      }
    }
  }
}
</script>

<style scoped>
.auth-form {
  background: #fff;
  width: 100%;
  max-width: 400px;
  padding: 2rem;
  border-radius: 12px;
  box-shadow: 0 4px 20px rgba(0, 0, 0, 0.08);
  display: flex;
  flex-direction: column;
  gap: 1rem;
}
h2 { margin: 0; color: #0f172a; }
.sub { margin: 0; color: #64748b; font-size: 0.9rem; }
label { display: flex; flex-direction: column; gap: 0.3rem; font-size: 0.85rem; font-weight: 600; color: #334155; }
input {
  padding: 0.65rem 0.8rem;
  border: 1px solid #cbd5e1;
  border-radius: 8px;
  font-size: 0.95rem;
}
input:focus { outline: 2px solid #0284c7; border-color: transparent; }
.msg.error { background: #fee2e2; color: #b91c1c; padding: 0.6rem 0.8rem; border-radius: 8px; font-size: 0.85rem; margin: 0; }
.btn { padding: 0.7rem; border-radius: 8px; border: none; font-weight: 600; cursor: pointer; }
.btn-primary { background: #0284c7; color: #fff; }
.btn-primary:hover { background: #0369a1; }
.btn:disabled { opacity: 0.6; cursor: wait; }
.cambio { text-align: center; font-size: 0.88rem; color: #64748b; margin: 0; }
.cambio a { color: #0284c7; font-weight: 600; }
</style>
