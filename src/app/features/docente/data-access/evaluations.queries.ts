import { inject, Injectable } from '@angular/core';
import { queryOptions } from '@tanstack/angular-query-experimental';
import { EvaluationsApi } from './evaluations.api';
import { evaluationsKeys } from './evaluations.keys';

@Injectable({
  providedIn: 'root'
})
export class EvaluationsQueries {
  private readonly api = inject(EvaluationsApi);

  cursosDocente(docenteId: number) {
    return queryOptions({
      queryKey: evaluationsKeys.cursosByDocente(docenteId),
      queryFn: () => this.api.getCursos(docenteId),
      enabled: !!docenteId,
    });
  }

  estudiantesCurso(cursoId: number) {
    return queryOptions({
      queryKey: evaluationsKeys.estudiantesByCurso(cursoId),
      queryFn: () => this.api.getEstudiantesPorCurso(cursoId),
      enabled: !!cursoId,
    });
  }

  evaluacionesCad(cadId: number) {
    return queryOptions({
      queryKey: evaluationsKeys.evaluacionesByCad(cadId),
      queryFn: () => this.api.getEvaluacionesPorCad(cadId),
      enabled: !!cadId,
    });
  }

  notasCursoAsignatura(cursoId: number, asignaturaId: number) {
    return queryOptions({
      queryKey: evaluationsKeys.notasByCursoAsignatura(cursoId, asignaturaId),
      queryFn: () => this.api.getNotasPorCursoAsignatura(cursoId, asignaturaId),
      enabled: !!cursoId && !!asignaturaId,
    });
  }
}
