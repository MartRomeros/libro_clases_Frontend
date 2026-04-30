import { Component, computed, inject, signal, effect, Input } from '@angular/core';
import { MatCardModule } from '@angular/material/card';
import { MatIconModule } from '@angular/material/icon';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatSelectModule } from '@angular/material/select';
import { MatDatepickerModule } from '@angular/material/datepicker';
import { MatNativeDateModule } from '@angular/material/core';
import { MatTableModule } from '@angular/material/table';
import { MatButtonModule } from '@angular/material/button';
import { MatTabsModule } from '@angular/material/tabs';
import { MatChipsModule } from '@angular/material/chips';
import { MatTooltipModule } from '@angular/material/tooltip';
import { MatSnackBar, MatSnackBarModule } from '@angular/material/snack-bar';
import { MatProgressSpinnerModule } from '@angular/material/progress-spinner';
import { MatDialog, MatDialogModule } from '@angular/material/dialog';
import { CommonModule } from '@angular/common';
import { AttendanceConductService, Alumno, AsistenciaPayload } from '../../services/attendance-conduct.service';

@Component({
  selector: 'app-confirm-dialog',
  standalone: true,
  imports: [MatDialogModule, MatButtonModule],
  template: `
    <h2 mat-dialog-title>Confirmar registro</h2>
    <mat-dialog-content>¿Realmente desea registrar la asistencia para esta fecha?</mat-dialog-content>
    <mat-dialog-actions align="end">
      <button mat-button mat-dialog-close>Cancelar</button>
      <button mat-raised-button color="primary" [mat-dialog-close]="true">Registrar</button>
    </mat-dialog-actions>
  `
})
export class ConfirmDialogComponent {}

@Component({
  standalone: true,
  selector: 'app-attendance',
  imports: [
    MatCardModule,
    MatIconModule,
    MatFormFieldModule,
    MatSelectModule,
    MatDatepickerModule,
    MatNativeDateModule,
    MatTableModule,
    MatButtonModule,
    MatTabsModule,
    MatChipsModule,
    MatTooltipModule,
    MatSnackBarModule,
    MatProgressSpinnerModule,
    MatDialogModule,
    CommonModule
  ],
  templateUrl: './attendance.html',
  styleUrl: './attendance.css',
})
export class Attendance {

  private snackBar = inject(MatSnackBar);
  private attendanceService = inject(AttendanceConductService);
  private dialog = inject(MatDialog);

  // Inputs
  private _cursoId: number | string | null = null;
  @Input() set cursoId(value: number | string | null) {
    this._cursoId = value;
    if (value && value !== '') {
      this.cargarAlumnos(Number(value));
    } else {
      this.estudiantes.set([]);
    }
  }
  get cursoId() { return this._cursoId; }

  @Input() fecha: Date | null = null;

  // Estudiantes cargados desde el servicio
  estudiantes = signal<Alumno[]>([]);
  isLoading = signal<boolean>(false);

  constructor() { }

  cargarAlumnos(id: number): void {
    this.isLoading.set(true);
    this.attendanceService.getAlumnosCurso(id).subscribe({
      next: (response) => {
        if (response.success) {
          // Inicializamos estadoAsistencia como null para cada alumno
          const alumnosConEstado = response.data.map(a => ({
            ...a,
            estadoAsistencia: null
          }));
          this.estudiantes.set(alumnosConEstado);
        }
        this.isLoading.set(false);
      },
      error: (err) => {
        console.error('Error al cargar alumnos:', err);
        this.snackBar.open('Error al cargar la lista de alumnos', 'Cerrar', { duration: 3000 });
        this.isLoading.set(false);
      }
    });
  }

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

  estadosAsistencia: string[] = ['Presente', 'Ausente', 'Tardanza', 'Justificado'];

  marcarTodos(estado: string): void {
    this.estudiantes.update(lista =>
      lista.map(e => ({ ...e, estadoAsistencia: estado }))
    );
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

  marcarAsistencia(estudiante: Alumno, estado: any): void {
    this.estudiantes.update(lista =>
      lista.map(e => e.estudiante_id === estudiante.estudiante_id ? { ...e, estadoAsistencia: estado } : e)
    );
  }

  // Columnas de la tabla de asistencia
  columnasAsistencia: string[] = ['rut', 'nombre', 'apellido', 'estado'];

  guardarAsistencia(): void {
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

  private enviarAsistencia(): void {
    this.isLoading.set(true);
    const isoDate = this.fecha ? this.fecha.toISOString().split('T')[0] : new Date().toISOString().split('T')[0];

    // Asumimos cad_id: 1 (según el spec), o si estuviéramos usando this.cursoId()
    const payload: AsistenciaPayload = {
      cad_id: 1, 
      fecha: isoDate,
      asistencias: this.estudiantes().map(e => ({
        estudiante_id: e.estudiante_id,
        estado: e.estadoAsistencia as string,
        tipo_asistencia: 'Presencial'
      }))
    };

    console.log('Enviando payload:', JSON.stringify(payload, null, 2));

    this.attendanceService.registrarAsistencia(payload).subscribe({
      next: (response) => {
        if (response.success) {
          this.snackBar.open(`✓ ${response.message}`, 'Cerrar', {
            duration: 3000,
            panelClass: ['success-snackbar'],
          });
        }
        this.isLoading.set(false);
      },
      error: (err) => {
        console.error('Error al registrar asistencia:', err);
        this.snackBar.open('Error al registrar la asistencia', 'Cerrar', { duration: 3000 });
        this.isLoading.set(false);
      }
    });
  }

}
