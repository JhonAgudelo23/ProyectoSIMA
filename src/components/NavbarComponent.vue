<template>
  <nav class="navbar">
    <router-link to="/" class="logo"><span class="logo-text">SIMA</span></router-link>

    <div class="nav-links">
      <router-link :to="{ path: '/', hash: '#inicio' }">Inicio</router-link>
      <router-link :to="{ path: '/', hash: '#caracteristicas' }">Características</router-link>
      <router-link :to="{ path: '/', hash: '#nosotros' }">Proyecto</router-link>
      <router-link :to="{ path: '/', hash: '#contacto' }">Contacto</router-link>
      <router-link v-if="sesion.user && sesion.user.rol === 'ciudadano'" to="/reportar">Reportar problema</router-link>
      <router-link v-if="sesion.user && sesion.user.rol !== 'ciudadano'" to="/panel">Panel</router-link>
    </div>

    <div class="nav-actions">
      <template v-if="sesion.user">
        <span class="usuario">{{ sesion.user.nombre }} <small>({{ sesion.user.rol }})</small></span>
        <button class="btn btn-secondary" @click="salir">Cerrar sesión</button>
      </template>
      <template v-else>
        <button class="btn btn-secondary" @click="$router.push('/login')">Iniciar Sesión</button>
        <button class="btn btn-primary" @click="$router.push('/registro')">Crear cuenta</button>
      </template>
    </div>
  </nav>
</template>

<script>
import { sesion, cerrarSesion } from '../services/auth'

export default {
  name: 'NavbarComponent',
  data() {
    return { sesion }
  },
  methods: {
    salir() {
      cerrarSesion()
      this.$router.push('/')
    }
  }
}
</script>

<style scoped>
.navbar {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 1.2rem 4rem;
  background: #ffffff;
  box-shadow: 0 2px 10px rgba(0, 0, 0, 0.05);
}

.logo {
  display: flex;
  align-items: center;
  gap: 0.5rem;
  font-size: 1.5rem;
  font-weight: 800;
  color: #0284c7;
  text-decoration: none;
}

.usuario {
  align-self: center;
  color: #334155;
  font-weight: 600;
}
.usuario small { color: #94a3b8; font-weight: 400; }

.nav-links a.router-link-exact-active {
  color: #0284c7;
}

.nav-links {
  display: flex;
  gap: 2rem;
}

.nav-links a {
  text-decoration: none;
  color: #64748b;
  font-weight: 500;
  transition: color 0.2s;
}

.nav-links a:hover {
  color: #0284c7;
}

.nav-actions {
  display: flex;
  gap: 1rem;
}

.btn {
  padding: 0.6rem 1.2rem;
  border-radius: 8px;
  border: none;
  font-weight: 600;
  cursor: pointer;
  transition: all 0.2s;
}

.btn-primary {
  background-color: #0284c7;
  color: white;
}

.btn-primary:hover {
  background-color: #0369a1;
}

.btn-secondary {
  background-color: #e2e8f0;
  color: #334155;
}

.btn-secondary:hover {
  background-color: #cbd5e1;
}
</style>