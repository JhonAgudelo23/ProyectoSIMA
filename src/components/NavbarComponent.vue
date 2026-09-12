<template>
  <nav class="navbar">
    <div class="logo">
      <span class="logo-text">SIMA</span>
    </div>
    <div class="nav-links">
      <a href="#inicio">Inicio</a>
      <a href="#caracteristicas">Características</a>
      <a href="#nosotros">Proyecto</a>
      <a href="#contacto">Contacto</a>
    </div>
    <div class="nav-actions">
      <button class="btn btn-secondary">Iniciar Sesión</button>
      <button class="btn btn-primary">Ingresar al Sistema</button>
    </div>
  </nav>
</template>

<script>
export default {
  name: 'NavbarComponent'
};
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
