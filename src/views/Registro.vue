<template>
  <div class="pagina">
    <NavbarComponent></NavbarComponent>
    <main class="centro">
      <AuthFormComponent modo="registro"></AuthFormComponent>
    </main>
    <FooterComponent></FooterComponent>
  </div>
</template>

<script>
import AuthFormComponent from '../components/AuthFormComponent.vue'

export default {
  name: 'Registro',
  components: { AuthFormComponent }
}
</script>

<style scoped>
.pagina { min-height: 100vh; display: flex; flex-direction: column; background: #f1f5f9; font-family: Arial, sans-serif; }
.centro { flex: 1; display: flex; justify-content: center; align-items: center; padding: 2rem; }
</style>