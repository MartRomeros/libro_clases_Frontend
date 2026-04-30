import { Injectable, inject } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { environment } from '../../../../environments/environment';

export interface Course {
  curso_id: number;
  nivel: string;
  letra: string;
  anio_academico: number;
  asignatura_id: number;
  asignatura_nombre: string;
  asignatura_siglas: string;
  cad_id: number;
}

export interface CoursesResponse {
  success: boolean;
  docente_id: number;
  data: Course[];
}

export interface Alumno {
  estudiante_id: number;
  rut: string;
  nombre: string;
  apellido_paterno: string;
  apellido_materno: string;
  email: string;
  estadoAsistencia?: string | null; // Added for UI state
}

export interface AlumnosResponse {
  success: boolean;
  curso_id: number;
  data: Alumno[];
}

@Injectable({
  providedIn: 'root'
})
export class AttendanceConductService {
  private http = inject(HttpClient);
  private apiUrl = environment.apiAttendanceConductUrl;

  getCursosDocente(): Observable<CoursesResponse> {
    return this.http.get<CoursesResponse>(`${this.apiUrl}/docentes/cursos`);
  }

  getAlumnosCurso(cursoId: number): Observable<AlumnosResponse> {
    return this.http.get<AlumnosResponse>(`${this.apiUrl}/cursos/${cursoId}/alumnos`);
  }
}
