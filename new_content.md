## TS

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
}

# CSS

* ===================== CONTENEDOR PRINCIPAL ===================== */
.docente-container {
  max-width: 1100px;
  margin: 0 auto;
  padding: 28px 20px 60px;
}

/* ===================== BIENVENIDA ===================== */
.bienvenida {
  margin-bottom: 36px;
}

.bienvenida-content {
  display: flex;
  align-items: center;
  gap: 20px;
}

.avatar-circle {
  width: 72px;
  height: 72px;
  border-radius: 50%;
  background-color: var(--mat-sys-primary-container, #dce8ff);
  display: flex;
  align-items: center;
  justify-content: center;
  flex-shrink: 0;
}

.avatar-icon {
  font-size: 40px;
  width: 40px;
  height: 40px;
  color: var(--mat-sys-on-primary-container, #001d36);
}

.bienvenida-titulo {
  margin: 0 0 6px;
  font-size: 1.8rem;
  font-weight: 700;
  line-height: 1.2;
}

.bienvenida-subtitulo {
  margin: 0;
  font-size: 0.95rem;
  opacity: 0.65;
}

/* ===================== TÍTULOS DE SECCIÓN ===================== */
.section-title {
  font-size: 1rem;
  font-weight: 600;
  text-transform: uppercase;
  letter-spacing: 0.8px;
  opacity: 0.55;
  margin: 0 0 16px;
}

/* ===================== RESUMEN RÁPIDO ===================== */
.resumen-section {
  margin-bottom: 36px;
}

.resumen-grid {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(180px, 1fr));
  gap: 16px;
}

.resumen-card {
  cursor: default;
  transition: box-shadow 0.2s ease;
}

.resumen-card:hover {
  box-shadow: 0 4px 16px rgba(0, 0, 0, 0.12);
}

.resumen-card-content {
  display: flex;
  align-items: center;
  gap: 16px;
  padding: 20px 16px !important;
}

.resumen-icono {
  font-size: 32px;
  width: 32px;
  height: 32px;
  flex-shrink: 0;
}

.resumen-info {
  display: flex;
  flex-direction: column;
}

.resumen-valor {
  font-size: 1.7rem;
  font-weight: 700;
  line-height: 1;
}

.resumen-etiqueta {
  font-size: 0.8rem;
  opacity: 0.6;
  margin-top: 4px;
}

/* ===================== OPCIONES / HERRAMIENTAS ===================== */
.opciones-section {
  margin-top: 36px;
}

.opciones-grid {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(290px, 1fr));
  gap: 16px;
}

.opcion-card {
  cursor: pointer;
  transition: box-shadow 0.2s ease, transform 0.15s ease;
  outline: none;
}

.opcion-card:hover,
.opcion-card:focus {
  box-shadow: 0 6px 24px rgba(0, 0, 0, 0.14);
  transform: translateY(-2px);
}

.opcion-card-content {
  display: flex;
  align-items: center;
  gap: 16px;
  padding: 20px !important;
}

.opcion-icon-wrapper {
  width: 52px;
  height: 52px;
  border-radius: 12px;
  display: flex;
  align-items: center;
  justify-content: center;
  flex-shrink: 0;
}

.icon-primary {
  background-color: var(--mat-sys-primary-container, #dce8ff);
}

.icon-accent {
  background-color: var(--mat-sys-secondary-container, #ddeeff);
}

.opcion-icono {
  font-size: 26px;
  width: 26px;
  height: 26px;
}

.icon-primary .opcion-icono {
  color: var(--mat-sys-primary, #1565c0);
}

.icon-accent .opcion-icono {
  color: var(--mat-sys-secondary, #0077b6);
}

.opcion-texto {
  flex: 1;
}

.opcion-titulo {
  margin: 0 0 4px;
  font-size: 1rem;
  font-weight: 600;
}

.opcion-descripcion {
  margin: 0;
  font-size: 0.83rem;
  opacity: 0.6;
  line-height: 1.4;
}

.opcion-chevron {
  opacity: 0.35;
  flex-shrink: 0;
}

/* ===================== DIVIDER ===================== */
mat-divider {
  margin: 8px 0;
}

/* ===================== SECCIÓN CURSOS (DINÁMICA) ===================== */
.cursos-section {
  margin-top: 48px;
  animation: slideUp 0.4s ease-out;
}

@keyframes slideUp {
  from { opacity: 0; transform: translateY(20px); }
  to { opacity: 1; transform: translateY(0); }
}

.section-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 16px;
}

.cursos-card {
  border-radius: 12px;
  border: 1px solid rgba(0, 0, 0, 0.08);
  box-shadow: 0 4px 12px rgba(0, 0, 0, 0.05);
  overflow: hidden;
}

.loading-cursos {
  display: flex;
  flex-direction: column;
  align-items: center;
  padding: 40px;
  gap: 16px;
  color: #666;
}

.table-container {
  overflow-x: auto;
}

.tabla-premium {
  width: 100%;
  border-collapse: collapse;
}

.tabla-premium th.mat-mdc-header-cell {
  background-color: #fcfcfc;
  font-weight: 600;
  color: #222;
  font-size: 0.9rem;
  padding: 16px;
  border-bottom: 2px solid #f0f0f0;
}

.tabla-premium td.mat-mdc-cell {
  padding: 16px;
  font-size: 0.9rem;
  color: #444;
  border-bottom: 1px solid #f5f5f5;
}

.tabla-premium tr.mat-mdc-row:hover {
  background-color: #fafafa;
}

.badge-curso {
  background-color: #eef2ff;
  color: #3730a3;
  padding: 4px 12px;
  border-radius: 20px;
  font-weight: 500;
  font-size: 0.85rem;
  border: 1px solid #e0e7ff;
}

.no-cursos {
  text-align: center;
  padding: 40px;
  color: #888;
}

.no-cursos mat-icon {
  font-size: 48px;
  width: 48px;
  height: 48px;
  margin-bottom: 8px;
  opacity: 0.4;
}

/* Estilos para Notas */
.nota-input {
  width: 60px;
  padding: 6px;
  border: 1px solid #ddd;
  border-radius: 4px;
  text-align: center;
  font-weight: 600;
  color: #333;
  transition: all 0.3s ease;
}

.nota-input:focus {
  outline: none;
  border-color: #1976d2;
  box-shadow: 0 0 5px rgba(25, 118, 210, 0.2);
  background-color: #f0f7ff;
}

/* Chrome, Safari, Edge, Opera */
.nota-input::-webkit-outer-spin-button,
.nota-input::-webkit-inner-spin-button {
  -webkit-appearance: none;
  margin: 0;
}

/* Firefox */
.nota-input[type=number] {
  -moz-appearance: textfield;
}

.promedio-badge {
  background-color: #e8f5e9;
  color: #2e7d32;
  padding: 6px 12px;
  border-radius: 20px;
  font-weight: 700;
  font-size: 0.9rem;
  display: inline-block;
  min-width: 50px;
}

.promedio-badge.reprobado {
  background-color: #ffebee;
  color: #c62828;
}

.estudiantes-actions {
  display: flex;
  justify-content: flex-end;
  gap: 16px;
  margin-top: 24px;
  padding-top: 16px;
  border-top: 1px solid #eee;
}

.debug-hint {
  font-size: 0.75rem;
  opacity: 0.7;
  margin-top: 4px;
  color: #d32f2f;
}

/* ===================== RESPONSIVE ===================== */
@media (max-width: 600px) {
  .bienvenida-titulo {
    font-size: 1.4rem;
  }

  .docente-container {
    padding: 20px 12px 40px;
  }

  .resumen-grid {
    grid-template-columns: repeat(2, 1fr);
  }
}

.text-center {
  text-align: center !important;
}

.tabla-premium button[mat-icon-button] {
  transition: transform 0.2s ease;
}

.tabla-premium button[mat-icon-button]:hover {
  transform: scale(1.1);
  background-color: rgba(63, 81, 181, 0.05);
}

/* ===================== SECCIÓN ESTUDIANTES ===================== */
.estudiantes-section {
  margin-top: 32px;
  margin-bottom: 64px;
  animation: fadeIn 0.5s ease-out;
}

@keyframes fadeIn {
  from { opacity: 0; }
  to { opacity: 1; }
}

.header-with-subtitle {
  display: flex;
  flex-direction: column;
}

.section-subtitle {
  font-size: 0.9rem;
  color: var(--mat-sys-primary, #1565c0);
  font-weight: 500;
  margin-top: -4px;
}

.estudiantes-card {
  border-radius: 12px;
  border-left: 4px solid var(--mat-sys-primary, #1565c0);
  background-color: #fff;
}

/* ===================== NOTIFICACIONES (SNACKBAR) ===================== */
::ng-deep .success-snackbar {
  --mdc-snackbar-container-color: #1565c0;
  --mdc-snackbar-label-text-color: #ffffff;
  --mat-snack-bar-button-color: #ffffff;
}

::ng-deep .error-snackbar {
  --mdc-snackbar-container-color: #d32f2f;
  --mdc-snackbar-label-text-color: #ffffff;
  --mat-snack-bar-button-color: #ffffff;
}

::ng-deep .mat-mdc-snack-bar-container .mdc-snackbar__label {
  font-family: 'Inter', sans-serif !important;
  font-weight: 500 !important;
  font-size: 0.95rem !important;
}

::ng-deep .mat-mdc-snack-bar-container {
  margin-top: 20px !important;
}



# html

<mat-toolbar color="primary" class="toolbar">
  <!-- Version: 1.0.2 - Forcing Refresh -->
  <mat-icon class="toolbar-icon">school</mat-icon>
  <span class="toolbar-title">Libro de Clases</span>
  <span class="spacer"></span>
  <span class="user-profile-text">{{ userProfile }}</span>
  <button mat-icon-button matTooltip="Cerrar sesión" (click)="cerrarSesion()">
    <mat-icon>logout</mat-icon>
  </button>
</mat-toolbar>

<div class="docente-container">

  <!-- Header de bienvenida -->
  <section class="bienvenida">
    <div class="bienvenida-content">
      <div class="avatar-circle">
        <mat-icon class="avatar-icon">person</mat-icon>
      </div>
      <div class="bienvenida-texto">
        <h1 class="bienvenida-titulo">Bienvenido {{ saludoCompleto }}</h1>
        <p class="bienvenida-subtitulo">Panel de gestión docente — Colegio Bernardo O'Higgins</p>
      </div>
    </div>
  </section>

  <!-- Resumen rápido -->
  <section class="resumen-section">
    <h2 class="section-title">Resumen del día</h2>
    <div class="resumen-grid">
      @for (item of resumenRapido; track item.etiqueta) {
      <mat-card class="resumen-card" appearance="outlined">
        <mat-card-content class="resumen-card-content">
          <mat-icon class="resumen-icono" color="primary">{{ item.icono }}</mat-icon>
          <div class="resumen-info">
            <span class="resumen-valor">{{ item.valor }}</span>
            <span class="resumen-etiqueta">{{ item.etiqueta }}</span>
          </div>
        </mat-card-content>
      </mat-card>
      }
    </div>
  </section>

  <mat-divider></mat-divider>

  <!-- Opciones principales -->
  <section class="opciones-section">
    <h2 class="section-title">Mis herramientas</h2>
    <div class="opciones-grid">
      @for (opcion of opciones; track opcion.titulo) {
      <mat-card class="opcion-card" (click)="navegarA(opcion)" tabindex="0" (keydown.enter)="navegarA(opcion)">
        <mat-card-content class="opcion-card-content">
          <div class="opcion-icon-wrapper" [class]="'icon-' + opcion.color">
            @if (opcion.badge) {
            <mat-icon [matBadge]="opcion.badge" matBadgeColor="warn" class="opcion-icono">
              {{ opcion.icono }}
            </mat-icon>
            } @else {
            <mat-icon class="opcion-icono">{{ opcion.icono }}</mat-icon>
            }
          </div>
          <div class="opcion-texto">
            <h3 class="opcion-titulo">{{ opcion.titulo }}</h3>
            <p class="opcion-descripcion">{{ opcion.descripcion }}</p>
          </div>
          <mat-icon class="opcion-chevron">chevron_right</mat-icon>
        </mat-card-content>
      </mat-card>
      }
    </div>
  </section>

  <!-- Sección Dinámica: Mis Cursos -->
  <section id="seccion-cursos" class="cursos-section" [style.display]="mostrarCursos() ? 'block' : 'none'">
    <div class="section-header">
      <h2 class="section-title">Mis Cursos Asignados</h2>
      <button mat-icon-button (click)="mostrarCursos.set(false)" matTooltip="Cerrar">
        <mat-icon>close</mat-icon>
      </button>
    </div>

    <mat-card class="cursos-card" appearance="outlined">
      <mat-card-content>
        <!-- Loader -->
        <div class="loading-cursos" [hidden]="!isLoadingCursos()">
          <mat-progress-spinner mode="indeterminate" diameter="40"></mat-progress-spinner>
          <p>Obteniendo cursos desde BackGestion...</p>
        </div>

        <!-- Tabla (Siempre en el DOM, pero oculta si carga o no hay datos) -->
        <div class="table-container" [hidden]="isLoadingCursos() || dataSource.data.length === 0">
          <table mat-table [dataSource]="dataSource" class="tabla-premium">

            <!-- Columna Curso -->
            <ng-container matColumnDef="curso">
              <th mat-header-cell *matHeaderCellDef> Curso </th>
              <td mat-cell *matCellDef="let element">
                <span class="badge-curso">{{ element.curso }}</span>
              </td>
            </ng-container>

            <!-- Columna Asignatura -->
            <ng-container matColumnDef="asignatura">
              <th mat-header-cell *matHeaderCellDef> Asignatura </th>
              <td mat-cell *matCellDef="let element"> {{ element.asignaturaNombre }} </td>
            </ng-container>

            <!-- Columna Año -->
            <ng-container matColumnDef="anioAcademico">
              <th mat-header-cell *matHeaderCellDef> Año Académico </th>
              <td mat-cell *matCellDef="let element"> {{ element.anioAcademico }} </td>
            </ng-container>

            <!-- Columna Ver Curso (Alumnos) -->
            <ng-container matColumnDef="acciones">
              <th mat-header-cell *matHeaderCellDef class="text-center"> Ver Curso </th>
              <td mat-cell *matCellDef="let element" class="text-center">
                <button mat-icon-button color="primary" (click)="verDetalleCurso(element)"
                  matTooltip="Ver lista de alumnos">
                  <mat-icon (click)="verDetalleCurso(element)">visibility</mat-icon>
                </button>
              </td>
            </ng-container>

            <tr mat-header-row *matHeaderRowDef="displayedColumns"></tr>
            <tr mat-row *matRowDef="let row; columns: displayedColumns"></tr>
          </table>
        </div>

        <!-- Mensaje de no datos -->
        <div class="no-cursos" [hidden]="isLoadingCursos() || dataSource.data.length > 0">
          <mat-icon>event_busy</mat-icon>
          <p>No se encontraron cursos asignados para el ID: {{ authService.currentUser()?.id || 'Desconocido' }}</p>
          <p class="debug-hint">Verifica que este ID sea el correcto en la base de datos de docentes.</p>
        </div>
      </mat-card-content>
    </mat-card>
  </section>

  <!-- SECCIÓN ESTUDIANTES (Segunda Inteligencia) -->
  <section id="seccion-estudiantes" class="estudiantes-section"
    [style.display]="mostrarEstudiantes() ? 'block' : 'none'">
    <div class="section-header">
      <div class="header-with-subtitle">
        <h2 class="section-title">Lista de Alumnos</h2>
        <span class="section-subtitle">{{ cursoSeleccionado() }}</span>
      </div>
      <button mat-icon-button (click)="mostrarEstudiantes.set(false)" matTooltip="Cerrar">
        <mat-icon>close</mat-icon>
      </button>
    </div>

    <mat-card class="estudiantes-card" appearance="outlined">
      <mat-card-content>
        @if (isLoadingEstudiantes()) {
        <div class="loading-cursos">
          <mat-progress-spinner mode="indeterminate" diameter="40"></mat-progress-spinner>
          <p>Obteniendo lista de estudiantes...</p>
        </div>
        } @else {
        <div class="table-container">
          <table mat-table [dataSource]="estudiantesDataSource" class="tabla-premium">

            <ng-container matColumnDef="rut">
              <th mat-header-cell *matHeaderCellDef> RUT </th>
              <td mat-cell *matCellDef="let element"> {{ element.rut }} </td>
            </ng-container>

            <ng-container matColumnDef="nombre">
              <th mat-header-cell *matHeaderCellDef> Nombre Completo </th>
              <td mat-cell *matCellDef="let element"> {{ element.estudianteFullName }} </td>
            </ng-container>

            <!-- Nota 1 -->
            <ng-container matColumnDef="nota1">
              <th mat-header-cell *matHeaderCellDef class="text-center"> EV 1 </th>
              <td mat-cell *matCellDef="let element" class="text-center">
                <input type="number" [(ngModel)]="element.nota1" (input)="actualizarPromedio(element)" min="1" max="7"
                  step="0.1" class="nota-input">
              </td>
            </ng-container>

            <!-- Nota 2 -->
            <ng-container matColumnDef="nota2">
              <th mat-header-cell *matHeaderCellDef class="text-center"> EV 2 </th>
              <td mat-cell *matCellDef="let element" class="text-center">
                <input type="number" [(ngModel)]="element.nota2" (input)="actualizarPromedio(element)" min="1" max="7"
                  step="0.1" class="nota-input">
              </td>
            </ng-container>

            <!-- Nota 3 -->
            <ng-container matColumnDef="nota3">
              <th mat-header-cell *matHeaderCellDef class="text-center"> EV 3 </th>
              <td mat-cell *matCellDef="let element" class="text-center">
                <input type="number" [(ngModel)]="element.nota3" (input)="actualizarPromedio(element)" min="1" max="7"
                  step="0.1" class="nota-input">
              </td>
            </ng-container>

            <!-- Promedio -->
            <ng-container matColumnDef="promedio">
              <th mat-header-cell *matHeaderCellDef class="text-center"> Promedio </th>
              <td mat-cell *matCellDef="let element" class="text-center">
                <span class="promedio-badge" [class.reprobado]="(element.promedio || 0) < 4">
                  {{ element.promedio || '0.0' }}
                </span>
              </td>
            </ng-container>

            <tr mat-header-row *matHeaderRowDef="estudiantesColumns"></tr>
            <tr mat-row *matRowDef="let row; columns: estudiantesColumns"></tr>
          </table>
        </div>

        <!-- Botones de Acción -->
        <div class="estudiantes-actions">
          <button mat-button color="warn" (click)="cancelarEdicion()">
            <mat-icon>close</mat-icon>
            Cancelar
          </button>
          <button mat-flat-button color="primary" (click)="guardarNotas()">
            <mat-icon>save</mat-icon>
            Guardar Cambios
          </button>
        </div>
        }
      </mat-card-content>
    </mat-card>
  </section>

</div>


## SERVICES

import { Injectable, inject } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { environment } from '../../../environments/environment';

export interface DocenteCurso {
  docente: string;
  asignaturaNombre: string;
  curso: string;
  anioAcademico: number;
  cursoId: number;
  asignaturaId: number;
  cadId: number;
}

export interface EstudianteCurso {
  cursoNombre: string;
  anioAcademico: number;
  asignatura: string;
  rut: string;
  estudianteFullName: string;
  docenteACargo: string;
  estudianteId: number;
  // IDs de evaluaciones y notas para poder guardar
  ev1?: string;
  ev1Id?: number;
  nota1?: number;
  nota1Id?: number;
  ev2?: string;
  ev2Id?: number;
  nota2?: number;
  nota2Id?: number;
  ev3?: string;
  ev3Id?: number;
  nota3?: number;
  nota3Id?: number;
  promedio?: number;
}

export interface NotaRespuesta {
  estudianteId: number;
  ev1?: string;
  ev1Id?: number;
  notaEv1?: number;
  nota1Id?: number;
  ev2?: string;
  ev2Id?: number;
  notaEv2?: number;
  nota2Id?: number;
  ev3?: string;
  ev3Id?: number;
  notaEv3?: number;
  nota3Id?: number;
  promedio?: number;
}

export interface NotaPost {
  notaId?: number;
  evaluacionId: number;
  estudianteId: number;
  valor: number;
}

export interface AsistenciaPost {
  estudianteId: number;
  cursoId: number;
  fecha: string; // Formato YYYY-MM-DD
  estado: string; // Presente, Ausente, etc.
  tipoAsistencia: string; // Presencial, etc.
}

export interface AnotacionPost {
  estudianteId: number;
  docenteId: number;
  tipo: string; // Positiva, Negativa, Informativa
  descripcion: string;
  fechaRegistro: string; // Formato ISO o YYYY-MM-DD
}

export interface Evaluacion {
  evaluacionId?: number;
  cadId: number;
  nombre: string;
  fechaEvaluacion: string;
}

@Injectable({
  providedIn: 'root'
})
export class DocenteService {
  private http = inject(HttpClient);
  private apiUrl = `${environment.backGestionUrl}`;

  getCursos(docenteId: number): Observable<DocenteCurso[]> {
    const url = `${this.apiUrl}/docentes/${docenteId}/cursos`;
    console.log('LLAMANDO A API DOCENTE:', url);
    return this.http.get<DocenteCurso[]>(url);
  }

  getEstudiantesPorCurso(cursoId: number): Observable<EstudianteCurso[]> {
    const url = `${this.apiUrl}/estudiantes/curso/${cursoId}`;
    console.log('LLAMANDO A API ESTUDIANTES:', url);
    return this.http.get<EstudianteCurso[]>(url);
  }

  getNotasPorCursoAsignatura(cursoId: number, asignaturaId: number): Observable<NotaRespuesta[]> {
    const url = `${this.apiUrl}/notas/curso/${cursoId}/asignatura/${asignaturaId}`;
    console.log('LLAMANDO A API NOTAS:', url);
    return this.http.get<NotaRespuesta[]>(url);
  }

  guardarNota(nota: NotaPost): Observable<any> {
    const url = `${this.apiUrl}/notas`;
    return this.http.post(url, nota);
  }

  guardarNotasBulk(notas: NotaPost[]): Observable<any[]> {
    const url = `${this.apiUrl}/notas/bulk`;
    return this.http.post<any[]>(url, notas);
  }

  guardarAsistencias(asistencias: AsistenciaPost[]): Observable<any> {
    const url = `${this.apiUrl}/asistencias/bulk`; // Ajustado para guardado masivo
    return this.http.post(url, asistencias);
  }

  guardarAnotacion(anotacion: AnotacionPost): Observable<any> {
    const url = `${this.apiUrl}/anotaciones`;
    return this.http.post(url, anotacion);
  }

  getAnotacionesPorEstudiante(estudianteId: number): Observable<any[]> {
    const url = `${this.apiUrl}/anotaciones/estudiante/${estudianteId}`;
    return this.http.get<any[]>(url);
  }

  getEvaluacionesPorCad(cadId: number): Observable<Evaluacion[]> {
    return this.http.get<Evaluacion[]>(`${this.apiUrl}/evaluaciones/cad/${cadId}`);
  }

  getNotasEstudiante(estudianteId: number): Observable<any[]> {
    return this.http.get<any[]>(`${this.apiUrl}/notas/estudiante/${estudianteId}`);
  }

  guardarEvaluacion(evaluacion: Evaluacion): Observable<Evaluacion> {
    return this.http.post<Evaluacion>(`${this.apiUrl}/evaluaciones`, evaluacion);
  }
}

