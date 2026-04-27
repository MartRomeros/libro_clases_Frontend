import { CommonModule } from '@angular/common';
import { Component, signal, computed } from '@angular/core';
import { Router } from '@angular/router';
import { ReactiveFormsModule, FormBuilder, FormGroup, Validators } from '@angular/forms';
import { MatToolbarModule } from '@angular/material/toolbar';
import { MatCardModule } from '@angular/material/card';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';
import { MatSelectModule } from '@angular/material/select';
import { MatDatepickerModule } from '@angular/material/datepicker';
import { MatNativeDateModule } from '@angular/material/core';
import { MatTableModule } from '@angular/material/table';
import { MatChipsModule } from '@angular/material/chips';
import { MatTabsModule } from '@angular/material/tabs';
import { MatDividerModule } from '@angular/material/divider';
import { MatTooltipModule } from '@angular/material/tooltip';
import { MatSnackBar, MatSnackBarModule } from '@angular/material/snack-bar';
import { MatBadgeModule } from '@angular/material/badge';

export type EstadoAsistencia = 'Presente' | 'Ausente' | 'Tardanza' | 'Justificado';
export type TipoAnotacion = 'Positiva' | 'Negativa' | 'Informativa';

export interface Estudiante {
  id: number;
  nombre: string;
  apellido: string;
  estadoAsistencia: EstadoAsistencia | null;
}

export interface Anotacion {
  estudianteId: number;
  estudianteNombre: string;
  tipo: TipoAnotacion;
  descripcion: string;
  fecha: Date;
}

@Component({
  selector: 'app-asistencia-conducta',
  standalone: true,
  imports: [
    CommonModule,
    ReactiveFormsModule,
    MatToolbarModule,
    MatCardModule,
    MatButtonModule,
    MatIconModule,
    MatFormFieldModule,
    MatInputModule,
    MatSelectModule,
    MatDatepickerModule,
    MatNativeDateModule,
    MatTableModule,
    MatChipsModule,
    MatTabsModule,
    MatDividerModule,
    MatTooltipModule,
    MatSnackBarModule,
    MatBadgeModule,
  ],
  templateUrl: './asistencia-conducta.html',
  styleUrl: './asistencia-conducta.css',
})
export class AsistenciaConducta {
  // Filtros
  cursoSeleccionado = signal<string>('');
  fechaSeleccionada = signal<Date>(new Date());

  // Estudiantes mock para la vista
  estudiantes = signal<Estudiante[]>([
    { id: 1, nombre: 'Ana', apellido: 'González', estadoAsistencia: null },
    { id: 2, nombre: 'Carlos', apellido: 'Muñoz', estadoAsistencia: null },
    { id: 3, nombre: 'Sofía', apellido: 'Pérez', estadoAsistencia: null },
    { id: 4, nombre: 'Matías', apellido: 'Rodríguez', estadoAsistencia: null },
    { id: 5, nombre: 'Valentina', apellido: 'López', estadoAsistencia: null },
  ]);

  // Anotaciones registradas
  anotaciones = signal<Anotacion[]>([]);

  // Formulario de anotación
  anotacionForm: FormGroup;
  estudianteSeleccionadoParaAnotacion = signal<Estudiante | null>(null);

  // Columnas de la tabla de asistencia
  columnasAsistencia: string[] = ['nombre', 'apellido', 'estado'];

  // Columnas de la tabla de anotaciones
  columnasAnotaciones: string[] = ['estudiante', 'tipo', 'descripcion', 'fecha'];

  cursosDisponibles = ['1°A', '1°B', '2°A', '2°B', '3°A'];

  estadosAsistencia: EstadoAsistencia[] = ['Presente', 'Ausente', 'Tardanza', 'Justificado'];

  tiposAnotacion: TipoAnotacion[] = ['Positiva', 'Negativa', 'Informativa'];

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

  constructor(
    private router: Router,
    private fb: FormBuilder,
    private snackBar: MatSnackBar
  ) {
    this.anotacionForm = this.fb.group({
      estudianteId: [null, Validators.required],
      tipo: ['', Validators.required],
      descripcion: ['', [Validators.required, Validators.minLength(10)]],
    });
  }

  volverAlHome(): void {
    this.router.navigate(['/docente']);
  }

  marcarAsistencia(estudiante: Estudiante, estado: EstadoAsistencia): void {
    this.estudiantes.update(lista =>
      lista.map(e => e.id === estudiante.id ? { ...e, estadoAsistencia: estado } : e)
    );
  }

  marcarTodos(estado: EstadoAsistencia): void {
    this.estudiantes.update(lista =>
      lista.map(e => ({ ...e, estadoAsistencia: estado }))
    );
  }

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

  registrarAnotacion(): void {
    if (this.anotacionForm.invalid) {
      this.anotacionForm.markAllAsTouched();
      return;
    }

    const { estudianteId, tipo, descripcion } = this.anotacionForm.value;
    const est = this.estudiantes().find(e => e.id === estudianteId);
    if (!est) return;

    const nueva: Anotacion = {
      estudianteId,
      estudianteNombre: `${est.nombre} ${est.apellido}`,
      tipo,
      descripcion,
      fecha: new Date(),
    };

    this.anotaciones.update(lista => [nueva, ...lista]);
    this.anotacionForm.reset();
    this.snackBar.open('✓ Anotación registrada', 'Cerrar', {
      duration: 3000,
      panelClass: ['success-snackbar'],
    });
  }

  colorChipEstado(estado: EstadoAsistencia | null): string {
    const mapa: Record<EstadoAsistencia, string> = {
      Presente: 'primary',
      Ausente: 'warn',
      Tardanza: 'accent',
      Justificado: '',
    };
    return estado ? mapa[estado] : '';
  }

  colorChipTipo(tipo: TipoAnotacion): string {
    const mapa: Record<TipoAnotacion, string> = {
      Positiva: 'primary',
      Negativa: 'warn',
      Informativa: 'accent',
    };
    return mapa[tipo];
  }

  iconoTipo(tipo: TipoAnotacion): string {
    const mapa: Record<TipoAnotacion, string> = {
      Positiva: 'thumb_up',
      Negativa: 'warning',
      Informativa: 'info',
    };
    return mapa[tipo];
  }
}
