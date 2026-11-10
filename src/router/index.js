import { createRouter, createWebHistory } from 'vue-router'
import Principal from '../views/Principal.vue'
import Login from '../views/Login.vue'
import Registro from '../views/Registro.vue'
import Reportar from '../views/Reportar.vue'
import Panel from '../views/Panel.vue'
import Caracteristicas from '../views/Caracteristicas.vue'
import Proyecto from '../views/Proyecto.vue'
import Contacto from '../views/Contacto.vue'
import { sesion } from '../services/auth'

const routes = [
  { path: '/', name: 'principal', component: Principal },
  { path: '/caracteristicas', name: 'caracteristicas', component: Caracteristicas },
  { path: '/proyecto', name: 'proyecto', component: Proyecto },
  { path: '/contacto', name: 'contacto', component: Contacto },
  { path: '/login', name: 'login', component: Login },
  { path: '/registro', name: 'registro', component: Registro },
  {
    path: '/reportar',
    name: 'reportar',
    component: Reportar,
    meta: { requiereSesion: true, soloCiudadano: true }
  },
  {
    path: '/panel',
    name: 'panel',
    component: Panel,
    meta: { requiereSesion: true, soloPersonal: true }
  }
]

const router = createRouter({
  history: createWebHistory(process.env.BASE_URL),
  routes,
  scrollBehavior(to) {
    if (to.hash) return { el: to.hash, behavior: 'smooth' }
    return { top: 0 }
  }
})

// Guardia de navegación
router.beforeEach((to, from, next) => {
  const usuario = sesion.user

  // 1. Si la ruta requiere sesión y el usuario no está autenticado -> Ir a Login
  if (to.meta.requiereSesion && !usuario) {
    return next('/login')
  }

  // 2. Si un Operario/Técnico intenta entrar a la vista de reportes ciudadanos -> Redirigir a Panel
  if (to.meta.soloCiudadano && usuario && (usuario.rol === 'operario' || usuario.rol === 'tecnico')) {
    return next('/panel')
  }

  // 3. Si un Ciudadano intenta acceder al Panel Vivo -> Redirigir a vista de Reportar
  if (to.meta.soloPersonal && usuario && usuario.rol === 'ciudadano') {
    return next('/reportar')
  }

  // 4. Si el usuario ya tiene sesión e intenta entrar a Login o Registro -> Redirigir según su rol
  if ((to.path === '/login' || to.path === '/registro') && usuario) {
    return next(usuario.rol === 'ciudadano' ? '/reportar' : '/panel')
  }

  next()
})

export default router