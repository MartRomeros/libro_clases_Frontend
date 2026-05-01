import { Component, signal, inject, ChangeDetectorRef } from '@angular/core';
import { Router } from '@angular/router';
import { forkJoin, of } from 'rxjs';
import { catchError } from 'rxjs/operators';
import { MatCardModule } from '@angular/material/card';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
import { MatToolbarModule } from '@angular/material/toolbar';
import { MatDividerModule } from '@angular/material/divider';
import { MatListModule } from '@angular/material/list';
import { MatBadgeModule } from '@angular/material/badge';
import { MatChipsModule } from '@angular/material/chips';
import { MatTooltipModule } from '@angular/material/tooltip';
import { AuthService } from '../../../core/services/auth.service';
import { DocenteService, DocenteCurso, EstudianteCurso } from '../../../core/services/docente.service';
import { MatTableModule, MatTableDataSource } from '@angular/material/table';
import { MatProgressSpinnerModule } from '@angular/material/progress-spinner';
import { MatSnackBarModule, MatSnackBar } from '@angular/material/snack-bar';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';

interface OpcionDocente {
  titulo: string;
  descripcion: string;
  icono: string;
  ruta: string;
  color: string;
  badge?: number;
}

@Component({
  selector: 'app-docente-home',
  standalone: true,
  imports: [
    CommonModule,
    MatCardModule,
    MatButtonModule,
    MatIconModule,
    MatToolbarModule,
    MatDividerModule,
    MatListModule,
    MatBadgeModule,
    MatChipsModule,
    MatTooltipModule,
    MatTableModule,
    MatProgressSpinnerModule,
    MatSnackBarModule,
    FormsModule
  ],
  templateUrl: './docente-home.html',
  styleUrl: './docente-home.css',
})
export class DocenteHome {
  // Removido docenteNombre hardcoded

  opciones: OpcionDocente[] = [
    {
      titulo: 'Mis Cursos',
      descripcion: 'Gestiona tus cursos, asignaturas y evaluaciones asignadas.',
      icono: 'menu_book',
      ruta: 'action:mis-cursos',
      color: 'primary',
    },
    {
      titulo: 'Asistencia y Conducta',
      descripcion: 'Registra asistencia diaria y anotaciones de conducta de los estudiantes.',
      icono: 'fact_check',
      ruta: '/asistencia',
      color: 'accent',
    },
    {
      titulo: 'Evaluaciones y Notas',
      descripcion: 'Crea evaluaciones y registra las calificaciones de tus estudiantes.',
      icono: 'grading',
      ruta: '/docente/notas',
      color: 'primary',
    },
    {
      titulo: 'Mensajería',
      descripcion: 'Comunícate con apoderados, estudiantes y personal del colegio.',
      icono: 'forum',
      ruta: '/docente/mensajes',
      color: 'accent',
      badge: 3,
    },
  ];

  resumenRapido = [
    { etiqueta: 'Clases hoy', valor: '3', icono: 'today' },
    { etiqueta: 'Estudiantes', valor: '87', icono: 'group' },
    { etiqueta: 'Evaluaciones pendientes', valor: '2', icono: 'pending_actions' },
    { etiqueta: 'Mensajes sin leer', valor: '3', icono: 'mark_email_unread' },
  ];

  mostrarCursos = signal<boolean>(false);
  isLoadingCursos = signal<boolean>(false);
  
  // Tabla Cursos
  dataSource = new MatTableDataSource<DocenteCurso>([]);
  displayedColumns: string[] = ['curso', 'asignatura', 'anioAcademico', 'acciones'];

  // Tabla Estudiantes (Segunda tabla)
  estudiantesDataSource = new MatTableDataSource<EstudianteCurso>([]);
  estudiantesColumns: string[] = ['rut', 'nombre', 'nota1', 'nota2', 'nota3', 'promedio'];
  mostrarEstudiantes = signal<boolean>(false);
  isLoadingEstudiantes = signal<boolean>(false);
  cursoSeleccionado = signal<string>('');

  constructor(
    private router: Router,
    public authService: AuthService,
    private docenteService: DocenteService,
    private cdr: ChangeDetectorRef,
    private snackBar: MatSnackBar
  ) { 
    console.log('--- COMPONENTE DOCENTE_HOME V1.0.2 CARGADO ---');
  }

  get docenteNombre(): string {
    const user = this.authService.currentUser();
    return user?.name || 'Docente';
  }

  get userProfile(): string {
    const user = this.authService.currentUser();
    const nombre = user?.name || 'Usuario';
    const role = user?.role ? user.role.charAt(0).toUpperCase() + user.role.slice(1).toLowerCase() : 'Docente';
    return `${nombre} | ${role}`;
  }

  get saludoCompleto(): string {
    return `Docente, ${this.docenteNombre}`;
  }

  navegarA(opcion: OpcionDocente): void {
    const titulo = opcion.titulo.toLowerCase();
    
    // Detección más flexible por palabra clave
    if (titulo.includes('curso') || titulo.includes('clase') || opcion.ruta === 'action:mis-cursos') {
      this.cargarCursos();
      return;
    }
    
    this.router.navigate([opcion.ruta]);
  }

  cargarCursos(): void {
    console.log('--- INICIANDO CARGA DE CURSOS ---');
    this.mostrarCursos.set(true);
    
    let user = this.authService.currentUser();
    let docenteId = user?.id ? Number(user.id) : 2; // FORZAMOS ID 2 SI NO HAY OTRO
    
    console.log('Usando Docente ID:', docenteId);
    this.isLoadingCursos.set(true);

    this.docenteService.getCursos(docenteId).subscribe({
      next: (data) => {
        console.log('ÉXITO: Datos recibidos del back:');
        console.table(data); // <-- ESTO NOS MOSTRARÁ TODO CLARO
        this.dataSource.data = data;
        this.isLoadingCursos.set(false);
        
        // Pequeño retraso para asegurar que la tabla 'vea' las columnas
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
      estudiantes: this.docenteService.getEstudiantesPorCurso(curso.cursoId),
      evaluaciones: this.docenteService.getEvaluacionesPorCad(curso.cadId),
      notas: this.docenteService.getNotasPorCursoAsignatura(curso.cursoId, curso.asignaturaId).pipe(
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
        this.cdr.detectChanges();
        
        setTimeout(() => {
          document.getElementById('seccion-estudiantes')?.scrollIntoView({ behavior: 'smooth' });
        }, 100);
      },
      error: (err) => {
        console.error('Error al cargar datos:', err);
        this.isLoadingEstudiantes.set(false);
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

  guardarNotas(): void {
    const listaEstudiantes = this.estudiantesDataSource.data;
    const notasParaGuardar: any[] = [];

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
    
    this.docenteService.guardarNotasBulk(notasParaGuardar).subscribe({
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

  cerrarSesion(): void {
    this.router.navigate(['/login']);
  }
}
