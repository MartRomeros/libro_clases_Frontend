import { inject, Injectable } from "@angular/core";
import { injectMutation, QueryClient } from "@tanstack/angular-query-experimental";
import { AttendanceApi } from "./asistencia.api";
import { AsistenciaPayload } from "../models/asistencia.request.model";
import { attendanceKeys } from "./asistencia.keys";
import { MatSnackBar } from "@angular/material/snack-bar";
import { AnotacionPayload } from "../models/anotacion.request.model";

@Injectable({ providedIn: 'root' })
export class AttendanceMutations {

    private readonly attendanceApi = inject(AttendanceApi)
    private readonly queryClient = inject(QueryClient)
    private snackbar = inject(MatSnackBar)

    registrarAsistencia() {
        return injectMutation(() => ({
            mutationFn: (payload: AsistenciaPayload) => this.attendanceApi.registrarAsistencia(payload),
            onSuccess: () => {
                this.queryClient.invalidateQueries({
                    queryKey: attendanceKeys.alumnos()
                })

                this.snackbar.open('Asistencia guardada', 'Cerrar', {duration: 3000,panelClass: ['success-snackbar']});
            }
        }))
    }

    registrarAnotacion() {
        return injectMutation(() => ({
            mutationFn: (payload: AnotacionPayload) => this.attendanceApi.registrarAnotacion(payload),
            onSuccess: () => {
                this.snackbar.open('Anotación guardada', 'Cerrar', { duration: 3000, panelClass: ['success-snackbar'] });
            },
            onError: error=>{
                console.error(error)
            }
        }))
    }
}
