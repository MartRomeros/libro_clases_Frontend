import { inject, Injectable } from '@angular/core';
import { queryOptions } from '@tanstack/angular-query-experimental';
import { AttendanceApi } from './asistencia.api';
import { attendanceKeys } from './asistencia.keys';

@Injectable({ providedIn: 'root' })
export class AttendanceQueries {
    private readonly attendanceApi = inject(AttendanceApi);

    cursosDocente() {
        return queryOptions({
            queryKey: attendanceKeys.cursos(),
            queryFn: () => this.attendanceApi.getCursosDisponibles(),
        });
    }

    alumnosCurso(cursoId: number,isEnabled:boolean) {
        return queryOptions({
            queryKey: attendanceKeys.alumnosByCurso(cursoId),
            queryFn: () => this.attendanceApi.getAlumnosCurso(cursoId),
            enabled: isEnabled
        });
    }

}
