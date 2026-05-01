import { Component, computed, inject, signal, input, effect } from '@angular/core';
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
import { CommonModule } from '@angular/common';
import { DocenteService } from '../../../../core/services/docente.service';

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
    CommonModule
  ],
  templateUrl: './attendance.html',
  styleUrl: './attendance.css',
})
export class Attendance {

  private snackBar = inject(MatSnackBar);
  private docenteService = inject(DocenteService);

  // Recibe el cursoId y fecha desde el padre
  cursoId = input<number | null>(null);
  fecha = input<Date>(new Date());

  // Estudiantes reales desde el back
  estudiantes = signal<any[]>([]);
  isLoading = signal<boolean>(false);

  constructor() {
    // Cada vez que el cursoId cambie, recargamos
    effect(() => {
      const id = this.cursoId();
      if (id) {
        this.cargarEstudiantes(id);
      } else {
        this.estudiantes.set([]);
      }
    }, { allowSignalWrites: true });
  }

  cargarEstudiantes(cursoId: number): void {
    this.isLoading.set(true);
    this.docenteService.getEstudiantesPorCurso(cursoId).subscribe({
      next: (data) => {
        this.estudiantes.set(data.map(est => ({
          id: est.estudianteId,
          nombre: est.estudianteFullName.split(', ')[1] || est.estudianteFullName,
          apellido: est.estudianteFullName.split(', ')[0] || '',
          estadoAsistencia: null
        })));
        this.isLoading.set(false);
      },
      error: (err) => {
        console.error('Error cargando estudiantes para asistencia:', err);
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

  marcarAsistencia(estudiante: any, estado: any): void {
    this.estudiantes.update(lista =>
      lista.map(e => e.id === estudiante.id ? { ...e, estadoAsistencia: estado } : e)
    );
  }

  // Columnas de la tabla de asistencia
  columnasAsistencia: string[] = ['nombre', 'apellido', 'estado'];

  guardarAsistencia(): void {
    const cursoIdActual = this.cursoId();
    if (!cursoIdActual) {
      this.snackBar.open('Debes seleccionar un curso primero.', 'Cerrar', { duration: 3000 });
      return;
    }

    const sinMarcar = this.estudiantes().filter(e => e.estadoAsistencia === null).length;
    if (this.estudiantes().length === 0) {
      this.snackBar.open('No hay estudiantes cargados.', 'Cerrar', { duration: 3000 });
      return;
    }

    if (sinMarcar > 0) {
      this.snackBar.open(`Hay ${sinMarcar} estudiantes sin marcar.`, 'Entendido', { duration: 4000 });
      return;
    }

    // Formateamos la fecha a YYYY-MM-DD
    const fechaStr = this.fecha().toISOString().split('T')[0];

    // Preparamos el array de objetos para el bulk save
    const asistenciasAPostear = this.estudiantes().map(est => ({
      estudianteId: est.id,
      cursoId: cursoIdActual,
      fecha: fechaStr,
      estado: est.estadoAsistencia,
      tipoAsistencia: 'Presencial' // Valor por defecto según tu tabla
    }));

    this.isLoading.set(true);
    this.docenteService.guardarAsistencias(asistenciasAPostear).subscribe({
      next: () => {
        this.snackBar.open('✓ Asistencia guardada correctamente en la base de datos', 'Cerrar', {
          duration: 3000,
          panelClass: ['success-snackbar'],
        });
        this.isLoading.set(false);
      },
      error: (err) => {
        console.error('Error al guardar asistencia:', err);
        this.snackBar.open('Error al conectar con el servidor.', 'Cerrar', { duration: 5000 });
        this.isLoading.set(false);
      }
    });
  }
}
