import { Injectable, inject } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { firstValueFrom } from 'rxjs';
import {
  queryOptions,
  mutationOptions,
  injectQueryClient,
} from '@tanstack/angular-query-experimental';
import { environment } from '../../../environments/environment';

export interface NotaPost {
  notaId?: number;
  evaluacionId: number;
  estudianteId: number;
  valor: number;
}

export interface AsistenciaPost {
  estudianteId: number;
  cursoId: number;
  fecha: string;
  estado: string;
  tipoAsistencia: string;
}

export interface AnotacionPost {
  estudianteId: number;
  docenteId: number;
  tipo: string;
  descripcion: string;
  fechaRegistro: string;
}

@Injectable({
  providedIn: 'root'
})
export class DocenteService {
  private http = inject(HttpClient);
  private queryClient = injectQueryClient();
  private apiUrl = `${environment.backGestionUrl}`;

  getAnotacionesPorEstudianteOptions(estudianteId: number) {
    return queryOptions({
      queryKey: ['anotaciones-estudiante', estudianteId],
      queryFn: () =>
        firstValueFrom(
          this.http.get<any[]>(`${this.apiUrl}/anotaciones/estudiante/${estudianteId}`)
        ),
    });
  }

  getNotasEstudianteOptions(estudianteId: number) {
    return queryOptions({
      queryKey: ['notas-estudiante', estudianteId],
      queryFn: () =>
        firstValueFrom(
          this.http.get<any[]>(`${this.apiUrl}/notas/estudiante/${estudianteId}`)
        ),
    });
  }

  guardarNotaOptions() {
    return mutationOptions({
      mutationKey: ['guardar-nota'],
      mutationFn: (nota: NotaPost) =>
        firstValueFrom(
          this.http.post(`${this.apiUrl}/notas`, nota)
        ),
      onSuccess: () => {
        this.queryClient.invalidateQueries({ queryKey: ['notas-curso-asignatura'] });
        this.queryClient.invalidateQueries({ queryKey: ['notas-estudiante'] });
      },
    });
  }

  guardarNotasBulkOptions() {
    return mutationOptions({
      mutationKey: ['guardar-notas-bulk'],
      mutationFn: (notas: NotaPost[]) =>
        firstValueFrom(
          this.http.post<any[]>(`${this.apiUrl}/notas/bulk`, notas)
        ),
      onSuccess: () => {
        this.queryClient.invalidateQueries({ queryKey: ['notas-curso-asignatura'] });
        this.queryClient.invalidateQueries({ queryKey: ['notas-estudiante'] });
      },
    });
  }

  guardarAsistenciasOptions() {
    return mutationOptions({
      mutationKey: ['guardar-asistencias'],
      mutationFn: (asistencias: AsistenciaPost[]) =>
        firstValueFrom(
          this.http.post(`${this.apiUrl}/asistencias/bulk`, asistencias)
        ),
      onSuccess: () => {
        this.queryClient.invalidateQueries({ queryKey: ['asistencias-curso'] });
        this.queryClient.invalidateQueries({ queryKey: ['asistencia-estudiante'] });
      },
    });
  }

  guardarAnotacionOptions() {
    return mutationOptions({
      mutationKey: ['guardar-anotacion'],
      mutationFn: (anotacion: AnotacionPost) =>
        firstValueFrom(
          this.http.post(`${this.apiUrl}/anotaciones`, anotacion)
        ),
      onSuccess: () => {
        this.queryClient.invalidateQueries({ queryKey: ['anotaciones-estudiante'] });
      },
    });
  }
}