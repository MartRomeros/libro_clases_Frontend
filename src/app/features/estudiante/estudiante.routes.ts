import { Routes } from '@angular/router';

export const ESTUDIANTE_ROUTES: Routes = [
  {
    path: '',
    loadComponent: () =>
      import('./pages/estudiante-home.page.component/estudiante-home.page.component').then(
        (m) => m.EstudianteHomePageComponent
      ),
  },
  {
    path: 'notas',
    loadComponent: () =>
      import('./pages/grades.page.component/grades.page.component').then(
        (m) => m.GradesPageComponent
      ),
  },
  {
    path: 'asistencia',
    loadComponent: () =>
      import('./pages/attendance.page.component/attendance.page.component').then(
        (m) => m.AttendancePageComponent
      ),
  },
  {
    path: 'recursos',
    loadComponent: () =>
      import('./pages/resources.page.component/resources.page.component').then(
        (m) => m.ResourcesPageComponent
      ),
  },
];
