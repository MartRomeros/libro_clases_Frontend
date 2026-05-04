import { inject, Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { firstValueFrom } from 'rxjs';
import { environment } from '../../../../environments/environment';
import { AttendanceResponse, NotaEstudiante } from '../models/estudiante.model';

@Injectable({
  providedIn: 'root'
})
export class EstudianteApi {
  private readonly http = inject(HttpClient);
  private readonly apiUrl = environment.backGestionUrl;
  private readonly attendanceUrl = environment.apiAttendanceConductUrl;

  getNotas(estudianteId: number) {
    return firstValueFrom(
      this.http.get<NotaEstudiante[]>(`${this.apiUrl}/notas/estudiante/${estudianteId}`)
    );
  }

  getAsistencias(estudianteId: number) {
    return firstValueFrom(
      this.http.get<AttendanceResponse>(`${this.attendanceUrl}/asistencia/estudiante/${estudianteId}`)
    );
  }
}
