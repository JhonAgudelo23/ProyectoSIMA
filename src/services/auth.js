import { reactive } from 'vue'

function obtenerUsuarioGuardado() {
  try {
    const raw = localStorage.getItem('user')
    return raw ? JSON.parse(raw) : null
  } catch (e) {
    return null
  }
}

export const sesion = reactive({
  token: localStorage.getItem('token') || null,
  user: obtenerUsuarioGuardado()
})

export function iniciarSesion(token, user) {
  localStorage.setItem('token', token)
  localStorage.setItem('user', JSON.stringify(user))
  sesion.token = token
  sesion.user = user
}

export function cerrarSesion() {
  localStorage.removeItem('token')
  localStorage.removeItem('user')
  sesion.token = null
  sesion.user = null
}