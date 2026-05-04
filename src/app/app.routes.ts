import { Routes } from '@angular/router';
import { authGuard } from './core/guards/auth.guard';

export const routes: Routes = [
  {
    path:'',
    redirectTo:'login',
    pathMatch:'full'
  },
  {
    path: 'auth',
    loadChildren: ()=> import('./features/auth/auth.routes').then(m => m.AUTH_ROUTES)
  },
  {
    path: 'admin',
    loadChildren: () => import('./features/admin/admin.routes').then(m => m.ADMIN_ROUTES),
    canActivate: [authGuard]
  },
  {
    path: 'docente',
    loadChildren: ()=> import('./features/docente/docente.routes').then(m=> m.AUTH_ROUTES),
    canActivate: [authGuard]
  },
  {
    path: 'estudiante',
    loadChildren: () => import('./features/estudiante/estudiante.routes').then(m => m.ESTUDIANTE_ROUTES),
    canActivate: [authGuard]
  },
  {
    path: 'perfil',
    loadComponent: () => import('./shared/components/user-profile/user-profile').then(m => m.UserProfileComponent)
  }
];
