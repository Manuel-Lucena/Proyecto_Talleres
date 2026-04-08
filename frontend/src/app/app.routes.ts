import { Routes } from '@angular/router';
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

export const routes: Routes = [
    { path: '', redirectTo: '/landing', pathMatch: 'full' },
    { path: 'landing', component: Landing },
    { path: 'login', component: Login },
    { path: 'perfil', component: Perfil },
    {
        path: 'panel-admin',
        component: PanelAdmin,
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
    { path: 'talleres-explorar', component: TalleresExplorar },
    { path: 'mis-talleres', component: MisTalleres },
    { path: 'calendario', component: Calendario },
    {
        path: 'aula-virtual/:id',
        component: AulaVirtual,
        children: [
            { path: '', redirectTo: 'muro', pathMatch: 'full' },
            { path: 'muro', component: AulaMuro, data: { breadcrumb: 'Muro' } },
            { path: 'foro', component: AulaForo, data: { breadcrumb: 'Foro' } },
            { path: 'tareas', component: AulaTareas, data: { breadcrumb: 'Tareas' } },
            { path: 'recursos', component: AulaMateriales, data: { breadcrumb: 'Materiales' } },
            { path: 'participantes', component: AulaParticipantes, data: { breadcrumb: 'Participantes' } },
            {
                path: 'tareas/:idRecurso/seguimiento',
                data: { breadcrumb: 'Seguimiento' },
                loadComponent: () => import('./pages/aula-virtual/tabs/aula-tarea-seguimiento/aula-tarea-seguimiento').then(m => m.AulaTareaSeguimiento)
            },
            {
                path: 'detalle/:tipo/nuevo',
                data: { breadcrumb: 'Nuevo' },
                loadComponent: () => import('./pages/aula-virtual/tabs/aula-detalle/aula-detalle').then(m => m.AulaDetalle)
            },
            {
                path: 'detalle/:tipo/:idRecurso',
                data: { breadcrumb: '' },
                loadComponent: () => import('./pages/aula-virtual/tabs/aula-detalle/aula-detalle').then(m => m.AulaDetalle)
            }
        ]
    }
];
