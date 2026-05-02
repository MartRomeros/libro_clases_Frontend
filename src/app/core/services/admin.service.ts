import { Injectable, inject } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { environment } from '../../../environments/environment';

export interface Usuario {
  usuarioId?: number;
  rolId: number;
  rut: string;
  nombre: string;
  apellidoPaterno: string;
  apellidoMaterno: string;
  email: string;
  password?: string;
  activo: boolean;
}

export interface Docente {
  docenteId: number;
  usuario?: Usuario;
}

export interface Estudiante {
  estudianteId: number;
  cursoId: number;
  usuario?: Usuario;
}

export interface Evaluacion {
  evaluacionId?: number;
  cadId: number;
  nombre: string;
  fechaEvaluacion: string;
}

@Injectable({
  providedIn: 'root'
})
export class AdminService {
  private http = inject(HttpClient);
  private apiUrl = environment.backGestionUrl;

  // Usuarios
  getUsuarios(): Observable<Usuario[]> {
    return this.http.get<Usuario[]>(`${this.apiUrl}/usuarios`);
  }

  crearUsuario(usuario: Usuario): Observable<Usuario> {
    return this.http.post<Usuario>(`${this.apiUrl}/usuarios`, usuario);
  }

  actualizarUsuario(id: number, usuario: Usuario): Observable<Usuario> {
    return this.http.put<Usuario>(`${this.apiUrl}/usuarios/${id}`, usuario);
  }

  eliminarUsuario(id: number): Observable<void> {
    return this.http.delete<void>(`${this.apiUrl}/usuarios/${id}`);
  }

  // Docentes
  getDocentes(): Observable<Docente[]> {
    return this.http.get<Docente[]>(`${this.apiUrl}/docentes`);
  }

  crearDocente(docente: Docente): Observable<Docente> {
    return this.http.post<Docente>(`${this.apiUrl}/docentes`, docente);
  }

  eliminarDocente(id: number): Observable<void> {
    return this.http.delete<void>(`${this.apiUrl}/docentes/${id}`);
  }

  // Estudiantes
  getEstudiantes(): Observable<Estudiante[]> {
    return this.http.get<Estudiante[]>(`${this.apiUrl}/estudiantes`);
  }

  crearEstudiante(estudiante: Estudiante): Observable<Estudiante> {
    return this.http.post<Estudiante>(`${this.apiUrl}/estudiantes`, estudiante);
  }

  actualizarEstudiante(id: number, estudiante: any): Observable<any> {
    return this.http.put<any>(`${this.apiUrl}/estudiantes/${id}`, estudiante);
  }

  eliminarEstudiante(id: number): Observable<void> {
    return this.http.delete<void>(`${this.apiUrl}/estudiantes/${id}`);
  }

  // CADs y Cursos para mapeo de nombres
  getCads(): Observable<any[]> {
    return this.http.get<any[]>(`${this.apiUrl}/docentes/cad/all`);
  }

  // --- Gestión Académica (Cursos, Asignaturas, CAD) ---
  getCursos(): Observable<any[]> {
    return this.http.get<any[]>(`${this.apiUrl}/academico/cursos`);
  }

  crearCurso(curso: any): Observable<any> {
    return this.http.post<any>(`${this.apiUrl}/academico/cursos`, curso);
  }

  eliminarCurso(id: number): Observable<void> {
    return this.http.delete<void>(`${this.apiUrl}/academico/cursos/${id}`);
  }

  getAsignaturas(): Observable<any[]> {
    return this.http.get<any[]>(`${this.apiUrl}/academico/asignaturas`);
  }

  crearAsignatura(asignatura: any): Observable<any> {
    return this.http.post<any>(`${this.apiUrl}/academico/asignaturas`, asignatura);
  }

  eliminarAsignatura(id: number): Observable<void> {
    return this.http.delete<void>(`${this.apiUrl}/academico/asignaturas/${id}`);
  }

  vincularCAD(cad: any): Observable<any> {
    return this.http.post<any>(`${this.apiUrl}/academico/cad`, cad);
  }

  eliminarCAD(id: number): Observable<void> {
    return this.http.delete<void>(`${this.apiUrl}/academico/cad/${id}`);
  }

  // Evaluaciones
  getEvaluacionesByCad(cadId: number): Observable<Evaluacion[]> {
    return this.http.get<Evaluacion[]>(`${this.apiUrl}/evaluaciones/cad/${cadId}`);
  }

  crearEvaluacion(evaluacion: Evaluacion): Observable<Evaluacion> {
    return this.http.post<Evaluacion>(`${this.apiUrl}/evaluaciones`, evaluacion);
  }

  actualizarEvaluacion(id: number, evaluacion: Evaluacion): Observable<Evaluacion> {
    return this.http.put<Evaluacion>(`${this.apiUrl}/evaluaciones/${id}`, evaluacion);
  }

  eliminarEvaluacion(id: number): Observable<void> {
    return this.http.delete<void>(`${this.apiUrl}/evaluaciones/${id}`);
  }
}
