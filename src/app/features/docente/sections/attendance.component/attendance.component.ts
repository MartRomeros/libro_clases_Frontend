import { CommonModule } from '@angular/common';
import { Component, computed, effect, inject, Input, signal } from '@angular/core';
import { MatButtonModule } from '@angular/material/button';
import { MatCardModule } from '@angular/material/card';
import { MatChipsModule } from '@angular/material/chips';
import { MatNativeDateModule } from '@angular/material/core';
import { MatDatepickerModule } from '@angular/material/datepicker';
import { MatDialog, MatDialogModule } from '@angular/material/dialog';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatIconModule } from '@angular/material/icon';
import { MatSelectModule } from '@angular/material/select';
import { MatSnackBar, MatSnackBarModule } from '@angular/material/snack-bar';
import { MatTableModule } from '@angular/material/table';
import { MatTabsModule } from '@angular/material/tabs';
import { MatTooltipModule } from '@angular/material/tooltip';
import { MatMenuModule } from '@angular/material/menu';
import { MatDividerModule } from '@angular/material/divider';
import { injectQuery } from '@tanstack/angular-query-experimental';

import { AttendanceQueries } from '../../data-access/docente.queries';
import { AttendanceMutations } from '../../data-access/asistencia.mutations';
import { Alumno } from '../../models/alumno.response.model';
import { AsistenciaPayload } from '../../models/asistencia.request.model';
import { LoadingStateComponent } from '../../../../shared/components/loading-state/loading-state.component';
import { ErrorStateComponent } from '../../../../shared/components/error-state/error-state.component';
import { EmptyStateComponent } from '../../../../shared/components/empty-state/empty-state.component';
import { showErrorSnack } from '../../../../shared/http/error-snackbar';
import { isBusinessDayChile } from '../../utils/chile-business-day.util';

@Component({
  selector: 'app-confirm-dialog',
  standalone: true,
  imports: [MatDialogModule, MatButtonModule],
  template: `
    <h2 mat-dialog-title>Confirmar registro</h2>
    <mat-dialog-content>¿Realmente desea registrar la asistencia para esta fecha?</mat-dialog-content>
    <mat-dialog-actions align="end">
      <button mat-button mat-dialog-close  class="btn-cancelar" >Cancelar</button>
      <button mat-raised-button color="primary" [mat-dialog-close]="true" class="btn-registrar" >Registrar</button>
    </mat-dialog-actions>
  `
})
export class ConfirmDialogComponent { }


@Component({
  selector: 'app-attendance-component',
  standalone: true,
  imports: [
    MatButtonModule,
    MatCardModule,
    MatIconModule,
    MatFormFieldModule,
    MatSelectModule,
    MatDatepickerModule,
    MatNativeDateModule,
    MatTableModule,
    MatTabsModule,
    MatChipsModule,
    MatTooltipModule,
    MatSnackBarModule,
    MatDialogModule,
    MatMenuModule,
    MatDividerModule,
    CommonModule,
    LoadingStateComponent,
    ErrorStateComponent,
    EmptyStateComponent
  ],
  templateUrl: './attendance.component.html',
  styleUrl: './attendance.component.css',
})
export class AttendanceComponent {

  private dialog = inject(MatDialog);
  private snackBar = inject(MatSnackBar);
  private attendanceQueries = inject(AttendanceQueries)
  private attendanceMutation = inject(AttendanceMutations)

  // Inputs
  private readonly cursoIdSignal = signal<number | string | null>(null);
  @Input() set cursoId(value: number | string | null) {
    this.cursoIdSignal.set(value);
  }

  get cursoId() { return this.cursoIdSignal(); }

  @Input() fecha: Date | null = null;


  alumnosQuery = injectQuery(() => {
    const cursoId = this.cursoIdSignal();
    const enabled = cursoId !== null && cursoId !== '';

    return this.attendanceQueries.alumnosCurso(Number(cursoId), enabled);
  })

  alumnosError = computed(() => this.alumnosQuery.error());

  readonly registrarAsistencia = this.attendanceMutation.registrarAsistencia()

  // Contadores computed
  totalPresentes = computed(() =>
    this.estudiantes().filter(e => e.estadoAsistencia === 'Presente').length
  );
  totalAusentes = computed(() =>
    this.estudiantes().filter(e => e.estadoAsistencia === 'Ausente').length
  );
  totalTardanza = computed(() =>
    this.estudiantes().filter(e => e.estadoAsistencia === 'Tardanza').length
  );
  estudiantes = signal<Alumno[]>([]);
  estadosAsistencia: string[] = ['Presente', 'Ausente', 'Tardanza', 'Justificado'];
  columnasAsistencia: string[] = ['rut', 'nombre', 'apellido', 'estado'];
  isLoading = computed(() => this.alumnosQuery.isPending() || this.registrarAsistencia.isPending());


  constructor() {
    effect(() => {
      const data = this.alumnosQuery.data();
      if (data?.success) {
        const alumnosConEstado = data.data.map(a => ({
          ...a,
          estadoAsistencia: null
        }));
        this.estudiantes.set(alumnosConEstado);
      } else {
        this.estudiantes.set([]);
      }
    }, { allowSignalWrites: true });
  }

  colorChipEstado(estado: any | null): string {
    const mapa: Record<any, string> = {
      Presente: 'primary',
      Ausente: 'warn',
      Tardanza: 'accent',
      Justificado: '',
    };
    return estado ? mapa[estado] : '';
  }

  guardarAsistencia(): void {
    const fechaAsistencia = this.fecha ?? new Date();
    if (!isBusinessDayChile(fechaAsistencia)) {
      this.snackBar.open('La asistencia solo puede registrarse en días hábiles no feriados de Chile.', 'Entendido', {
        duration: 4500,
        panelClass: ['warn-snackbar'],
      });
      return;
    }

    const sinMarcar = this.estudiantes().filter(e => e.estadoAsistencia === null).length;
    if (sinMarcar > 0) {
      this.snackBar.open(`Hay ${sinMarcar} estudiantes sin marcar.`, 'Entendido', {
        duration: 4000,
        panelClass: ['warn-snackbar'],
      });
      return;
    }

    const dialogRef = this.dialog.open(ConfirmDialogComponent);

    dialogRef.afterClosed().subscribe(result => {
      if (result) {
        this.enviarAsistencia();
      }
    });
  }

  marcarAsistencia(estudiante: Alumno, estado: any): void {
    this.estudiantes.update(lista =>
      lista.map(e => e.estudiante_id === estudiante.estudiante_id ? { ...e, estadoAsistencia: estado } : e)
    );
  }

  marcarTodos(estado: string): void {
    this.estudiantes.update(lista =>
      lista.map(e => ({ ...e, estadoAsistencia: estado }))
    );
  }


  private enviarAsistencia(): void {
    const isoDate = this.fecha ? this.fecha.toISOString().split('T')[0] : new Date().toISOString().split('T')[0];

    const payload: AsistenciaPayload = {
      cad_id: Number(this.cursoIdSignal()),
      fecha: isoDate,
      asistencias: this.estudiantes().map(e => ({
        estudiante_id: e.estudiante_id,
        estado: e.estadoAsistencia as string,
        tipo_asistencia: 'Presencial'
      }))
    };
    this.registrarAsistencia.mutate(payload, {
      onError: (err) => showErrorSnack(this.snackBar, err)
    });
  }
}
