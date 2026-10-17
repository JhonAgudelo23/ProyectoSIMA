import { reactive } from 'vue'

// Estado de sesión compartido por toda la app
const guardado = JSON.parse(localStorage.getItem('sima_sesion') || 'null')

export const sesion = reactive({
  token: guardado ? guardado.token : null,
  user: guardado ? guardado.user : null
})

export function iniciarSesion(token, user) {
  sesion.token = token
  sesion.user = user
  localStorage.setItem('sima_sesion', JSON.stringify({ token, user }))
}

export function cerrarSesion() {
  sesion.token = null
  sesion.user = null
  localStorage.removeItem('sima_sesion')
}

export const esPersonal = () => sesion.user && sesion.user.rol !== 'ciudadano'
