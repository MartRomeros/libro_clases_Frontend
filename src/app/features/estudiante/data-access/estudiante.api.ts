import { inject, Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { firstValueFrom } from 'rxjs';
import { environment } from '../../../../environments/environment';
import { AttendanceResponse, DashboardResumenAlumno, NotaEstudiante } from '../models/estudiante.model';

@Injectable({
  providedIn: 'root'
})
export class EstudianteApi {
  private readonly http = inject(HttpClient);
  private readonly apiUrl = `${environment.apiGw}/api`;

  getNotas(estudianteId: number) {
    return firstValueFrom(
      this.http.get<NotaEstudiante[]>(`${this.apiUrl}/notas/estudiante/${estudianteId}`)
    );
  }

  getAsistencias(estudianteId: number) {
    return firstValueFrom(
      this.http.get<AttendanceResponse>(`${this.apiUrl}/asistencia/estudiante/${estudianteId}`)
    );
  }

  getDashboardResumen() {
    return firstValueFrom(
      this.http.get<DashboardResumenAlumno>(`${this.apiUrl}/students/me/dashboard`)
    );
  }

  getNotasTodas() {
    return firstValueFrom(this.http.get<NotaEstudiante[]>(`${this.apiUrl}/notas`));
  }
}
