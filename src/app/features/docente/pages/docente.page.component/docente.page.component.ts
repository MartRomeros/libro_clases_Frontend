import { ChangeDetectorRef, Component, computed, inject, signal } from '@angular/core';
import { Resumen } from '../../models/resumen.docente.model';
import { OpcionDocente } from '../../models/menu.options.model';
import { Navbar } from '../../../../layout/navbar/navbar';
import { CommonModule } from '@angular/common';
import { MatIconModule } from '@angular/material/icon';
import { Router } from '@angular/router';
import { AuthStore } from '../../../auth/data-access/auth.store';
import { MatCardModule } from '@angular/material/card';
import { MatDividerModule } from '@angular/material/divider';
import { MatBadgeModule } from '@angular/material/badge';
import { MatButtonModule } from '@angular/material/button';
import { MatSnackBar } from '@angular/material/snack-bar';
import { AuthQueries } from '../../../auth/data-access/auth.queries';
import { injectQuery } from '@tanstack/angular-query-experimental';
import { MatProgressSpinnerModule } from '@angular/material/progress-spinner';
import { MatTableDataSource, MatTableModule } from '@angular/material/table';
import { DocenteCurso, EstudianteCurso, NotaPost } from '../../models/evaluations.model';
import { EvaluationsApi } from '../../data-access/evaluations.api';
import { catchError, forkJoin, from, of } from 'rxjs';
import { FormsModule } from '@angular/forms';

@Component({
  selector: 'app-docente.page.component',
  imports: [
    Navbar,
    CommonModule,
    MatIconModule,
    MatCardModule,
    MatDividerModule,
    MatBadgeModule,
    MatButtonModule,
    MatProgressSpinnerModule,
    MatTableModule,
    FormsModule
  ],
  templateUrl: './docente.page.component.html',
  styleUrl: './docente.page.component.css',
})
export class DocentePageComponent {

  private readonly router = inject(Router)
  readonly authStore = inject(AuthStore)
  private readonly authQueries = inject(AuthQueries)
  private readonly evaluationsApi = inject(EvaluationsApi)
  private readonly snackBar = inject(MatSnackBar)
  private queryProfile = injectQuery(() => this.authQueries.me())

  profile = computed(() => this.queryProfile.data() || this.authStore.currentUser())

  loading = computed(() => this.queryProfile.isPending())

  fullName = computed(() => {
    const p = this.profile();
    if (!p) return '';
    const parts = [p.nombre, p.apellido_paterno, p.apellido_materno].filter(Boolean);
    return parts.join(' ');
  });

  mostrarCursos = signal<boolean>(false);
  isLoadingCursos = signal<boolean>(false);
  cursoSeleccionado = signal<string>('');
  mostrarEstudiantes = signal<boolean>(false);
  isLoadingEstudiantes = signal<boolean>(false);

  dataSource = new MatTableDataSource<DocenteCurso>([]);
  estudiantesDataSource = new MatTableDataSource<EstudianteCurso>([]);
  estudiantesColumns: string[] = ['rut', 'nombre', 'nota1', 'nota2', 'nota3', 'promedio'];
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
    console.log('--- INICIANDO CARGA DE CURSOS ---');
    this.mostrarCursos.set(true);

    const docenteId = this.profile()?.usuario_id ?? 0;
    if (!docenteId) {
      console.error('No se pudo resolver el docenteId desde el perfil autenticado.');
      this.isLoadingCursos.set(false);
      return;
    }

    console.log('Usando Docente ID:', docenteId);
    this.isLoadingCursos.set(true);

    from(this.evaluationsApi.getCursos(docenteId)).subscribe({
      next: (data: DocenteCurso[]) => {
        console.log('ÉXITO: Datos recibidos del back:');
        console.table(data); // <-- ESTO NOS MOSTRARÁ TODO CLARO
        this.dataSource.data = data;
        this.isLoadingCursos.set(false);

        setTimeout(() => {
          this.cdr.detectChanges();
          const element = document.getElementById('seccion-cursos');
          if (element) element.scrollIntoView({ behavior: 'smooth' });
        }, 50);
      },
      error: (err) => {
        console.error('ERROR CRÍTICO AL LLAMAR API:', err);
        this.isLoadingCursos.set(false);
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
    console.log('--- CLICK EN VER CURSO ---');
    console.log('Objeto curso recibido:', curso);

    if (!curso.cursoId) {
      console.error('ERROR: El objeto curso no tiene cursoId. Verifica el backend.');
      alert('Error: No se pudo obtener el ID del curso para cargar los alumnos.');
      return;
    }

    this.cursoSeleccionado.set(`${curso.curso} - ${curso.asignaturaNombre}`);
    this.mostrarEstudiantes.set(true);
    this.isLoadingEstudiantes.set(true);

    console.log(`Cargando Alumnos y Notas para Curso: ${curso.cursoId}, Asignatura: ${curso.asignaturaId}`);

    forkJoin({
      estudiantes: from(this.evaluationsApi.getEstudiantesPorCurso(curso.cursoId)),
      evaluaciones: from(this.evaluationsApi.getEvaluacionesPorCad(curso.cadId)),
      notas: from(this.evaluationsApi.getNotasPorCursoAsignatura(curso.cursoId, curso.asignaturaId)).pipe(
        catchError(err => {
          console.warn('No se pudieron cargar las notas, se mostrarán campos vacíos:', err);
          return of([]);
        })
      )
    }).subscribe({
      next: (resp) => {
        // Obtener los IDs de las evaluaciones disponibles (máximo 3 para esta vista simplificada)
        const evIds = resp.evaluaciones
          .sort((a, b) => new Date(a.fechaEvaluacion).getTime() - new Date(b.fechaEvaluacion).getTime())
          .slice(0, 3);

        // Mapear notas a estudiantes
        const listaCompleta = resp.estudiantes.map(est => {
          // Asignar IDs de evaluación base por si no tienen notas aún
          if (evIds[0]) est.ev1Id = evIds[0].evaluacionId;
          if (evIds[1]) est.ev2Id = evIds[1].evaluacionId;
          if (evIds[2]) est.ev3Id = evIds[2].evaluacionId;

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

        this.estudiantesDataSource.data = listaCompleta;
        this.isLoadingEstudiantes.set(false);

        setTimeout(() => {
          this.cdr.detectChanges();
          document.getElementById('seccion-estudiantes')?.scrollIntoView({ behavior: 'smooth' });
        }, 100);
      },
      error: (err) => {
        console.error('Error al cargar datos:', err);
        this.isLoadingEstudiantes.set(false);
      }
    });
  }

  guardarNotas(): void {
    const listaEstudiantes = this.estudiantesDataSource.data;
    const notasParaGuardar: NotaPost[] = [];

    listaEstudiantes.forEach(est => {
      // Nota 1
      if (est.ev1Id && est.nota1 != null && est.nota1 > 0) {
        notasParaGuardar.push({
          notaId: est.nota1Id,
          evaluacionId: est.ev1Id,
          estudianteId: est.estudianteId,
          valor: est.nota1
        });
      }
      // Nota 2
      if (est.ev2Id && est.nota2 != null && est.nota2 > 0) {
        notasParaGuardar.push({
          notaId: est.nota2Id,
          evaluacionId: est.ev2Id,
          estudianteId: est.estudianteId,
          valor: est.nota2
        });
      }
      // Nota 3
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
        console.error('Error al guardar masivamente:', err);
        this.snackBar.open('Error al guardar. Verifica tu conexión.', 'Entendido', {
          duration: 5000,
          panelClass: ['error-snackbar']
        });
        this.isLoadingEstudiantes.set(false);
      }
    });
  }

  cancelarEdicion(): void {
    this.mostrarEstudiantes.set(false);
  }



}
