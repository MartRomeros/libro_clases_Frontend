import { HttpClient } from "@angular/common/http";
import { inject, Injectable } from "@angular/core";
import { environment } from "../../../../environments/environment";
import { firstValueFrom } from "rxjs";
import { CoursesResponse } from "../models/curso.response.model";
import { AlumnosResponse } from "../models/alumno.response.model";
import { AsistenciaPayload } from "../models/asistencia.request.model";

export interface RegistroAsistenciaResponse {
  success: boolean;
  message: string;
}


@Injectable({ providedIn: 'root' })
export class AttendanceApi {

    private readonly http = inject(HttpClient)
    private attendanceUrl = environment.apiAttendanceConductUrl

    getCursosDisponibles(): Promise<CoursesResponse> {
        return firstValueFrom(
            this.http.get<CoursesResponse>(`${this.attendanceUrl}/docentes/cursos`)
        )
    }

    getAlumnosCurso(cursoId: number) {
        return firstValueFrom(
            this.http.get<AlumnosResponse>(`${this.attendanceUrl}/cursos/${cursoId}/alumnos`)
        )
    }

    registrarAsistencia(payload: AsistenciaPayload) {
        return firstValueFrom(
            this.http.post<RegistroAsistenciaResponse>(`${this.attendanceUrl}/asistencia`, payload)
        )
    }
}
