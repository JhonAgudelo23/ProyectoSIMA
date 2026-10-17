import { createRouter, createWebHistory } from 'vue-router'
import Principal from '../views/Principal.vue'
import Login from '../views/Login.vue'
import Registro from '../views/Registro.vue'
// PASO 5: quita las // de la siguiente línea
import Reportar from '../views/Reportar.vue'
// PASO 6: quita las // de la siguiente línea
import Panel from '../views/Panel.vue'
import { sesion } from '../services/auth'

const routes = [
  { path: '/', name: 'principal', component: Principal },
  { path: '/login', name: 'login', component: Login },
  { path: '/registro', name: 'registro', component: Registro },
  // PASO 5: quita las // de la siguiente línea
  { path: '/reportar', name: 'reportar', component: Reportar, meta: { requiereSesion: true } },
  // PASO 6: quita las // de la siguiente línea
  { path: '/panel', name: 'panel', component: Panel, meta: { requiereSesion: true, soloPersonal: true } }
]

const router = createRouter({
  history: createWebHistory(process.env.BASE_URL),
  routes,
  // Para que los enlaces del navbar (#caracteristicas, etc.) bajen suave a la sección
  scrollBehavior(to) {
    if (to.hash && document.querySelector(to.hash)) return { el: to.hash, behavior: 'smooth' }
    return { top: 0 }
  }
})

// Protección de rutas
router.beforeEach(to => {
  if (to.meta.requiereSesion && !sesion.user) return '/login'
  if (to.meta.soloPersonal && sesion.user.rol === 'ciudadano') return '/reportar'
  if ((to.path === '/login' || to.path === '/registro') && sesion.user) {
    return sesion.user.rol === 'ciudadano' ? '/reportar' : '/panel'
  }
})

export default router
