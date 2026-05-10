import { Routes } from '@angular/router';
import { authGuard } from './guards/AuthGuard';

export const routes: Routes = [
  // --- RUTAS PÚBLICAS ---
  { path: '', redirectTo: '/landing', pathMatch: 'full' },
  { path: 'landing', loadComponent: () => import('./pages/landing/landing').then(m => m.Landing) },
  { path: 'login', loadComponent: () => import('./pages/login/login').then(m => m.Login) },
  {
    path: 'noticia/:id',
    loadComponent: () => import('./pages/noticia-detalle/noticia-detalle').then(m => m.NoticiaDetalle)
  },
  {
    path: 'talleres-explorar',
    loadComponent: () => import('./pages/talleres-explorar/talleres-explorar').then(m => m.TalleresExplorar)
  },
  {
    path: 'no-autorizado',
    loadComponent: () => import('./pages/acceso-denegado/acceso-denegado').then(m => m.AccesoDenegado)
  },
  {
    path: 'solicitar-recuperacion',
    loadComponent: () => import('./pages/solicitar-recuperacion/solicitar-recuperacion').then(m => m.SolicitarRecuperacion)
  },
  {
    path: 'reset-password',
    loadComponent: () => import('./pages/cambiar-password/cambiar-password').then(m => m.CambiarPassword)
  },

  // --- RUTAS PROTEGIDAS ---
  {
    path: 'perfil',
    canActivate: [authGuard],
    loadComponent: () => import('./pages/perfil/perfil').then(m => m.Perfil)
  },
  {
    path: 'mis-talleres',
    canActivate: [authGuard],
    loadComponent: () => import('./pages/mis-talleres/mis-talleres').then(m => m.MisTalleres)
  },

  {
    path: 'calendario',
    canActivate: [authGuard],
    loadComponent: () => import('./pages/calendario/calendario').then(m => m.Calendario),
    children: [
      { path: '', redirectTo: 'talleres', pathMatch: 'full' },
      { path: 'talleres', loadComponent: () => import('./pages/calendario/tabs/calendario-talleres/calendario-talleres').then(m => m.CalendarioTalleres) },
      { path: 'tareas', loadComponent: () => import('./pages/calendario/tabs/calendario-tareas/calendario-tareas').then(m => m.CalendarioTareas) }
    ]
  },

  // --- RUTA PANEL ADMIN ---
  {
    path: 'panel-admin',
    canActivate: [authGuard],
    data: { roles: ['ADMIN'] },
    loadComponent: () => import('./pages/panel-admin/panel-admin').then(m => m.PanelAdmin),
    children: [
      { path: '', redirectTo: 'talleres', pathMatch: 'full' },
      { path: 'talleres', loadComponent: () => import('./pages/panel-admin/tabs/admin-talleres/admin-talleres').then(m => m.AdminTalleres) },
      { path: 'talleres/:idTaller/inscripciones', loadComponent: () => import('./pages/panel-admin/tabs/admin-inscripciones/admin-inscripciones').then(m => m.AdminInscripciones) },
      { path: 'usuarios/:idUsuario/inscripciones', loadComponent: () => import('./pages/panel-admin/tabs/admin-inscripciones/admin-inscripciones').then(m => m.AdminInscripciones) },
      { path: 'talleres/:id/horario', loadComponent: () => import('./pages/panel-admin/tabs/admin-horarios/admin-horarios').then(m => m.AdminHorarios) },
      { path: 'usuarios', loadComponent: () => import('./pages/panel-admin/tabs/admin-usuarios/admin-usuarios').then(m => m.AdminUsuarios) },
      { path: 'noticias', loadComponent: () => import('./pages/panel-admin/tabs/admin-noticias/admin-noticias').then(m => m.AdminNoticias) }
    ]
  },

  // --- RUTA AULA VIRTUAL ---
  {
    path: 'aula-virtual/:id',
    canActivate: [authGuard],
    loadComponent: () => import('./pages/aula-virtual/aula-virtual').then(m => m.AulaVirtual),
    children: [
      { path: '', redirectTo: 'muro', pathMatch: 'full' },
      { path: 'muro', loadComponent: () => import('./pages/aula-virtual/tabs/aula-muro/aula-muro').then(m => m.AulaMuro), data: { breadcrumb: 'Muro' } },
      { path: 'foro', loadComponent: () => import('./pages/aula-virtual/tabs/aula-foro/aula-foro').then(m => m.AulaForo), data: { breadcrumb: 'Foro' } },
      { path: 'tareas', loadComponent: () => import('./pages/aula-virtual/tabs/aula-tareas/aula-tareas').then(m => m.AulaTareas), data: { breadcrumb: 'Tareas' } },
      { path: 'recursos', loadComponent: () => import('./pages/aula-virtual/tabs/aula-materiales/aula-materiales').then(m => m.AulaMateriales), data: { breadcrumb: 'Materiales' } },
      { path: 'participantes', loadComponent: () => import('./pages/aula-virtual/tabs/aula-participantes/aula-participantes').then(m => m.AulaParticipantes), data: { breadcrumb: 'Participantes' } },

      {
        path: 'tareas/:idRecurso/seguimiento',
        canActivate: [authGuard],
        data: { roles: ['ADMIN', 'PROFESOR'], mode: 'TAREA' },
        loadComponent: () => import('./pages/aula-virtual/tabs/aula-tarea-seguimiento/aula-tarea-seguimiento').then(m => m.AulaTareaSeguimiento)
      },
      {
        path: 'detalle/:tipo/nuevo',
        canActivate: [authGuard],
        data: { roles: ['ADMIN', 'PROFESOR'], breadcrumb: 'Nuevo' },
        loadComponent: () => import('./pages/aula-virtual/tabs/aula-detalle/aula-detalle').then(m => m.AulaDetalle)
      },
      {
        path: 'detalle/:tipo/:idRecurso',
        canActivate: [authGuard],
        data: { breadcrumb: 'Cargando...' },
        loadComponent: () => import('./pages/aula-virtual/tabs/aula-detalle/aula-detalle').then(m => m.AulaDetalle)
      },
      {
        path: 'calificaciones',
        loadComponent: () => import('./pages/aula-virtual/tabs/aula-calificaciones/aula-calificaciones').then(m => m.AulaCalificaciones),
        data: { breadcrumb: 'Calificaciones' }
      },
      {
        path: 'seguimiento-alumno/:idRecurso',
        canActivate: [authGuard],
        data: { roles: ['ADMIN', 'PROFESOR'], mode: 'ALUMNO' }, 
        loadComponent: () => import('./pages/aula-virtual/tabs/aula-tarea-seguimiento/aula-tarea-seguimiento').then(m => m.AulaTareaSeguimiento)
      },
    ]
  },

  { path: '**', redirectTo: '/landing' }
];