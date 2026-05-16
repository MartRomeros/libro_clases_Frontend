import { Routes } from '@angular/router';

export const AUTH_ROUTES: Routes = [
  {
    path: '',
    loadComponent: () =>
      import('./pages/docente.page.component/docente.page.component').then(
        (m) => m.DocentePageComponent,
      ),
  },
  {
    path: 'asistencia',
    loadComponent: () =>
      import('./pages/attendance.page.component/attendance.page.component').then(
        (m) => m.AttendancePageComponent,
      ),
  },
  {
    path: 'evaluaciones',
    loadComponent: () =>
      import('./pages/evaluations.page.component/evaluations.page.component').then(
        (m) => m.EvaluationsPageComponent,
      ),
  },
  {
    path: 'cursos',
    loadComponent: () =>
      import('./pages/cursos.page.component/cursos.page.component').then(
        (m) => m.CursosPageComponent,
      ),
  },
];
