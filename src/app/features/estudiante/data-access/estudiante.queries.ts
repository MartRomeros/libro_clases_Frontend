import { inject, Injectable } from '@angular/core';
import { queryOptions } from '@tanstack/angular-query-experimental';
import { EstudianteApi } from './estudiante.api';
import { estudianteKeys } from './estudiante.keys';

@Injectable({
  providedIn: 'root'
})
export class EstudianteQueries {
  private readonly api = inject(EstudianteApi);

  notas(estudianteId: number) {
    return queryOptions({
      queryKey: estudianteKeys.notas(estudianteId),
      queryFn: () => this.api.getNotas(estudianteId),
      enabled: !!estudianteId,
    });
  }

  asistencia(estudianteId: number) {
    return queryOptions({
      queryKey: estudianteKeys.asistencia(estudianteId),
      queryFn: () => this.api.getAsistencias(estudianteId),
      enabled: !!estudianteId,
    });
  }
}
