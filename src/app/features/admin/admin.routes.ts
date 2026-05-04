import { Routes } from '@angular/router';

export const ADMIN_ROUTES: Routes = [
  {
    path: '',
    loadComponent: () =>
      import('./pages/admin-home.page.component/admin-home.page.component').then(
        (m) => m.AdminHomePageComponent
      ),
  },
  {
    path: 'usuarios',
    loadComponent: () =>
      import('./pages/user-management.page.component/user-management.page.component').then(
        (m) => m.UserManagementPageComponent
      ),
  },
];
