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
import { AttendanceMutations } from '../../data-access/asistencia.mutations';
import { Alumno } from '../../models/alumno.response.model';
import { LoadingStateComponent } from '../../../../shared/components/loading-state/loading-state.component';
import { ErrorStateComponent } from '../../../../shared/components/error-state/error-state.component';
import { EmptyStateComponent } from '../../../../shared/components/empty-state/empty-state.component';
import { showErrorSnack } from '../../../../shared/http/error-snackbar';
import { AnotacionPayload } from '../../models/anotacion.request.model';
import { AnotacionItemResponse } from '../../models/anotacion.response.model';

interface AnotacionView {
  estudianteId: number | null;
  estudianteNombre: string;
  tipo: string;
  descripcion: string;
  fecha: Date;
}

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
  private readonly attendanceMutations = inject(AttendanceMutations)

  alumnosQuery = injectQuery(() => {
      const cursoId = this.cursoIdSignal();
      const parsedCursoId = Number(cursoId);
      const enabled = Number.isFinite(parsedCursoId) && parsedCursoId > 0;
  
      return this.attendanceQueries.alumnosCurso(parsedCursoId, enabled);
  })
  anotacionesQuery = injectQuery(() => {
    const cursoId = this.cursoIdSignal();
    const parsedCursoId = Number(cursoId);
    const enabled = Number.isFinite(parsedCursoId) && parsedCursoId > 0;

    return this.attendanceQueries.anotacionesCurso(parsedCursoId, enabled);
  })

  alumnosError = computed(() => this.alumnosQuery.error());
  anotacionesError = computed(() => this.anotacionesQuery.error());
  readonly registrarAnotacionMutation = this.attendanceMutations.registrarAnotacion();

  tiposAnotacion: string[] = ['Positiva', 'Negativa', 'Informativa'];
  anotacionForm: FormGroup;

  // Anotaciones registradas
  anotaciones = signal<AnotacionView[]>([]);

  // Estudiantes cargados desde el servicio
  estudiantes = signal<Alumno[]>([]);
  isLoading = computed(() => this.alumnosQuery.isPending() || this.anotacionesQuery.isPending());

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

    effect(() => {
      const data = this.anotacionesQuery.data();
      if (data?.success) {
        this.anotaciones.set(data.data.map(a => this.toAnotacionView(a)));
      } else {
        this.anotaciones.set([]);
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

    const payload: AnotacionPayload = {
      estudiante_id: Number(estudianteId),
      tipo: this.toApiTipo(tipo),
      descripcion: String(descripcion).trim(),
    };

    this.registrarAnotacionMutation.mutate(payload, {
      onSuccess: () => {
        const nueva: AnotacionView = {
          estudianteId: Number(estudianteId),
          estudianteNombre: `${est.nombre} ${est.apellido_paterno} ${est.apellido_materno}`,
          tipo,
          descripcion: String(descripcion).trim(),
          fecha: new Date(),
        };
        this.anotaciones.update(lista => [nueva, ...lista]);
        this.anotacionForm.reset();
        this.anotacionesQuery.refetch();
      },
      onError: (err) => showErrorSnack(this.snackBar, err),
    });
  }

  private toApiTipo(tipo: string): AnotacionPayload['tipo'] {
    const mapa: Record<string, AnotacionPayload['tipo']> = {
      Positiva: 'positiva',
      Negativa: 'negativa',
      Informativa: 'informativa',
    };
    return mapa[tipo] ?? 'informativa';
  }

  private toAnotacionView(anotacion: AnotacionItemResponse): AnotacionView {
    const tipoFormateado = this.toViewTipo(anotacion.tipo);
    const estudianteNombre = anotacion.estudiante_nombre
      ?? anotacion.nombre_estudiante
      ?? 'Estudiante';

    return {
      estudianteId: anotacion.estudiante_id ?? null,
      estudianteNombre,
      tipo: tipoFormateado,
      descripcion: anotacion.descripcion,
      fecha: anotacion.fecha ? new Date(anotacion.fecha) : new Date(anotacion.created_at ?? Date.now()),
    };
  }

  private toViewTipo(tipo: string): string {
    const valor = String(tipo ?? '').toLowerCase();
    const mapa: Record<string, string> = {
      positiva: 'Positiva',
      negativa: 'Negativa',
      informativa: 'Informativa',
    };
    return mapa[valor] ?? 'Informativa';
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
