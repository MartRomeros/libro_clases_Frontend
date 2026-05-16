import { ChangeDetectorRef, Component, computed, effect, inject, signal } from '@angular/core';
import { MatCardModule } from '@angular/material/card';
import { MatIconModule } from '@angular/material/icon';
import { LoadingStateComponent } from '../../../../shared/components/loading-state/loading-state.component';
import { ErrorStateComponent } from '../../../../shared/components/error-state/error-state.component';
import { EmptyStateComponent } from '../../../../shared/components/empty-state/empty-state.component';
import { DocenteCurso, EstudianteCurso, NotaPost } from '../../models/evaluations.model';
import { MatTableDataSource, MatTableModule } from '@angular/material/table';
import { MatSnackBar } from '@angular/material/snack-bar';
import { EvaluationsApi } from '../../data-access/evaluations.api';
import { AuthQueries } from '../../../auth/data-access/auth.queries';
import { Router } from '@angular/router';
import { injectQuery } from '@tanstack/angular-query-experimental';
import { MatButtonModule } from '@angular/material/button';
import { catchError, forkJoin, from, of } from 'rxjs';
import { showErrorSnack } from '../../../../shared/http/error-snackbar';
import { FormsModule } from '@angular/forms';
import { NavbarComponent } from '../../sections/navbar.component/navbar.component';
import { MatTooltipModule } from '@angular/material/tooltip';

@Component({
  selector: 'app-cursos.page.component',
  imports: [
    MatIconModule,
    MatCardModule,
    LoadingStateComponent,
    ErrorStateComponent,
    EmptyStateComponent,
    MatTableModule,
    MatButtonModule,
    FormsModule,
    NavbarComponent,
    MatTooltipModule,
  ],
  templateUrl: './cursos.page.component.html',
  styleUrl: './cursos.page.component.css',
})
export class CursosPageComponent {
  private readonly router = inject(Router);
  private readonly authQueries = inject(AuthQueries);
  private readonly evaluationsApi = inject(EvaluationsApi);
  private readonly snackBar = inject(MatSnackBar);

  private userQuery = injectQuery(() => this.authQueries.me());

  user = computed(() => this.userQuery.data() || null);

  private cursosCargadosInicialmente = false;

  isLoadingCursos = signal<boolean>(false);
  cursosLoadError = signal<unknown>(null);
  cursoSeleccionado = signal<string>('');
  mostrarEstudiantes = signal<boolean>(false);
  isLoadingEstudiantes = signal<boolean>(false);
  estudiantesLoadError = signal<unknown>(null);

  dataSource = new MatTableDataSource<DocenteCurso>([]);
  estudiantesDataSource = new MatTableDataSource<EstudianteCurso>([]);
  estudiantesColumns: string[] = ['rut', 'nombre', 'nota1', 'nota2', 'nota3', 'promedio'];
  displayedColumns: string[] = ['curso', 'asignatura', 'anioAcademico', 'acciones'];

  constructor(private readonly cdr: ChangeDetectorRef) {
    effect(() => {
      const docenteId = this.user()?.usuario_id ?? 0;
      if (docenteId && !this.cursosCargadosInicialmente) {
        this.cursosCargadosInicialmente = true;
        this.cargarCursos();
      }
    });
  }

  navegarA(ruta: string): void {
    if (ruta === 'action:mis-cursos') {
      this.cargarCursos();
      return;
    }
    this.router.navigate([ruta]);
  }

  cargarCursos(): void {
    this.isLoadingCursos.set(true);
    this.cursosLoadError.set(null);

    const docenteId = this.user()?.usuario_id ?? 0;
    if (!docenteId) {
      this.isLoadingCursos.set(false);
      return;
    }

    from(this.evaluationsApi.getCursos(docenteId)).subscribe({
      next: (cursos) => {
        this.dataSource.data = cursos ?? [];
        this.isLoadingCursos.set(false);
      },
      error: (err) => {
        this.cursosLoadError.set(err);
        this.isLoadingCursos.set(false);
        showErrorSnack(this.snackBar, err);
      },
    });
  }

  verDetalleCurso(curso: DocenteCurso): void {
    if (!curso.cursoId) {
      alert('Error: No se pudo obtener el ID del curso para cargar los alumnos.');
      return;
    }

    this.cursoSeleccionado.set(`${curso.curso} - ${curso.asignaturaNombre}`);
    this.mostrarEstudiantes.set(true);
    this.isLoadingEstudiantes.set(true);
    this.estudiantesLoadError.set(null);

    forkJoin({
      estudiantes: from(this.evaluationsApi.getEstudiantesPorCurso(curso.cursoId)),
      evaluaciones: from(this.evaluationsApi.getEvaluacionesPorCad(curso.cadId)),
      notas: from(
        this.evaluationsApi.getNotasPorCursoAsignatura(curso.cursoId, curso.asignaturaId),
      ).pipe(catchError(() => of([]))),
    }).subscribe({
      next: (resp) => {
        const evIds = resp.evaluaciones
          .sort(
            (a, b) => new Date(a.fechaEvaluacion).getTime() - new Date(b.fechaEvaluacion).getTime(),
          )
          .slice(0, 3);

        const estudiantesUnicos = Array.from(
          new Map(resp.estudiantes.map((est) => [est.estudianteId, est])).values(),
        );

        const listaCompleta = estudiantesUnicos.map((est) => {
          if (evIds[0]) est.ev1Id = evIds[0].evaluacionId;
          if (evIds[1]) est.ev2Id = evIds[1].evaluacionId;
          if (evIds[2]) est.ev3Id = evIds[2].evaluacionId;

          const notaInfo = resp.notas.find((n) => n.estudianteId === est.estudianteId);
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

        this.estudiantesDataSource.data = listaCompleta;
        this.isLoadingEstudiantes.set(false);
        this.estudiantesLoadError.set(null);

        setTimeout(() => {
          this.cdr.detectChanges();
          document.getElementById('seccion-estudiantes')?.scrollIntoView({ behavior: 'smooth' });
        }, 100);
      },
      error: (err) => {
        showErrorSnack(this.snackBar, err);
        this.isLoadingEstudiantes.set(false);
        this.estudiantesLoadError.set(err);
      },
    });
  }

  actualizarPromedio(estudiante: EstudianteCurso): void {
    const n1 = estudiante.nota1 || 0;
    const n2 = estudiante.nota2 || 0;
    const n3 = estudiante.nota3 || 0;

    // Validación de rango 1-7
    if (n1 > 7) estudiante.nota1 = 7;
    if (n2 > 7) estudiante.nota2 = 7;
    if (n3 > 7) estudiante.nota3 = 7;
    if (n1 < 0) estudiante.nota1 = 0;
    if (n2 < 0) estudiante.nota2 = 0;
    if (n3 < 0) estudiante.nota3 = 0;

    const notas = [estudiante.nota1, estudiante.nota2, estudiante.nota3]
      .map((n) => Number(n))
      .filter((n) => !isNaN(n) && n > 0);

    if (notas.length > 0) {
      const sumaTotal = notas.reduce((acc, curr) => acc + curr, 0);
      estudiante.promedio = Number((sumaTotal / notas.length).toFixed(1));
    } else {
      estudiante.promedio = 0;
    }
  }

  guardarNotas(): void {
    const listaEstudiantes = this.estudiantesDataSource.data;
    const notasParaGuardar: NotaPost[] = [];

    listaEstudiantes.forEach((est) => {
      if (est.ev1Id && est.nota1 != null && est.nota1 > 0) {
        notasParaGuardar.push({
          notaId: est.nota1Id,
          evaluacionId: est.ev1Id,
          estudianteId: est.estudianteId,
          valor: est.nota1,
        });
      }
      if (est.ev2Id && est.nota2 != null && est.nota2 > 0) {
        notasParaGuardar.push({
          notaId: est.nota2Id,
          evaluacionId: est.ev2Id,
          estudianteId: est.estudianteId,
          valor: est.nota2,
        });
      }
      if (est.ev3Id && est.nota3 != null && est.nota3 > 0) {
        notasParaGuardar.push({
          notaId: est.nota3Id,
          evaluacionId: est.ev3Id,
          estudianteId: est.estudianteId,
          valor: est.nota3,
        });
      }
    });

    if (notasParaGuardar.length === 0) {
      this.snackBar.open('No hay calificaciones válidas para guardar', 'Cerrar', {
        duration: 3000,
      });
      return;
    }

    this.isLoadingEstudiantes.set(true);

    from(this.evaluationsApi.guardarNotasBulk(notasParaGuardar)).subscribe({
      next: () => {
        this.snackBar.open('¡Todas las calificaciones se guardaron con éxito!', 'Genial', {
          duration: 4000,
          panelClass: ['success-snackbar'],
          horizontalPosition: 'end',
          verticalPosition: 'top',
        });
        this.isLoadingEstudiantes.set(false);
        this.mostrarEstudiantes.set(false);
      },
      error: (err) => {
        showErrorSnack(this.snackBar, err);
        this.isLoadingEstudiantes.set(false);
      },
    });
  }

  cancelarEdicion(): void {
    this.mostrarEstudiantes.set(false);
  }
}
