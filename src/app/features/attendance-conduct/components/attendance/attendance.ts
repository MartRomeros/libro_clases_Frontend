import { Component, computed, inject, signal } from '@angular/core';
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

  // Estudiantes mock para la vista
  estudiantes = signal<any[]>([
    { id: 1, nombre: 'Ana', apellido: 'González', estadoAsistencia: null },
    { id: 2, nombre: 'Carlos', apellido: 'Muñoz', estadoAsistencia: null },
    { id: 3, nombre: 'Sofía', apellido: 'Pérez', estadoAsistencia: null },
    { id: 4, nombre: 'Matías', apellido: 'Rodríguez', estadoAsistencia: null },
    { id: 5, nombre: 'Valentina', apellido: 'López', estadoAsistencia: null },
  ]);

  cursoSeleccionado = signal<string>('');
  cursosDisponibles = ['1°A', '1°B', '2°A', '2°B', '3°A'];

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

  colorChipTipo(tipo: any): string {
    const mapa: Record<any, string> = {
      Positiva: 'primary',
      Negativa: 'warn',
      Informativa: 'accent',
    };
    return mapa[tipo];
  }

  iconoTipo(tipo: any): string {
    const mapa: Record<any, string> = {
      Positiva: 'thumb_up',
      Negativa: 'warning',
      Informativa: 'info',
    };
    return mapa[tipo];
  }

  marcarAsistencia(estudiante: any, estado: any): void {
    this.estudiantes.update(lista =>
      lista.map(e => e.id === estudiante.id ? { ...e, estadoAsistencia: estado } : e)
    );
  }

  // Columnas de la tabla de asistencia
  columnasAsistencia: string[] = ['nombre', 'apellido', 'estado'];

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
