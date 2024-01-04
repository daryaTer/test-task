import { Routes } from '@angular/router';

export const routes: Routes = [
    { path: "", redirectTo: '/tasks', pathMatch: 'full' },
    { path: 'tasks', loadComponent: () => import('./pages/task-list/task-list.component').then(mod => mod.TaskListComponent) },
    { path: 'auth', loadComponent: () => import('./pages/auth/auth.component').then(mod => mod.AuthComponent) },
];
