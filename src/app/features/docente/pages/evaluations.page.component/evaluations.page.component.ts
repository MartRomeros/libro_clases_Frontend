import { Component, signal, inject, computed, effect } from '@angular/core';
import { CommonModule } from '@angular/common';
import { MatCardModule } from '@angular/material/card';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
import { MatTableModule, MatTableDataSource } from '@angular/material/table';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';
import { MatSelectModule } from '@angular/material/select';
import { MatSnackBar, MatSnackBarModule } from '@angular/material/snack-bar';
import { MatProgressSpinnerModule } from '@angular/material/progress-spinner';
import { MatDividerModule } from '@angular/material/divider';
import { MatDatepickerModule } from '@angular/material/datepicker';
import { MatNativeDateModule } from '@angular/material/core';
import { MatListModule } from '@angular/material/list';
import { MatToolbarModule } from '@angular/material/toolbar';
import { Router } from '@angular/router';
import { Location } from '@angular/common';
import { FormsModule, ReactiveFormsModule, FormBuilder, FormGroup, Validators } from '@angular/forms';
import { injectQuery, injectMutation } from '@tanstack/angular-query-experimental';

import { Navbar } from '../../../../layout/navbar/navbar';
import { AuthQueries } from '../../../auth/data-access/auth.queries';
import { EvaluationsQueries } from '../../data-access/evaluations.queries';
import { EvaluationsMutations } from '../../data-access/evaluations.mutations';
import { DocenteCurso, Evaluacion, EstudianteCurso, NotaPost } from '../../models/evaluations.model';

@Component({
  selector: 'app-evaluations-page',
  standalone: true,
  imports: [
    CommonModule,
    MatCardModule,
    MatButtonModule,
    MatIconModule,
    MatTableModule,
    MatFormFieldModule,
    MatInputModule,
    MatSelectModule,
    MatSnackBarModule,
    MatProgressSpinnerModule,
    MatDividerModule,
    MatDatepickerModule,
    MatNativeDateModule,
    MatListModule,
    MatToolbarModule,
    FormsModule,
    ReactiveFormsModule,
    Navbar
  ],
  templateUrl: './evaluations.page.component.html',
  styleUrl: './evaluations.page.component.css'
})
export class EvaluationsPageComponent {
  private readonly authQueries = inject(AuthQueries);
  private readonly evaluationsQueries = inject(EvaluationsQueries);
  private readonly evaluationsMutations = inject(EvaluationsMutations);
  private readonly snackBar = inject(MatSnackBar);
  private readonly fb = inject(FormBuilder);
  private readonly router = inject(Router);
  private readonly location = inject(Location);

  // Queries
  profileQuery = injectQuery(() => this.authQueries.me());
  profile = computed(() => this.profileQuery.data());

  cursosQuery = injectQuery(() =>
    this.evaluationsQueries.cursosDocente(this.profile()?.usuario_id ?? 0)
  );
  cursos = computed(() => this.cursosQuery.data() ?? []);

  cursoSeleccionado = signal<DocenteCurso | null>(null);
  cursoId = computed(() => this.cursoSeleccionado()?.cursoId ?? 0);
  cadId = computed(() => this.cursoSeleccionado()?.cadId ?? 0);
  asignaturaId = computed(() => this.cursoSeleccionado()?.asignaturaId ?? 0);

  estudiantesQuery = injectQuery(() =>
    this.evaluationsQueries.estudiantesCurso(this.cursoId())
  );

  evaluacionesQuery = injectQuery(() =>
    this.evaluationsQueries.evaluacionesCad(this.cadId())
  );

  notasQuery = injectQuery(() =>
    this.evaluationsQueries.notasCursoAsignatura(this.cursoId(), this.asignaturaId())
  );

  // Derived Data
  isLoadingData = computed(() =>
    this.estudiantesQuery.isPending() ||
    this.evaluacionesQuery.isPending() ||
    this.notasQuery.isPending()
  );

  evaluaciones = computed(() => this.evaluacionesQuery.data() ?? []);

  displayedColumns = computed(() => {
    const evs = this.evaluaciones();
    const columns = ['nombre'];
    evs.forEach(ev => {
      columns.push(`ev_${ev.evaluacionId}`);
    });
    columns.push('promedio');
    return columns;
  });

  // Estados para mostrar estudiantes y notas editables
  mostrarEstudiantes = signal<boolean>(false);
  isLoadingEstudiantes = signal<boolean>(false);
  cursoSeleccionadoLabel = signal<string>('');

  // Matriz de datos reactiva: combina estudiantes, evaluaciones y notas
  listaEstudiantes = computed(() => {
    const rawEsts = this.estudiantesQuery.data() ?? [];
    const evs = this.evaluaciones();
    const nts = this.notasQuery.data() ?? [];

    if (!rawEsts.length) return [];

    // 1. Eliminar duplicados por estudianteId
    const estsMap = new Map<number, EstudianteCurso>();
    rawEsts.forEach(est => {
      if (!estsMap.has(est.estudianteId)) {
        estsMap.set(est.estudianteId, { ...est });
      }
    });

    // 2. Mapear y combinar con notas
    const listaCombinada = Array.from(estsMap.values()).map((est: EstudianteCurso) => {
      // Asignar IDs de evaluación base
      if (evs[0]) est.ev1Id = evs[0].evaluacionId;
      if (evs[1]) est.ev2Id = evs[1].evaluacionId;
      if (evs[2]) est.ev3Id = evs[2].evaluacionId;

      const notaInfo = nts.find(n => n.estudianteId === est.estudianteId);
      if (notaInfo) {
        if (notaInfo.notaEv1 != null) est.nota1 = notaInfo.notaEv1;
        if (notaInfo.nota1Id != null) est.nota1Id = notaInfo.nota1Id;
        if (notaInfo.notaEv2 != null) est.nota2 = notaInfo.notaEv2;
        if (notaInfo.nota2Id != null) est.nota2Id = notaInfo.nota2Id;
        if (notaInfo.notaEv3 != null) est.nota3 = notaInfo.notaEv3;
        if (notaInfo.nota3Id != null) est.nota3Id = notaInfo.nota3Id;
        est.promedio = notaInfo.promedio;
      }
      return est;
    });

    // 3. Ordenar alfabéticamente A-Z
    return listaCombinada.sort((a, b) => 
      a.estudianteFullName.localeCompare(b.estudianteFullName)
    );
  });

  dataSource = new MatTableDataSource<EstudianteCurso>([]);

  // Mutation: Crear Evaluación
  crearEvaluacionMutation = injectMutation(() => ({
    ...this.evaluationsMutations.crearEvaluacion(),
    onSuccess: (...args) => {
      this.evaluationsMutations.crearEvaluacion().onSuccess?.(...args);
      this.snackBar.open('✓ Evaluación creada con éxito', 'Cerrar', { duration: 3000 });
      this.evaluacionForm.reset({
        nombre: '',
        fechaEvaluacion: new Date().toISOString().split('T')[0]
      });
      this.mostrarFormNuevaEv.set(false);
    },
<<<<<<< Updated upstream
    onError: (err) => {
      console.error('Error al crear evaluación:', err);
      this.snackBar.open('Error al crear evaluación', 'Cerrar', { duration: 3000 });
    }
=======
    onError: (err) => showErrorSnack(this.snackBar, err)
>>>>>>> Stashed changes
  }));

  // Mutation: Guardar Notas
  guardarNotasMutation = injectMutation(() => ({
    ...this.evaluationsMutations.guardarNotasBulk(),
    onSuccess: (...args) => {
      this.evaluationsMutations.guardarNotasBulk().onSuccess?.(...args);
      this.snackBar.open('¡Todas las calificaciones se guardaron con éxito!', 'Genial', {
        duration: 4000,
        panelClass: ['success-snackbar'],
        horizontalPosition: 'end',
        verticalPosition: 'top'
      });
<<<<<<< Updated upstream
      this.mostrarEstudiantes.set(false);
=======
      this.isLoadingEstudiantes.set(false);
>>>>>>> Stashed changes
    },
    onError: (err) => {
      console.error('Error al guardar masivamente:', err);
      this.snackBar.open('Error al guardar. Verifica tu conexión.', 'Entendido', {
        duration: 5000,
        panelClass: ['error-snackbar']
      });
    }
  }));

  // Mutation: Eliminar Evaluación
  eliminarEvaluacionMutation = injectMutation(() => ({
    ...this.evaluationsMutations.eliminarEvaluacion(),
    onSuccess: (...args) => {
      this.evaluationsMutations.eliminarEvaluacion().onSuccess?.(...args);
      this.snackBar.open('✓ Evaluación eliminada', 'Cerrar', { duration: 3000 });
    },
    onError: (err) => showErrorSnack(this.snackBar, err)
  }));

  evaluacionForm: FormGroup;
  mostrarFormNuevaEv = signal<boolean>(false);
  hoy = new Date();

  constructor() {
    this.evaluacionForm = this.fb.group({
      nombre: ['', [Validators.required, Validators.minLength(3)]],
      fechaEvaluacion: [new Date().toISOString().split('T')[0], Validators.required]
    });

    const state = this.location.getState() as { cursoSeleccionado?: DocenteCurso };
    if (state?.cursoSeleccionado) {
      this.cursoSeleccionado.set(state.cursoSeleccionado);
      setTimeout(() => {
        this.verDetalleCurso(state.cursoSeleccionado!);
      }, 500);
    }

    effect(() => {
      this.dataSource.data = this.listaEstudiantes();
    });
  }

  onCursoChange(curso: DocenteCurso): void {
    this.verDetalleCurso(curso);
  }

  crearEvaluacion(): void {
    if (this.evaluacionForm.invalid) return;
    
    const curso = this.cursoSeleccionado();
    if (!curso) return;

    const formVal = this.evaluacionForm.value;
    const fechaRaw = formVal.fechaEvaluacion;
    let fechaStr = '';

    if (fechaRaw instanceof Date) {
      fechaStr = fechaRaw.toISOString().split('T')[0];
    } else {
      fechaStr = String(fechaRaw || '');
    }

    const nueva: Evaluacion = {
      cadId: curso.cadId,
      nombre: String(formVal.nombre || ''),
      fechaEvaluacion: fechaStr
    };

    this.crearEvaluacionMutation.mutate(nueva);
  }

  confirmarEliminar(ev: any): void {
    if (confirm(`¿Estás seguro de que deseas eliminar la evaluación "${ev.nombre}"? Esta acción no se puede deshacer.`)) {
      this.eliminarEvaluacionMutation.mutate(ev.evaluacionId);
    }
  }

  esFutura(fechaStr: string): boolean {
    const fechaEv = new Date(fechaStr + 'T00:00:00');
    const hoy = new Date();
    hoy.setHours(0, 0, 0, 0);
    return fechaEv >= hoy;
  }

  volver(): void {
    const rol = this.profile()?.rol?.nombre?.toLowerCase() ?? '';
    if (rol.includes('admin')) this.router.navigate(['/admin']);
    else if (rol.includes('docente')) this.router.navigate(['/docente']);
    else if (rol.includes('estudiante')) this.router.navigate(['/estudiante']);
    else this.router.navigate(['/login']);
  }

  actualizarPromedio(estudiante: EstudianteCurso): void {
    const n1 = Number(estudiante.nota1 || 0);
    const n2 = Number(estudiante.nota2 || 0);
    const n3 = Number(estudiante.nota3 || 0);

    if (n1 > 7) estudiante.nota1 = 7;
    if (n2 > 7) estudiante.nota2 = 7;
    if (n3 > 7) estudiante.nota3 = 7;
    if (n1 < 0) estudiante.nota1 = 0;
    if (n2 < 0) estudiante.nota2 = 0;
    if (n3 < 0) estudiante.nota3 = 0;

    const notas = [estudiante.nota1, estudiante.nota2, estudiante.nota3]
      .map(n => Number(n))
      .filter(n => !isNaN(n) && n > 0);

    if (notas.length > 0) {
      const sumaTotal = notas.reduce((acc, curr) => acc + curr, 0);
      estudiante.promedio = Number((sumaTotal / notas.length).toFixed(1));
    } else {
      estudiante.promedio = 0;
    }
  }

  verDetalleCurso(curso: DocenteCurso): void {
    this.cursoSeleccionado.set(curso);
    this.cursoSeleccionadoLabel.set(`${curso.curso} - ${curso.asignaturaNombre}`);
    this.mostrarEstudiantes.set(true);
    this.isLoadingEstudiantes.set(false);
  }

  guardarNotas(): void {
    const listaEstudiantes = this.listaEstudiantes();
    const notasParaGuardar: NotaPost[] = [];

    listaEstudiantes.forEach((est: EstudianteCurso) => {
      if (est.ev1Id && est.nota1 != null && est.nota1 > 0) {
        notasParaGuardar.push({
          notaId: est.nota1Id,
          evaluacionId: est.ev1Id,
          estudianteId: est.estudianteId,
          valor: est.nota1
        });
      }
      if (est.ev2Id && est.nota2 != null && est.nota2 > 0) {
        notasParaGuardar.push({
          notaId: est.nota2Id,
          evaluacionId: est.ev2Id,
          estudianteId: est.estudianteId,
          valor: est.nota2
        });
      }
      if (est.ev3Id && est.nota3 != null && est.nota3 > 0) {
        notasParaGuardar.push({
          notaId: est.nota3Id,
          evaluacionId: est.ev3Id,
          estudianteId: est.estudianteId,
          valor: est.nota3
        });
      }
    });

    if (notasParaGuardar.length === 0) {
      this.snackBar.open('No hay calificaciones válidas para guardar', 'Cerrar', { duration: 3000 });
      return;
    }

    this.isLoadingEstudiantes.set(true);
    this.guardarNotasMutation.mutate(notasParaGuardar);
  }

  cancelarEdicion(): void {
    this.mostrarEstudiantes.set(false);
  }
}
