import { inject, Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { firstValueFrom } from 'rxjs';
import { environment } from '../../../../environments/environment';
import {
  Usuario,
  Docente,
  Estudiante,
  Evaluacion,
  Curso,
  Asignatura,
  CAD
} from '../models/admin.model';

@Injectable({
  providedIn: 'root'
})
export class AdminApi {
  private readonly http = inject(HttpClient);
  private readonly apiUrl = environment.backGestionUrl;

  // --- Usuarios ---
  getUsuarios() {
    return firstValueFrom(this.http.get<Usuario[]>(`${this.apiUrl}/usuarios`));
  }

  crearUsuario(usuario: Usuario) {
    return firstValueFrom(this.http.post<Usuario>(`${this.apiUrl}/usuarios`, usuario));
  }

  actualizarUsuario(id: number, usuario: Usuario) {
    return firstValueFrom(this.http.put<Usuario>(`${this.apiUrl}/usuarios/${id}`, usuario));
  }

  eliminarUsuario(id: number) {
    return firstValueFrom(this.http.delete<void>(`${this.apiUrl}/usuarios/${id}`));
  }

  // --- Docentes ---
  getDocentes() {
    return firstValueFrom(this.http.get<Docente[]>(`${this.apiUrl}/docentes`));
  }

  crearDocente(docente: { docenteId: number }) {
    return firstValueFrom(this.http.post<Docente>(`${this.apiUrl}/docentes`, docente));
  }

  // --- Estudiantes ---
  getEstudiantes() {
    return firstValueFrom(this.http.get<Estudiante[]>(`${this.apiUrl}/estudiantes`));
  }

  crearEstudiante(estudiante: { estudianteId: number; cursoId: number }) {
    return firstValueFrom(this.http.post<Estudiante>(`${this.apiUrl}/estudiantes`, estudiante));
  }

  actualizarEstudiante(id: number, estudiante: any) {
    return firstValueFrom(this.http.put<any>(`${this.apiUrl}/estudiantes/${id}`, estudiante));
  }

  // --- Académico ---
  getCursos() {
    return firstValueFrom(this.http.get<Curso[]>(`${this.apiUrl}/academico/cursos`));
  }

  crearCurso(curso: any) {
    return firstValueFrom(this.http.post<any>(`${this.apiUrl}/academico/cursos`, curso));
  }

  eliminarCurso(id: number) {
    return firstValueFrom(this.http.delete<void>(`${this.apiUrl}/academico/cursos/${id}`));
  }

  getAsignaturas() {
    return firstValueFrom(this.http.get<Asignatura[]>(`${this.apiUrl}/academico/asignaturas`));
  }

  crearAsignatura(asignatura: any) {
    return firstValueFrom(this.http.post<any>(`${this.apiUrl}/academico/asignaturas`, asignatura));
  }

  eliminarAsignatura(id: number) {
    return firstValueFrom(this.http.delete<void>(`${this.apiUrl}/academico/asignaturas/${id}`));
  }

  // --- CAD ---
  getCads() {
    return firstValueFrom(this.http.get<CAD[]>(`${this.apiUrl}/docentes/cad/all`));
  }

  vincularCAD(cad: any) {
    return firstValueFrom(this.http.post<any>(`${this.apiUrl}/academico/cad`, cad));
  }

  eliminarCAD(id: number) {
    return firstValueFrom(this.http.delete<void>(`${this.apiUrl}/academico/cad/${id}`));
  }

  // --- Evaluaciones ---
  getEvaluacionesByCad(cadId: number) {
    return firstValueFrom(this.http.get<Evaluacion[]>(`${this.apiUrl}/evaluaciones/cad/${cadId}`));
  }

  crearEvaluacion(evaluacion: Evaluacion) {
    return firstValueFrom(this.http.post<Evaluacion>(`${this.apiUrl}/evaluaciones`, evaluacion));
  }

  actualizarEvaluacion(id: number, evaluacion: Evaluacion) {
    return firstValueFrom(this.http.put<Evaluacion>(`${this.apiUrl}/evaluaciones/${id}`, evaluacion));
  }

  eliminarEvaluacion(id: number) {
    return firstValueFrom(this.http.delete<void>(`${this.apiUrl}/evaluaciones/${id}`));
  }
}
