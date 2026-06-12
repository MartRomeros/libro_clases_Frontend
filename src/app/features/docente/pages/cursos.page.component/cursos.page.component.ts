import { ChangeDetectorRef, Component, computed, effect, inject, signal } from '@angular/core';
import { MatCardModule } from '@angular/material/card';
import { MatIconModule } from '@angular/material/icon';
import { LoadingStateComponent } from '../../../../shared/components/loading-state/loading-state.component';
import { ErrorStateComponent } from '../../../../shared/components/error-state/error-state.component';
import { EmptyStateComponent } from '../../../../shared/components/empty-state/empty-state.component';
import { DocenteCurso, EstudianteCurso, Evaluacion, NotaPost } from '../../models/evaluations.model';
import { MatTableDataSource, MatTableModule } from '@angular/material/table';
import { MatSnackBar } from '@angular/material/snack-bar';
import { EvaluationsApi } from '../../data-access/evaluations.api';
import { AuthQueries } from '../../../auth/data-access/auth.queries';
import { Router } from '@angular/router';
import { injectQuery, injectQueryClient } from '@tanstack/angular-query-experimental';
import { MatButtonModule } from '@angular/material/button';
import { catchError, forkJoin, from, of } from 'rxjs';
import { showErrorSnack } from '../../../../shared/http/error-snackbar';
import { FormsModule } from '@angular/forms';
import { NavbarComponent } from '../../sections/navbar.component/navbar.component';
import { MatTooltipModule } from '@angular/material/tooltip';
import { MatListModule } from '@angular/material/list';
import { MatDividerModule } from '@angular/material/divider';
import { estudianteKeys } from '../../../estudiante/data-access/estudiante.keys';

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
    MatListModule,
    MatDividerModule,
  ],
  templateUrl: './cursos.page.component.html',
  styleUrl: './cursos.page.component.css',
})
export class CursosPageComponent {
  private readonly router = inject(Router);
  private readonly authQueries = inject(AuthQueries);
  private readonly evaluationsApi = inject(EvaluationsApi);
  private readonly snackBar = inject(MatSnackBar);
  private readonly queryClient = injectQueryClient();

  private userQuery = injectQuery(() => this.authQueries.me());

  user = computed(() => this.userQuery.data() || null);

  private cursosCargadosInicialmente = false;

  isLoadingCursos = signal<boolean>(false);
  cursosLoadError = signal<unknown>(null);
  cursosConEvaluaciones = signal<Set<number>>(new Set<number>());
  cursoSeleccionado = signal<string>('');
  evaluacionesCurso = signal<Evaluacion[]>([]);
  mostrarEstudiantes = signal<boolean>(false);
  isLoadingEstudiantes = signal<boolean>(false);
  estudiantesLoadError = signal<unknown>(null);

  dataSource = new MatTableDataSource<DocenteCurso>([]);
  estudiantesDataSource = new MatTableDataSource<EstudianteCursoConNotas>([]);
  displayedColumns: string[] = ['curso', 'asignatura', 'anioAcademico', 'acciones'];
  estudiantesColumns = computed(() => [
    'rut',
    'nombre',
    ...this.evaluacionesCurso().map((ev) => this.getEvaluacionColumn(ev)),
    'promedio',
  ]);

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
        const cursosData = cursos ?? [];

        if (cursosData.length === 0) {
          this.dataSource.data = [];
          this.cursosConEvaluaciones.set(new Set<number>());
          this.isLoadingCursos.set(false);
          return;
        }

        forkJoin(
          cursosData.map((curso) =>
            from(this.evaluationsApi.getEvaluacionesPorCad(curso.cadId)).pipe(
              catchError(() => of([])),
            ),
          ),
        ).subscribe({
          next: (evaluacionesPorCurso) => {
            const cursosConEvaluaciones = new Set<number>();

            evaluacionesPorCurso.forEach((evaluaciones, index) => {
              const curso = cursosData[index];
              if (curso?.cadId && evaluaciones.length > 0) {
                cursosConEvaluaciones.add(curso.cadId);
              }
            });

            this.dataSource.data = cursosData;
            this.cursosConEvaluaciones.set(cursosConEvaluaciones);
            this.isLoadingCursos.set(false);
          },
          error: (err) => {
            this.cursosLoadError.set(err);
            this.isLoadingCursos.set(false);
            showErrorSnack(this.snackBar, err);
          },
        });
      },
      error: (err) => {
        this.cursosLoadError.set(err);
        this.isLoadingCursos.set(false);
        showErrorSnack(this.snackBar, err);
      },
    });
  }

  cursoTieneEvaluaciones(curso: DocenteCurso): boolean {
    return this.cursosConEvaluaciones().has(curso.cadId);
  }

  getEvaluacionColumn(evaluacion: Evaluacion): string {
    return `ev_${evaluacion.evaluacionId}`;
  }

  verDetalleCurso(curso: DocenteCurso): void {
    if (!curso.cursoId) {
      alert('Error: No se pudo obtener el ID del curso para cargar los alumnos.');
      return;
    }

    this.cursoSeleccionado.set(`${curso.curso} - ${curso.asignaturaNombre}`);
    this.evaluacionesCurso.set([]);
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
        const evaluacionesOrdenadas = [...resp.evaluaciones]
          .sort(
            (a, b) => new Date(a.fechaEvaluacion).getTime() - new Date(b.fechaEvaluacion).getTime(),
          );

        if (evaluacionesOrdenadas.length === 0) {
          this.isLoadingEstudiantes.set(false);
          this.mostrarEstudiantes.set(false);
          this.snackBar.open('Este curso no tiene evaluaciones creadas todavía.', 'Cerrar', {
            duration: 3000,
          });
          return;
        }
        this.evaluacionesCurso.set(evaluacionesOrdenadas);

        const estudiantesUnicos = Array.from(
          new Map(resp.estudiantes.map((est) => [est.estudianteId, est])).values(),
        );

        const listaCompleta = estudiantesUnicos.map((est) => {
          const estudianteConNotas = est as EstudianteCursoConNotas;
          estudianteConNotas.notasPorEvaluacion = {};

          evaluacionesOrdenadas.forEach((evaluacion) => {
            if (evaluacion.evaluacionId != null) {
              estudianteConNotas.notasPorEvaluacion[evaluacion.evaluacionId] = {};
            }
          });

          const notaInfo = resp.notas.find((n) => n.estudianteId === est.estudianteId);
          if (notaInfo) {
            const paresNotas = [
              {
                evaluacionId: notaInfo.ev1Id,
                valor: notaInfo.notaEv1,
                notaId: notaInfo.nota1Id,
              },
              {
                evaluacionId: notaInfo.ev2Id,
                valor: notaInfo.notaEv2,
                notaId: notaInfo.nota2Id,
              },
              {
                evaluacionId: notaInfo.ev3Id,
                valor: notaInfo.notaEv3,
                notaId: notaInfo.nota3Id,
              },
            ];

            paresNotas.forEach(({ evaluacionId, valor, notaId }) => {
              if (evaluacionId != null) {
                estudianteConNotas.notasPorEvaluacion[evaluacionId] = {
                  valor: valor ?? undefined,
                  notaId: notaId ?? undefined,
                };
              }
            });
          }

          this.actualizarPromedio(estudianteConNotas);
          return estudianteConNotas;
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

  getNotaValue(estudiante: EstudianteCursoConNotas, evaluacionId?: number): number | null {
    if (evaluacionId == null) return null;
    return estudiante.notasPorEvaluacion[evaluacionId]?.valor ?? null;
  }

  setNotaValue(estudiante: EstudianteCursoConNotas, evaluacionId: number | undefined, valor: string): void {
    if (evaluacionId == null) return;

    const valorNumerico = valor === '' ? undefined : Number(valor);
    const notaActual = estudiante.notasPorEvaluacion[evaluacionId] ?? {};

    estudiante.notasPorEvaluacion[evaluacionId] = {
      ...notaActual,
      valor: Number.isNaN(valorNumerico) ? undefined : valorNumerico,
    };

    this.actualizarPromedio(estudiante);
  }

  actualizarPromedio(estudiante: EstudianteCursoConNotas): void {
    Object.values(estudiante.notasPorEvaluacion).forEach((nota) => {
      if (nota.valor == null) return;
      if (nota.valor > 7) nota.valor = 7;
      if (nota.valor < 0) nota.valor = 0;
    });

    const notas = Object.values(estudiante.notasPorEvaluacion)
      .map((nota) => Number(nota.valor))
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
      Object.entries(est.notasPorEvaluacion).forEach(([evaluacionId, nota]) => {
        if (nota.valor != null && nota.valor > 0) {
          notasParaGuardar.push({
            notaId: nota.notaId,
            evaluacionId: Number(evaluacionId),
            estudianteId: est.estudianteId,
            valor: nota.valor,
          });
        }
      });
    });

    if (notasParaGuardar.length === 0) {
      this.snackBar.open('No hay calificaciones válidas para guardar', 'Cerrar', {
        duration: 3000,
      });
      return;
    }

    this.isLoadingEstudiantes.set(true);

    from(this.evaluationsApi.guardarNotasBulk(notasParaGuardar)).subscribe({
      next: async () => {
        const estudianteIds = Array.from(new Set(notasParaGuardar.map((nota) => nota.estudianteId)));

        await Promise.all(
          estudianteIds.map((estudianteId) =>
            this.queryClient.invalidateQueries({
              queryKey: estudianteKeys.notas(estudianteId),
            }),
          ),
        );

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

interface NotaEditable {
  valor?: number;
  notaId?: number;
}

interface EstudianteCursoConNotas extends EstudianteCurso {
  notasPorEvaluacion: Record<number, NotaEditable>;
}
