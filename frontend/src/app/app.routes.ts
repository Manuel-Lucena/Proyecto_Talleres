import { Routes } from '@angular/router';
import { Landing } from './pages/landing/landing';
import { Login } from './pages/login/login';
import { PanelAdmin } from './pages/panel-admin/panel-admin';
import { Perfil } from './pages/perfil/perfil';
import { TalleresExplorar } from './pages/talleres-explorar/talleres-explorar';
import { MisTalleres } from './pages/mis-talleres/mis-talleres';

export const routes: Routes = [
    { path: '', redirectTo: '/landing', pathMatch: 'full' },
    { path: 'landing', component: Landing },
    { path: 'login', component: Login },
    { path: 'perfil', component: Perfil },
    { path: 'panel-admin', component: PanelAdmin },
    { path: 'talleres-explorar', component: TalleresExplorar },
    { path: 'mis-talleres', component: MisTalleres }
];
