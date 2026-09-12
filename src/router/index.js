import { createRouter, createWebHistory } from 'vue-router'
import Principal from '../views/Principal.vue'

const routes = [
  {
    path: '/',
    name: 'principal',
    component: Principal
  }
]

const router = createRouter({
  history: createWebHistory(process.env.BASE_URL),
  routes
})

export default router
