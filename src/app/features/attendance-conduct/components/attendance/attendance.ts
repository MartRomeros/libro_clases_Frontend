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
import { CommonModule } from '@angular/common';
import { AttendanceConductService, Alumno } from '../../services/attendance-conduct.service';

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
    CommonModule
  ],
  templateUrl: './attendance.html',
  styleUrl: './attendance.css',
})
export class Attendance {

  private snackBar = inject(MatSnackBar);
  private attendanceService = inject(AttendanceConductService);

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
    this.snackBar.open('✓ Asistencia guardada correctamente', 'Cerrar', {
      duration: 3000,
      panelClass: ['success-snackbar'],
    });
  }

}
