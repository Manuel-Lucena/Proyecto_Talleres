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
            { path: '', redirectTo: 'talleres', pathMatch: 'full' }, // Al entrar al panel, vemos talleres por defecto
            {
                path: 'talleres',
                loadComponent: () => import('./pages/panel-admin/tabs/admin-talleres/admin-talleres').then(m => m.AdminTalleres)
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
            { path: 'muro', component: AulaMuro },
            { path: 'foro', component: AulaForo },
            { path: 'tareas', component: AulaTareas },
            { path: 'recursos', component: AulaMateriales },
            { path: 'participantes', component: AulaParticipantes },
            {
                path: 'tareas/:idRecurso/seguimiento',
                loadComponent: () => import('./pages/aula-virtual/tabs/aula-tarea-seguimiento/aula-tarea-seguimiento').then(m => m.AulaTareaSeguimiento)
            },
            {
                path: 'detalle/:tipo/nuevo',
                loadComponent: () => import('./pages/aula-virtual/tabs/aula-detalle/aula-detalle').then(m => m.AulaDetalle)
            },
            {
                path: 'detalle/:tipo/:idRecurso',
                loadComponent: () => import('./pages/aula-virtual/tabs/aula-detalle/aula-detalle').then(m => m.AulaDetalle)
            }
        ]
    }
];
