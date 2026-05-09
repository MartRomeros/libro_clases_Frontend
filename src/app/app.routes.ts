import { Routes } from '@angular/router';
import { authGuard } from './core/guards/auth.guard';

export const routes: Routes = [
  {
    path: '',
    loadComponent: () => import('./features/landing/pages/landing.page.component/landing.page.component').then(m => m.LandingPageComponent)
  },
  {
    path: 'auth',
    loadChildren: () => import('./features/auth/auth.routes').then(m => m.AUTH_ROUTES)
  },
  {
    path: 'admin',
    loadChildren: () => import('./features/admin/admin.routes').then(m => m.ADMIN_ROUTES),
    canActivate: [authGuard],
    data: { roles: ['Administrador'] }
  },
  {
    path: 'docente',
    loadChildren: () => import('./features/docente/docente.routes').then(m => m.AUTH_ROUTES),
    canActivate: [authGuard],
    data: { roles: ['Docente'] }
  },
  {
    path: 'estudiante',
    loadChildren: () => import('./features/estudiante/estudiante.routes').then(m => m.ESTUDIANTE_ROUTES),
    canActivate: [authGuard],
    data: { roles: ['Estudiante'] }
  },
  {
    path: 'comunicaciones',
    loadChildren: () => import('./features/comunicaciones/comunicaciones.routes').then(m => m.COMUNICACIONES_ROUTES),
    canActivate: [authGuard]
  },
  {
    path: 'perfil',
    loadComponent: () => import('./shared/components/user-profile/user-profile').then(m => m.UserProfileComponent),
    canActivate: [authGuard]
  },
  {
    path: 'no-access',
    loadComponent: () => import('./shared/pages/no-access.page.component/no-access.page.component').then(m => m.NoAccessPageComponent)
  }
];
