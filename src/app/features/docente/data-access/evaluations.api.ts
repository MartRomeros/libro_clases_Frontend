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

@Injectable({
  providedIn: 'root'
})
export class EvaluationsApi {
  private readonly http = inject(HttpClient);
  private readonly apiUrl = environment.backGestionUrl;

  getCursos(docenteId: number) {
    return firstValueFrom(
      this.http.get<DocenteCurso[]>(`${this.apiUrl}/docentes/${docenteId}/cursos`)
    );
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
    return firstValueFrom(
      this.http.post<Evaluacion>(`${this.apiUrl}/evaluaciones`, evaluacion)
    );
  }

  guardarNotasBulk(notas: NotaPost[]) {
    return firstValueFrom(
      this.http.post<any[]>(`${this.apiUrl}/notas/bulk`, notas)
    );
  }

  actualizarEvaluacion(id: number, evaluacion: Partial<Evaluacion>) {
    return firstValueFrom(
      this.http.put<Evaluacion>(`${this.apiUrl}/evaluaciones/${id}`, evaluacion)
    );
  }

  eliminarEvaluacion(id: number) {
    return firstValueFrom(
      this.http.delete<void>(`${this.apiUrl}/evaluaciones/${id}`)
    );
  }
}
