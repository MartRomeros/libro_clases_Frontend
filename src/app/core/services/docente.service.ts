import { Injectable, inject } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { environment } from '../../../environments/environment';

export interface DocenteCurso {
  docente: string;
  asignaturaNombre: string;
  curso: string;
  anioAcademico: number;
  cursoId: number;
  asignaturaId: number;
  cadId: number;
}

export interface EstudianteCurso {
  cursoNombre: string;
  anioAcademico: number;
  asignatura: string;
  rut: string;
  estudianteFullName: string;
  docenteACargo: string;
  estudianteId: number;
  // IDs de evaluaciones y notas para poder guardar
  ev1?: string;
  ev1Id?: number;
  nota1?: number;
  nota1Id?: number;
  ev2?: string;
  ev2Id?: number;
  nota2?: number;
  nota2Id?: number;
  ev3?: string;
  ev3Id?: number;
  nota3?: number;
  nota3Id?: number;
  promedio?: number;
}

export interface NotaRespuesta {
  estudianteId: number;
  ev1?: string;
  ev1Id?: number;
  notaEv1?: number;
  nota1Id?: number;
  ev2?: string;
  ev2Id?: number;
  notaEv2?: number;
  nota2Id?: number;
  ev3?: string;
  ev3Id?: number;
  notaEv3?: number;
  nota3Id?: number;
  promedio?: number;
}

export interface NotaPost {
  notaId?: number;
  evaluacionId: number;
  estudianteId: number;
  valor: number;
}

export interface AsistenciaPost {
  estudianteId: number;
  cursoId: number;
  fecha: string; // Formato YYYY-MM-DD
  estado: string; // Presente, Ausente, etc.
  tipoAsistencia: string; // Presencial, etc.
}

export interface AnotacionPost {
  estudianteId: number;
  docenteId: number;
  tipo: string; // Positiva, Negativa, Informativa
  descripcion: string;
  fechaRegistro: string; // Formato ISO o YYYY-MM-DD
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
export class DocenteService {
  private http = inject(HttpClient);
  private apiUrl = `${environment.backGestionUrl}`;

  getCursos(docenteId: number): Observable<DocenteCurso[]> {
    const url = `${this.apiUrl}/docentes/${docenteId}/cursos`;
    console.log('LLAMANDO A API DOCENTE:', url);
    return this.http.get<DocenteCurso[]>(url);
  }

  getEstudiantesPorCurso(cursoId: number): Observable<EstudianteCurso[]> {
    const url = `${this.apiUrl}/estudiantes/curso/${cursoId}`;
    console.log('LLAMANDO A API ESTUDIANTES:', url);
    return this.http.get<EstudianteCurso[]>(url);
  }

  getNotasPorCursoAsignatura(cursoId: number, asignaturaId: number): Observable<NotaRespuesta[]> {
    const url = `${this.apiUrl}/notas/curso/${cursoId}/asignatura/${asignaturaId}`;
    console.log('LLAMANDO A API NOTAS:', url);
    return this.http.get<NotaRespuesta[]>(url);
  }

  guardarNota(nota: NotaPost): Observable<any> {
    const url = `${this.apiUrl}/notas`;
    return this.http.post(url, nota);
  }

  guardarNotasBulk(notas: NotaPost[]): Observable<any[]> {
    const url = `${this.apiUrl}/notas/bulk`;
    return this.http.post<any[]>(url, notas);
  }

  guardarAsistencias(asistencias: AsistenciaPost[]): Observable<any> {
    const url = `${this.apiUrl}/asistencias/bulk`; // Ajustado para guardado masivo
    return this.http.post(url, asistencias);
  }

  guardarAnotacion(anotacion: AnotacionPost): Observable<any> {
    const url = `${this.apiUrl}/anotaciones`;
    return this.http.post(url, anotacion);
  }

  getAnotacionesPorEstudiante(estudianteId: number): Observable<any[]> {
    const url = `${this.apiUrl}/anotaciones/estudiante/${estudianteId}`;
    return this.http.get<any[]>(url);
  }

  getEvaluacionesPorCad(cadId: number): Observable<Evaluacion[]> {
    return this.http.get<Evaluacion[]>(`${this.apiUrl}/evaluaciones/cad/${cadId}`);
  }

  getNotasEstudiante(estudianteId: number): Observable<any[]> {
    return this.http.get<any[]>(`${this.apiUrl}/notas/estudiante/${estudianteId}`);
  }

  guardarEvaluacion(evaluacion: Evaluacion): Observable<Evaluacion> {
    return this.http.post<Evaluacion>(`${this.apiUrl}/evaluaciones`, evaluacion);
  }
}
