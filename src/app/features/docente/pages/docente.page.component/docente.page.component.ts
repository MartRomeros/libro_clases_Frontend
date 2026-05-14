import { ChangeDetectorRef, Component, computed, inject, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Router } from '@angular/router';
import { FormsModule } from '@angular/forms';
import { from, forkJoin, of, catchError } from 'rxjs';
import { injectQuery } from '@tanstack/angular-query-experimental';

import { MatIconModule } from '@angular/material/icon';
import { MatCardModule } from '@angular/material/card';
import { MatDividerModule } from '@angular/material/divider';
import { MatBadgeModule } from '@angular/material/badge';
import { MatButtonModule } from '@angular/material/button';
import { MatSnackBar } from '@angular/material/snack-bar';
import { MatTableDataSource, MatTableModule } from '@angular/material/table';

import { Resumen } from '../../models/resumen.docente.model';
import { OpcionDocente } from '../../models/menu.options.model';
import { Navbar } from '../../../../layout/navbar/navbar';
import { AuthQueries } from '../../../auth/data-access/auth.queries';
import { DocenteCurso, EstudianteCurso, NotaPost } from '../../models/evaluations.model';
import { EvaluationsApi } from '../../data-access/evaluations.api';
import { LoadingStateComponent } from '../../../../shared/components/loading-state/loading-state.component';
import { ErrorStateComponent } from '../../../../shared/components/error-state/error-state.component';
import { EmptyStateComponent } from '../../../../shared/components/empty-state/empty-state.component';
import { showErrorSnack } from '../../../../shared/http/error-snackbar';

@Component({
  selector: 'app-docente.page.component',
  standalone: true,
  imports: [
    Navbar,
    CommonModule,
    MatIconModule,
    MatCardModule,
    MatDividerModule,
    MatBadgeModule,
    MatButtonModule,
    MatTableModule,
    FormsModule,
    LoadingStateComponent,
    ErrorStateComponent,
    EmptyStateComponent
  ],
  templateUrl: './docente.page.component.html',
  styleUrl: './docente.page.component.css',
})
export class DocentePageComponent {

  private readonly router = inject(Router)
  private readonly authQueries = inject(AuthQueries)
  private readonly evaluationsApi = inject(EvaluationsApi)
  private readonly snackBar = inject(MatSnackBar)
  

  private userQuery = injectQuery(() => this.authQueries.me())

  user = computed(()=>this.userQuery.data() || null);
  loading = computed(()=> this.userQuery.isLoading())
  error = computed(() => this.userQuery.error())

  fullName = computed(() => {
    const p = this.user();
    if (!p) return '';
    const parts = [p.nombre, p.apellido_paterno, p.apellido_materno].filter(Boolean);
    return parts.join(' ');
  });

  mostrarCursos = signal<boolean>(false);
  isLoadingCursos = signal<boolean>(false);
  cursosLoadError = signal<unknown>(null);
  cursoSeleccionado = signal<string>('');
  mostrarEstudiantes = signal<boolean>(false);
  isLoadingEstudiantes = signal<boolean>(false);
<<<<<<< HEAD
<<<<<<< Updated upstream
=======
  estudiantesLoadError = signal<unknown>(null);
  ev1Nombre = signal<string>('EV 1');
  ev2Nombre = signal<string>('EV 2');
  ev3Nombre = signal<string>('EV 3');
>>>>>>> Stashed changes
=======
  estudiantesLoadError = signal<unknown>(null);
>>>>>>> 88751cb27e7e5b77bc17ac9e727630ae5435510f

  dataSource = new MatTableDataSource<DocenteCurso>([]);
  estudiantesDataSource = new MatTableDataSource<EstudianteCurso>([]);
  estudiantesColumns = signal<string[]>(['rut', 'nombre', 'nota1', 'nota2', 'nota3', 'promedio']);
  displayedColumns: string[] = ['curso', 'asignatura', 'anioAcademico', 'acciones'];


  opciones: OpcionDocente[] = [
    {
      titulo: 'Mis Clases',
      descripcion: 'Gestiona tus cursos, asignaturas y evaluaciones asignadas.',
      icono: 'menu_book',
      ruta: 'action:mis-cursos',
      color: 'primary',
    },
    {
      titulo: 'Asistencia y Conducta',
      descripcion: 'Registra asistencia diaria y anotaciones de conducta de los estudiantes.',
      icono: 'fact_check',
      ruta: '/docente/asistencia',
      color: 'accent',
    },
    {
      titulo: 'Evaluaciones y Notas',
      descripcion: 'Crea evaluaciones y registra las calificaciones de tus estudiantes.',
      icono: 'grading',
      ruta: '/docente/evaluaciones',
      color: 'primary',
    },
    {
      titulo: 'Mensajería',
      descripcion: 'Comunícate con apoderados, estudiantes y personal del colegio.',
      icono: 'forum',
      ruta: '/comunicaciones',
      color: 'accent',
      badge: 3,
    },
  ];

  resumenRapido: Resumen[] = [
    { etiqueta: 'Clases hoy', valor: '3', icono: 'today' },
    { etiqueta: 'Estudiantes', valor: '87', icono: 'group' },
    { etiqueta: 'Evaluaciones pendientes', valor: '2', icono: 'pending_actions' },
    { etiqueta: 'Mensajes sin leer', valor: '3', icono: 'mark_email_unread' },
  ];

  constructor(private readonly cdr: ChangeDetectorRef) {}


  navegarA(ruta: string): void {
    if (ruta === 'action:mis-cursos') {
      this.cargarCursos();
      return;
    }

    this.router.navigate([ruta]);
  }

  cargarCursos(): void {
    this.mostrarCursos.set(true);
    this.cursosLoadError.set(null);

    const docenteId = this.user()?.usuario_id ?? 0;
    if (!docenteId) {
      this.isLoadingCursos.set(false);
      return;
    }

    this.isLoadingCursos.set(true);

    from(this.evaluationsApi.getCursos(docenteId)).subscribe({
      next: (data: DocenteCurso[]) => {
        this.dataSource.data = data;
        this.isLoadingCursos.set(false);
        this.cursosLoadError.set(null);

        setTimeout(() => {
          this.cdr.detectChanges();
          const element = document.getElementById('seccion-cursos');
          if (element) element.scrollIntoView({ behavior: 'smooth' });
        }, 50);
      },
      error: (err) => {
        showErrorSnack(this.snackBar, err);
        this.isLoadingCursos.set(false);
        this.cursosLoadError.set(err);
      }
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
      notas: from(this.evaluationsApi.getNotasPorCursoAsignatura(curso.cursoId, curso.asignaturaId)).pipe(
        catchError(() => of([]))
      )
    }).subscribe({
      next: (resp) => {
        const evIds = resp.evaluaciones
          .sort((a, b) => new Date(a.fechaEvaluacion).getTime() - new Date(b.fechaEvaluacion).getTime())
          .slice(0, 3);

<<<<<<< HEAD
<<<<<<< Updated upstream
        // Mapear notas a estudiantes
=======
>>>>>>> 88751cb27e7e5b77bc17ac9e727630ae5435510f
        const listaCompleta = resp.estudiantes.map(est => {
          if (evIds[0]) est.ev1Id = evIds[0].evaluacionId;
          if (evIds[1]) est.ev2Id = evIds[1].evaluacionId;
          if (evIds[2]) est.ev3Id = evIds[2].evaluacionId;
=======
        // 1. Eliminar duplicados
        const estsMap = new Map<number, any>();
        resp.estudiantes.forEach(est => {
          if (!estsMap.has(est.estudianteId)) {
            estsMap.set(est.estudianteId, { ...est });
          }
        });

        // 2. Combinar con evaluaciones y notas
        const listaCompleta = Array.from(estsMap.values()).map(est => {
          if (evIds[0]) {
            est.ev1Id = evIds[0].evaluacionId;
            this.ev1Nombre.set(evIds[0].nombre);
          } else {
            this.ev1Nombre.set('EV 1');
          }

          if (evIds[1]) {
            est.ev2Id = evIds[1].evaluacionId;
            this.ev2Nombre.set(evIds[1].nombre);
          } else {
            this.ev2Nombre.set('EV 2');
          }

          if (evIds[2]) {
            est.ev3Id = evIds[2].evaluacionId;
            this.ev3Nombre.set(evIds[2].nombre);
          } else {
            this.ev3Nombre.set('EV 3');
          }
>>>>>>> Stashed changes

          const notaInfo = resp.notas.find(n => n.estudianteId === est.estudianteId);
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

        // 3. Ordenar A-Z
        listaCompleta.sort((a, b) => a.estudianteFullName.localeCompare(b.estudianteFullName));

        this.estudiantesDataSource.data = listaCompleta;
        const columns = ['rut', 'nombre'];
        if (evIds.length >= 1) columns.push('nota1');
        if (evIds.length >= 2) columns.push('nota2');
        if (evIds.length >= 3) columns.push('nota3');
        columns.push('promedio');
        this.estudiantesColumns.set(columns);

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
      }
    });
  }

  guardarNotas(): void {
    const listaEstudiantes = this.estudiantesDataSource.data;
    const notasParaGuardar: NotaPost[] = [];

    listaEstudiantes.forEach(est => {
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

    from(this.evaluationsApi.guardarNotasBulk(notasParaGuardar)).subscribe({
      next: () => {
        this.snackBar.open('¡Todas las calificaciones se guardaron con éxito!', 'Genial', {
          duration: 4000,
          panelClass: ['success-snackbar'],
          horizontalPosition: 'end',
          verticalPosition: 'top'
        });
        this.isLoadingEstudiantes.set(false);
        this.mostrarEstudiantes.set(false);
      },
      error: (err) => {
        showErrorSnack(this.snackBar, err);
        this.isLoadingEstudiantes.set(false);
      }
    });
  }

  cancelarEdicion(): void {
    this.mostrarEstudiantes.set(false);
  }
}
