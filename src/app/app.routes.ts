import { Routes } from '@angular/router';

export const routes: Routes = [
    {
        path: '',
        loadComponent: () => import('./features/landing/landing').then(m => m.Landing)
    },
    {
        path: 'login',
        loadComponent: () => import('./features/auth/login/login').then(m => m.Login)
    },
    {
        path: 'admin',
        loadComponent: () => import('./features/home/admin-home/admin-home').then(m => m.AdminHome)
    },
    {
        path: 'docente',
        loadComponent: () => import('./features/home/docente-home/docente-home').then(m => m.DocenteHome)
    },
    {
        path: 'asistencia',
        loadComponent: () => import('./features/attendance-conduct/attendance-conduct').then(m => m.AttendanceConduct)
    },
    {
        path: 'estudiante',
        loadComponent: () => import('./features/home/estudiante-home/estudiante-home').then(m => m.EstudianteHome)
    }
];
