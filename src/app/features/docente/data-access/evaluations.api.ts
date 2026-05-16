import { inject, Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { firstValueFrom } from 'rxjs';
import { environment } from '../../../../environments/environment';
import {
  DocenteCurso,
  EstudianteCurso,
  Evaluacion,
  NotaRespuesta,
  NotaPost
} from '../models/evaluations.model';
import { Course, CoursesResponse } from '../models/curso.response.model';

@Injectable({
  providedIn: 'root'
})
export class EvaluationsApi {
  private readonly http = inject(HttpClient);
  private readonly apiUrl = `${environment.bffUrl}/api`;

  async getCursos(_docenteId: number): Promise<DocenteCurso[]> {
    const response = await firstValueFrom(
      this.http.get<CoursesResponse | DocenteCurso[]>(`${this.apiUrl}/docentes/cursos`),
    );

    if (Array.isArray(response)) {
      return response;
    }

    return (response.data ?? []).map((curso: Course) => ({
      docente: '',
      asignaturaNombre: curso.asignatura_nombre,
      curso: `${curso.nivel} ${curso.letra}`.trim(),
      anioAcademico: curso.anio_academico,
      cursoId: curso.curso_id,
      asignaturaId: curso.asignatura_id,
      cadId: curso.cad_id,
    }));
  }

  getEstudiantesPorCurso(cursoId: number) {
    return firstValueFrom(
      this.http.get<EstudianteCurso[]>(`${this.apiUrl}/estudiantes/curso/${cursoId}`)
    );
  }

  getEvaluacionesPorCad(cadId: number) {
    return firstValueFrom(
      this.http.get<Evaluacion[]>(`${this.apiUrl}/evaluaciones/cad/${cadId}`)
    );
  }

  getNotasPorCursoAsignatura(cursoId: number, asignaturaId: number) {
    return firstValueFrom(
      this.http.get<NotaRespuesta[]>(
        `${this.apiUrl}/notas/curso/${cursoId}/asignatura/${asignaturaId}`
      )
    );
  }

  crearEvaluacion(evaluacion: Evaluacion) {
    return firstValueFrom(this.http.post<Evaluacion>(`${this.apiUrl}/evaluaciones`, evaluacion));
  }

  guardarNotasBulk(notas: NotaPost[]) {
    return firstValueFrom(this.http.post<any[]>(`${this.apiUrl}/notas/bulk`, notas));
  }
}
