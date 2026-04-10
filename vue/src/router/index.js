import { createRouter, createWebHistory } from 'vue-router'
import { useAuthStore } from '@/stores/auth'

const routes = [
  {
    path: '/login',
    name: 'login',
    component: () => import('@/views/LoginView.vue'),
    meta: { public: true },
  },
  {
    path: '/',
    component: () => import('@/layouts/AppLayout.vue'),
    children: [
      { path: '',         name: 'dashboard', component: () => import('@/views/DashboardView.vue') },
      { path: 'agenda',   name: 'agenda',    component: () => import('@/views/AgendaView.vue') },
      { path: 'pacientes',              name: 'pacientes',        component: () => import('@/views/PacientesView.vue') },
      { path: 'pacientes/nuevo',        name: 'paciente-nuevo',   component: () => import('@/views/PacienteFormView.vue') },
      { path: 'pacientes/:id/informe',  name: 'paciente-informe', component: () => import('@/views/PacienteInformeView.vue') },
      { path: 'pacientes/:id',          name: 'paciente-detalle', component: () => import('@/views/PacienteDetalleView.vue') },
      { path: 'pacientes/:id/editar',   name: 'paciente-editar',  component: () => import('@/views/PacienteFormView.vue') },
      { path: 'sesiones',               name: 'sesiones',         component: () => import('@/views/SesionesView.vue') },
      { path: 'sesiones/nueva',         name: 'sesion-nueva',     component: () => import('@/views/SesionFormView.vue') },
      { path: 'sesiones/:id/editar',    name: 'sesion-editar',    component: () => import('@/views/SesionFormView.vue') },
      { path: 'sesiones/:id',           name: 'sesion-detalle',   component: () => import('@/views/SesionDetalleView.vue') },
      { path: 'citas/nueva',            name: 'cita-nueva',       component: () => import('@/views/CitaFormView.vue') },
      { path: 'citas/:id',              name: 'cita-detalle',     component: () => import('@/views/CitaDetalleView.vue') },
      { path: 'festivos',               name: 'festivos',         component: () => import('@/views/FestivosView.vue') },
      { path: 'pendientes',             name: 'pendientes',       component: () => import('@/views/PendientesReprogramarView.vue') },
    ],
  },
]

const router = createRouter({
  history: createWebHistory(),
  routes,
})

// Guard: redirigir a login si no hay token
router.beforeEach((to) => {
  const auth = useAuthStore()
  if (!to.meta.public && !auth.token) {
    return { name: 'login' }
  }
})

export default router
