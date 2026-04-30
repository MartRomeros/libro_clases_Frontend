import { Component, signal, effect, inject, Input } from '@angular/core';
import { MatCardModule } from '@angular/material/card';
import { MatIconModule } from '@angular/material/icon';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatSelectModule } from '@angular/material/select';
import { MatInputModule } from '@angular/material/input';
import { MatButtonModule } from '@angular/material/button';
import { MatDividerModule } from '@angular/material/divider';
import { MatChipsModule } from '@angular/material/chips';
import { FormBuilder, FormGroup, ReactiveFormsModule, Validators } from '@angular/forms';
import { Router } from '@angular/router';
import { MatSnackBar, MatSnackBarModule } from '@angular/material/snack-bar';
import { MatProgressSpinnerModule } from '@angular/material/progress-spinner';
import { CommonModule, DatePipe } from '@angular/common';
import { AttendanceConductService, Alumno } from '../../services/attendance-conduct.service';

@Component({
  standalone: true,
  selector: 'app-conduct',
  imports: [
    MatCardModule,
    MatIconModule,
    MatFormFieldModule,
    MatSelectModule,
    MatInputModule,
    MatButtonModule,
    MatDividerModule,
    MatChipsModule,
    ReactiveFormsModule,
    MatSnackBarModule,
    MatProgressSpinnerModule,
    DatePipe,
    CommonModule
  ],
  templateUrl: './conduct.html',
  styleUrl: './conduct.css',
})
export class Conduct {

  private fb = inject(FormBuilder);
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

  tiposAnotacion: string[] = ['Positiva', 'Negativa', 'Informativa'];
  anotacionForm: FormGroup;

  // Anotaciones registradas
  anotaciones = signal<any[]>([]);

  // Estudiantes cargados desde el servicio
  estudiantes = signal<Alumno[]>([]);
  isLoading = signal<boolean>(false);

  constructor() {
    this.anotacionForm = this.fb.group({
      estudianteId: [null, Validators.required],
      tipo: ['', Validators.required],
      descripcion: ['', [Validators.required, Validators.minLength(10)]],
    });
  }

  cargarAlumnos(id: number): void {
    this.isLoading.set(true);
    this.attendanceService.getAlumnosCurso(id).subscribe({
      next: (response) => {
        if (response.success) {
          this.estudiantes.set(response.data);
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

  registrarAnotacion(): void {
    if (this.anotacionForm.invalid) {
      this.anotacionForm.markAllAsTouched();
      return;
    }

    const { estudianteId, tipo, descripcion } = this.anotacionForm.value;
    const est = this.estudiantes().find(e => e.estudiante_id === estudianteId);
    if (!est) return;

    const nueva: any = {
      estudianteId,
      estudianteNombre: `${est.nombre} ${est.apellido_paterno} ${est.apellido_materno}`,
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

  iconoTipo(tipo: string): string {
    const mapa: Record<string, string> = {
      Positiva: 'thumb_up',
      Negativa: 'warning',
      Informativa: 'info',
    };
    return mapa[tipo];
  }

  colorChipTipo(tipo: string): string {
    const mapa: Record<string, string> = {
      Positiva: 'primary',
      Negativa: 'warn',
      Informativa: 'accent',
    };
    return mapa[tipo];
  }

}
