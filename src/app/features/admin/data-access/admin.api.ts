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
  CAD,
  AdminDashboard
} from '../models/admin.model';

@Injectable({
  providedIn: 'root'
})
export class AdminApi {
  private readonly http = inject(HttpClient);
  private readonly apiUrl = `${environment.apiGw}/api`;

  getDashboard() {
    return firstValueFrom(this.http.get<AdminDashboard>(`${this.apiUrl}/admin/me/dashboard`));
  }

  // --- Usuarios ---
  getUsuarios() {
    return firstValueFrom(this.http.get<Usuario[]>(`${this.apiUrl}/usuarios`));
  }

  getUsuarioById(id: number) {
    return firstValueFrom(this.http.get<Usuario>(`${this.apiUrl}/usuarios/${id}`));
  }

  loginUsuario(payload: { email: string; password: string }) {
    return firstValueFrom(this.http.post<any>(`${this.apiUrl}/usuarios/login`, payload));
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

  getDocenteById(id: number) {
    return firstValueFrom(this.http.get<Docente>(`${this.apiUrl}/docentes/${id}`));
  }

  getCursosByDocente(id: number) {
    return firstValueFrom(this.http.get<CAD[]>(`${this.apiUrl}/docentes/${id}/cursos`));
  }

  crearDocente(docente: { docenteId: number }) {
    return firstValueFrom(this.http.post<Docente>(`${this.apiUrl}/docentes`, docente));
  }

  eliminarDocente(id: number) {
    return firstValueFrom(this.http.delete<void>(`${this.apiUrl}/docentes/${id}`));
  }

  // --- Estudiantes ---
  getEstudiantes() {
    return firstValueFrom(this.http.get<Estudiante[]>(`${this.apiUrl}/estudiantes`));
  }

  getEstudianteById(id: number) {
    return firstValueFrom(this.http.get<Estudiante>(`${this.apiUrl}/estudiantes/${id}`));
  }

  getEstudiantesByCurso(cursoId: number) {
    return firstValueFrom(this.http.get<Estudiante[]>(`${this.apiUrl}/estudiantes/curso/${cursoId}`));
  }

  crearEstudiante(estudiante: { estudianteId: number; cursoId: number }) {
    return firstValueFrom(this.http.post<Estudiante>(`${this.apiUrl}/estudiantes`, estudiante));
  }

  actualizarEstudiante(id: number, estudiante: any) {
    return firstValueFrom(this.http.put<any>(`${this.apiUrl}/estudiantes/${id}`, estudiante));
  }

  eliminarEstudiante(id: number) {
    return firstValueFrom(this.http.delete<void>(`${this.apiUrl}/estudiantes/${id}`));
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

  // --- Matrículas (MsMatriculas) ---
  buscarEstudianteMatricula(rut: string) {
    // Nueva implementación: Llama al microservicio MsMatriculas a través del API Gateway
    return firstValueFrom(this.http.get<any>(`${this.apiUrl}/matriculas/estudiantes/${rut}`));
  }

  iniciarPagoWebpay(amount: number, returnUrl: string) {
    return firstValueFrom(this.http.post<{url: string, token: string}>(
      `${this.apiUrl}/matriculas/webpay/create`,
      { amount, returnUrl }
    ));
  }

  grabarMatricula(payload: any) {
    return firstValueFrom(this.http.post<any>(`${this.apiUrl}/matriculas`, payload));
  }
}
