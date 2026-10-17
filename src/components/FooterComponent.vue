<template>
  <footer class="footer">
    <div class="footer-content">
      <div class="footer-brand">
        <h3>SIMA</h3>
        <p>Soluciones inteligentes para la gestión de aguas urbanas.</p>
      </div>
      <div class="footer-buttons">
        <button class="btn btn-secondary" @click="$router.push('/reportar')">Reportar Incidencia</button>
        <button class="btn btn-primary" @click="$router.push({ path: '/', hash: '#contacto' })">Soporte Técnico</button>
      </div>
    </div>
    <div class="footer-bottom">
      <p>2026 SIMA - Todos los derechos reservados.</p>
    </div>
  </footer>
</template>

<script>
export default {
  name: 'FooterComponent'
};
</script>

<style scoped>
.footer {
  background: #0f172a;
  color: white;
  padding: 3rem 4rem 1.5rem;
}

.footer-content {
  display: flex;
  justify-content: space-between;
  align-items: center;
  border-bottom: 1px solid #334155;
  padding-bottom: 2rem;
}

.footer-brand p {
  color: #94a3b8;
  margin-top: 0.5rem;
}

.footer-buttons {
  display: flex;
  gap: 1rem;
}

.btn {
  padding: 0.6rem 1.2rem;
  border-radius: 8px;
  border: none;
  font-weight: 600;
  cursor: pointer;
}

.btn-primary {
  background-color: #0284c7;
  color: white;
}

.btn-secondary {
  background-color: #334155;
  color: white;
}

.footer-bottom {
  text-align: center;
  padding-top: 1.5rem;
  color: #64748b;
  font-size: 0.85rem;
}
</style>
