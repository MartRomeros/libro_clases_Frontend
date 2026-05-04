import { inject, Injectable } from '@angular/core';
import { queryOptions } from '@tanstack/angular-query-experimental';
import { AdminApi } from './admin.api';
import { adminKeys } from './admin.keys';

@Injectable({
  providedIn: 'root'
})
export class AdminQueries {
  private readonly api = inject(AdminApi);

  usuarios() {
    return queryOptions({
      queryKey: adminKeys.usuarios(),
      queryFn: () => this.api.getUsuarios(),
    });
  }

  docentes() {
    return queryOptions({
      queryKey: adminKeys.docentes(),
      queryFn: () => this.api.getDocentes(),
    });
  }

  estudiantes() {
    return queryOptions({
      queryKey: adminKeys.estudiantes(),
      queryFn: () => this.api.getEstudiantes(),
    });
  }

  cursos() {
    return queryOptions({
      queryKey: adminKeys.cursos(),
      queryFn: () => this.api.getCursos(),
    });
  }

  asignaturas() {
    return queryOptions({
      queryKey: adminKeys.asignaturas(),
      queryFn: () => this.api.getAsignaturas(),
    });
  }

  cads() {
    return queryOptions({
      queryKey: adminKeys.cads(),
      queryFn: () => this.api.getCads(),
    });
  }

  evaluacionesByCad(cadId: number) {
    return queryOptions({
      queryKey: adminKeys.evaluacionesByCad(cadId),
      queryFn: () => this.api.getEvaluacionesByCad(cadId),
      enabled: !!cadId,
    });
  }
}
