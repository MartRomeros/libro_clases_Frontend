import { CommonModule, DatePipe } from '@angular/common';
import { Component, computed, effect, inject, Input, signal } from '@angular/core';
import { FormBuilder, FormGroup, ReactiveFormsModule, Validators } from '@angular/forms';
import { MatButtonModule } from '@angular/material/button';
import { MatCardModule } from '@angular/material/card';
import { MatChipsModule } from '@angular/material/chips';
import { MatDividerModule } from '@angular/material/divider';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatIconModule } from '@angular/material/icon';
import { MatInputModule } from '@angular/material/input';
import { MatSelectModule } from '@angular/material/select';
import { MatSnackBar, MatSnackBarModule } from '@angular/material/snack-bar';
import { injectQuery } from '@tanstack/angular-query-experimental';

import { AttendanceQueries } from '../../data-access/docente.queries';
import { Alumno } from '../../models/alumno.response.model';
import { LoadingStateComponent } from '../../../../shared/components/loading-state/loading-state.component';
import { ErrorStateComponent } from '../../../../shared/components/error-state/error-state.component';
import { EmptyStateComponent } from '../../../../shared/components/empty-state/empty-state.component';

@Component({
  selector: 'app-conduct-component',
  standalone: true,
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
    DatePipe,
    CommonModule,
    LoadingStateComponent,
    ErrorStateComponent,
    EmptyStateComponent
  ],
  templateUrl: './conduct.component.html',
  styleUrl: './conduct.component.css',
})
export class ConductComponent {

  private fb = inject(FormBuilder);
  private snackBar = inject(MatSnackBar);

  // Inputs
  private readonly cursoIdSignal = signal<number | string | null>(null);
  @Input() set cursoId(value: number | string | null) {
    this.cursoIdSignal.set(value);
  }
  get cursoId() { return this.cursoIdSignal(); }

  @Input() fecha: Date | null = null;

  private readonly attendanceQueries = inject(AttendanceQueries)

  alumnosQuery = injectQuery(() => {
      const cursoId = this.cursoIdSignal();
      const enabled = cursoId !== null && cursoId !== '';
  
      return this.attendanceQueries.alumnosCurso(Number(cursoId), enabled);
  })

  alumnosError = computed(() => this.alumnosQuery.error());

  tiposAnotacion: string[] = ['Positiva', 'Negativa', 'Informativa'];
  anotacionForm: FormGroup;

  // Anotaciones registradas
  anotaciones = signal<any[]>([]);

  // Estudiantes cargados desde el servicio
  estudiantes = signal<Alumno[]>([]);
  isLoading = computed(() => this.alumnosQuery.isPending());

  constructor() {
    this.anotacionForm = this.fb.group({
      estudianteId: [null, Validators.required],
      tipo: ['', Validators.required],
      descripcion: ['', [Validators.required, Validators.minLength(10)]],
    });

    effect(() => {
      const data = this.alumnosQuery.data();
      if (data?.success) {
        this.estudiantes.set(data.data);
      } else { 
        this.estudiantes.set([]);
      }
    }, { allowSignalWrites: true });
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
