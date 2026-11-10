<template>
  <nav class="navbar-cyber">
    <div class="nav-brand">
      <router-link to="/" class="brand-link">
        <span class="logo-icon">📡</span>
        <span class="logo-text">SIMA</span>
      </router-link>
    </div>

    <!-- Links principales: Ocultos para el Operario para mantener su interfaz limpia -->
    <div class="nav-links" v-if="!esOperario">
      <router-link to="/" class="nav-link" active-class="active-link">Inicio</router-link>
      <router-link to="/caracteristicas" class="nav-link" active-class="active-link">Características</router-link>
      <router-link to="/proyecto" class="nav-link" active-class="active-link">Proyecto</router-link>
      <router-link to="/contacto" class="nav-link" active-class="active-link">Contacto</router-link>
    </div>

    <!-- Módulos específicos por Rol -->
    <div class="nav-actions">
      <!-- Exclusivo para Ciudadano: Botón Reportar -->
      <router-link v-if="esCiudadano" to="/reportar" class="btn-action btn-reportar">
        📢 Reportar Falla
      </router-link>

      <!-- Exclusivo para Operario y Admin: Botón Panel Vivo -->
      <router-link v-if="esPersonal" to="/panel" class="btn-action btn-panel">
        ⚡ Panel Vivo
      </router-link>

      <!-- Bloque de Sesión / Usuario -->
      <div class="nav-user" v-if="sesion?.user">
        <span class="user-badge" :class="sesion.user.rol">
          👤 {{ sesion.user.nombre }} <small>({{ sesion.user.rol.toUpperCase() }})</small>
        </span>
        <button @click="salir" class="btn-logout">Cerrar sesión</button>
      </div>

      <div class="nav-user" v-else>
        <router-link to="/login" class="btn-login">Iniciar Sesión</router-link>
        <router-link to="/registro" class="btn-registro">Registrarse</router-link>
      </div>
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
  computed: {
    esCiudadano() {
      return this.sesion?.user?.rol === 'ciudadano'
    },
    esOperario() {
      return this.sesion?.user?.rol === 'operario' || this.sesion?.user?.rol === 'tecnico'
    },
    esPersonal() {
      const rol = this.sesion?.user?.rol
      return rol === 'admin' || rol === 'operario' || rol === 'tecnico'
    }
  },
  methods: {
    async salir() {
      cerrarSesion()
      // Redirigir inmediatamente al login y limpiar historial
      if (this.$route.path !== '/login') {
        await this.$router.push('/login')
      }
    }
  }
}
</script>

<style scoped>
.navbar-cyber {
  background: #090d16;
  border-bottom: 1px solid #1e293b;
  padding: 0.8rem 2rem;
  display: flex;
  justify-content: space-between;
  align-items: center;
  position: sticky;
  top: 0;
  z-index: 1000;
  box-shadow: 0 4px 20px rgba(0, 0, 0, 0.6);
}

.brand-link {
  display: flex;
  align-items: center;
  gap: 10px;
  text-decoration: none;
}

.logo-icon {
  font-size: 1.5rem;
}

.logo-text {
  font-size: 1.6rem;
  font-weight: 800;
  color: #38bdf8;
  letter-spacing: 1px;
}

.nav-links {
  display: flex;
  align-items: center;
  gap: 1.5rem;
}

.nav-link {
  color: #94a3b8;
  text-decoration: none;
  font-weight: 500;
  font-size: 0.9rem;
  transition: color 0.2s;
}

.nav-link:hover,
.active-link {
  color: #38bdf8;
}

.nav-actions {
  display: flex;
  align-items: center;
  gap: 1.2rem;
}

.btn-action {
  text-decoration: none;
  font-size: 0.85rem;
  font-weight: 600;
  padding: 7px 14px;
  border-radius: 99px;
  transition: all 0.2s;
}

.btn-reportar {
  background: rgba(239, 68, 68, 0.15);
  color: #f87171;
  border: 1px solid #ef4444;
}

.btn-reportar:hover {
  background: rgba(239, 68, 68, 0.3);
}

.btn-panel {
  background: rgba(56, 189, 248, 0.15);
  color: #38bdf8;
  border: 1px solid #0284c7;
}

.btn-panel:hover {
  background: rgba(56, 189, 248, 0.3);
}

.nav-user {
  display: flex;
  align-items: center;
  gap: 1rem;
}

.user-badge {
  font-size: 0.85rem;
  color: #e2e8f0;
  background: #1e293b;
  padding: 5px 12px;
  border-radius: 6px;
  border: 1px solid #334155;
}

.user-badge small {
  color: #38bdf8;
  font-weight: 700;
}

.btn-logout {
  background: rgba(239, 68, 68, 0.15);
  color: #fca5a5;
  border: 1px solid #ef4444;
  padding: 6px 12px;
  border-radius: 6px;
  font-size: 0.8rem;
  cursor: pointer;
}

.btn-logout:hover {
  background: #ef4444;
  color: #fff;
}

.btn-login {
  background: #0284c7;
  color: #fff;
  padding: 7px 16px;
  border-radius: 6px;
  text-decoration: none;
  font-size: 0.85rem;
  font-weight: 600;
}

.btn-registro {
  background: transparent;
  color: #38bdf8;
  border: 1px solid #0284c7;
  padding: 7px 16px;
  border-radius: 6px;
  text-decoration: none;
  font-size: 0.85rem;
  font-weight: 600;
}
</style>