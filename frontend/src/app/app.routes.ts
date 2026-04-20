import { Routes } from '@angular/router';
import { authGuard } from './guards/AuthGuard';

// Imports de componentes (Eager Loading para rutas principales)
import { Landing } from './pages/landing/landing';
import { Login } from './pages/login/login';
import { PanelAdmin } from './pages/panel-admin/panel-admin';
import { Perfil } from './pages/perfil/perfil';
import { TalleresExplorar } from './pages/talleres-explorar/talleres-explorar';
import { MisTalleres } from './pages/mis-talleres/mis-talleres';
import { Calendario } from './pages/calendario/calendario';
import { AulaVirtual } from './pages/aula-virtual/aula-virtual';
import { AulaMuro } from './pages/aula-virtual/tabs/aula-muro/aula-muro';
import { AulaForo } from './pages/aula-virtual/tabs/aula-foro/aula-foro';
import { AulaTareas } from './pages/aula-virtual/tabs/aula-tareas/aula-tareas';
import { AulaMateriales } from './pages/aula-virtual/tabs/aula-materiales/aula-materiales';
import { AulaParticipantes } from './pages/aula-virtual/tabs/aula-participantes/aula-participantes';
import { AccesoDenegado } from './pages/acceso-denegado/acceso-denegado';
import { SolicitarRecuperacion } from './pages/solicitar-recuperacion/solicitar-recuperacion';
import { CambiarPassword } from './pages/cambiar-password/cambiar-password';

export const routes: Routes = [
    // --- RUTAS PÚBLICAS ---
    { path: '', redirectTo: '/landing', pathMatch: 'full' },
    { path: 'landing', component: Landing },
    { path: 'login', component: Login },
    { path: 'no-autorizado', component: AccesoDenegado },
    { path: 'solicitar-recuperacion', component: SolicitarRecuperacion },
    { path: 'reset-password', component: CambiarPassword },

    // --- RUTAS PROTEGIDAS (Cualquier usuario logueado) ---
    { path: 'perfil', component: Perfil, canActivate: [authGuard] },
    { path: 'talleres-explorar', component: TalleresExplorar, canActivate: [authGuard] },
    { path: 'mis-talleres', component: MisTalleres, canActivate: [authGuard] },
    {
        path: 'calendario',
        component: Calendario,
        canActivate: [authGuard],
        children: [
            { path: '', redirectTo: 'talleres', pathMatch: 'full' },
            {
                path: 'talleres',
                loadComponent: () => import('./pages/calendario/tabs/calendario-talleres/calendario-talleres').then(m => m.CalendarioTalleres)
            },
            {
                path: 'tareas',
                loadComponent: () => import('./pages/calendario/tabs/calendario-tareas/calendario-tareas').then(m => m.CalendarioTareas)
            }
        ]
    },

    // --- RUTA PANEL ADMIN (Solo ADMIN) ---
    {
        path: 'panel-admin',
        component: PanelAdmin,
        canActivate: [authGuard],
        data: { roles: ['ADMIN'] },
        children: [
            { path: '', redirectTo: 'talleres', pathMatch: 'full' },
            {
                path: 'talleres',
                loadComponent: () => import('./pages/panel-admin/tabs/admin-talleres/admin-talleres').then(m => m.AdminTalleres)
            },
            {
                path: 'talleres/:idTaller/inscripciones',
                loadComponent: () => import('./pages/panel-admin/tabs/admin-inscripciones/admin-inscripciones').then(m => m.AdminInscripciones)
            },
            {
                path: 'usuarios/:idUsuario/inscripciones',
                loadComponent: () => import('./pages/panel-admin/tabs/admin-inscripciones/admin-inscripciones').then(m => m.AdminInscripciones)
            },
            {
                path: 'talleres/:id/horario',
                loadComponent: () => import('./pages/panel-admin/tabs/admin-horarios/admin-horarios').then(m => m.AdminHorarios)
            },
            {
                path: 'usuarios',
                loadComponent: () => import('./pages/panel-admin/tabs/admin-usuarios/admin-usuarios').then(m => m.AdminUsuarios)
            },
            {
                path: 'noticias',
                loadComponent: () => import('./pages/panel-admin/tabs/admin-noticias/admin-noticias').then(m => m.AdminNoticias)
            }
        ]
    },

    // --- RUTA AULA VIRTUAL (Acceso general + restricciones internas) ---
    {
        path: 'aula-virtual/:id',
        component: AulaVirtual,
        canActivate: [authGuard],
        children: [
            { path: '', redirectTo: 'muro', pathMatch: 'full' },
            { path: 'muro', component: AulaMuro, data: { breadcrumb: 'Muro' } },
            { path: 'foro', component: AulaForo, data: { breadcrumb: 'Foro' } },
            { path: 'tareas', component: AulaTareas, data: { breadcrumb: 'Tareas' } },
            { path: 'recursos', component: AulaMateriales, data: { breadcrumb: 'Materiales' } },
            { path: 'participantes', component: AulaParticipantes, data: { breadcrumb: 'Participantes' } },

            // Solo Profesores y Admins pueden ver seguimiento y crear contenido nuevo
            {
                path: 'tareas/:idRecurso/seguimiento',
                canActivate: [authGuard],
                data: { roles: ['ADMIN', 'PROFESOR'], breadcrumb: 'Seguimiento' },
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
            }
        ]
    },

    // Comodín para rutas no encontradas
    { path: '**', redirectTo: '/landing' }
];