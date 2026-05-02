import { Component, signal, inject, ChangeDetectorRef, OnInit } from '@angular/core';
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
import { FormsModule, ReactiveFormsModule, FormBuilder, FormGroup, Validators } from '@angular/forms';
import { DocenteService, DocenteCurso, EstudianteCurso, Evaluacion } from '../../core/services/docente.service';
import { AuthService } from '../../core/services/auth.service';
import { forkJoin, of } from 'rxjs';
import { catchError } from 'rxjs/operators';

@Component({
  selector: 'app-evaluations',
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
    ReactiveFormsModule
  ],
  templateUrl: './evaluations.html',
  styleUrl: './evaluations.css'
})
export class Evaluations {
  private docenteService = inject(DocenteService);
  private authService = inject(AuthService);
  private snackBar = inject(MatSnackBar);
  private fb = inject(FormBuilder);
  private cdr = inject(ChangeDetectorRef);
  private router = inject(Router);

  cursos = signal<DocenteCurso[]>([]);
  cursoSeleccionado = signal<DocenteCurso | null>(null);
  isLoading = signal<boolean>(false);
  isLoadingData = signal<boolean>(false);

  evaluaciones = signal<Evaluacion[]>([]);
  estudiantes = signal<any[]>([]);

  evaluacionForm: FormGroup;
  mostrarFormNuevaEv = signal<boolean>(false);
  
  // Fecha mínima para el calendario (hoy)
  hoy = new Date();

  dataSource = new MatTableDataSource<any>([]);
  displayedColumns = signal<string[]>(['nombre']);

  constructor() {
    this.evaluacionForm = this.fb.group({
      nombre: ['', [Validators.required, Validators.minLength(3)]],
      fechaEvaluacion: [new Date().toISOString().split('T')[0], Validators.required]
    });
    this.cargarCursos();
  }

  ngOnInit(): void {}

  irAHome(): void {
    this.router.navigate(['/docente']);
  }

  get userProfile(): string {
    const user = this.authService.currentUser();
    const nombre = user?.name || 'Usuario';
    const role = user?.role ? user.role.charAt(0).toUpperCase() + user.role.slice(1).toLowerCase() : 'Docente';
    return `${nombre} | ${role}`;
  }

  cerrarSesion(): void {
    this.authService.logout();
    this.router.navigate(['/login']);
  }

  esFutura(fechaStr: string): boolean {
    const fechaEv = new Date(fechaStr + 'T00:00:00');
    const hoy = new Date();
    hoy.setHours(0, 0, 0, 0);
    return fechaEv >= hoy;
  }

  cargarCursos(): void {
    const user = this.authService.currentUser();
    const docenteId = user?.id ? Number(user.id) : 2;
    this.isLoading.set(true);
    this.docenteService.getCursos(docenteId).subscribe({
      next: (data) => {
        this.cursos.set(data);
        this.isLoading.set(false);
      },
      error: (err) => {
        console.error('Error cargando cursos:', err);
        this.isLoading.set(false);
      }
    });
  }

  onCursoChange(curso: DocenteCurso): void {
    this.cursoSeleccionado.set(curso);
    this.cargarDatosCurso(curso);
  }

  cargarDatosCurso(curso: DocenteCurso): void {
    this.isLoadingData.set(true);
    forkJoin({
      estudiantes: this.docenteService.getEstudiantesPorCurso(curso.cursoId),
      evaluaciones: this.docenteService.getEvaluacionesPorCad(curso.cadId),
      notas: this.docenteService.getNotasPorCursoAsignatura(curso.cursoId, curso.asignaturaId).pipe(
        catchError(() => of([]))
      )
    }).subscribe({
      next: (resp) => {
        this.evaluaciones.set(resp.evaluaciones);
        
        // Configurar columnas dinámicas
        const columns = ['nombre'];
        resp.evaluaciones.forEach(ev => {
          columns.push(`ev_${ev.evaluacionId}`);
        });
        columns.push('promedio');
        this.displayedColumns.set(columns);

        // Mapear datos para la tabla
        const tabla = resp.estudiantes.map(est => {
          const row: any = { 
            id: est.estudianteId,
            nombre: est.estudianteFullName,
            promedio: 0
          };
          
          let suma = 0;
          let cont = 0;

          resp.evaluaciones.forEach(ev => {
            const nota = resp.notas.find(n => n.estudianteId === est.estudianteId && 
              (n.ev1Id === ev.evaluacionId || n.ev2Id === ev.evaluacionId || n.ev3Id === ev.evaluacionId));
            
            let valor = null;
            if (nota) {
              if (nota.ev1Id === ev.evaluacionId) valor = nota.notaEv1;
              else if (nota.ev2Id === ev.evaluacionId) valor = nota.notaEv2;
              else if (nota.ev3Id === ev.evaluacionId) valor = nota.notaEv3;
            }
            
            row[`ev_${ev.evaluacionId}`] = valor;
            if (valor) {
              suma += valor;
              cont++;
            }
          });

          row.promedio = cont > 0 ? (suma / cont).toFixed(1) : '-';
          return row;
        });

        this.dataSource.data = tabla;
        this.isLoadingData.set(false);
      },
      error: (err) => {
        console.error('Error cargando datos del curso:', err);
        this.isLoadingData.set(false);
      }
    });
  }

  crearEvaluacion(): void {
    if (this.evaluacionForm.invalid || !this.cursoSeleccionado()) return;

    // Formatear fecha a YYYY-MM-DD
    const fechaRaw = this.evaluacionForm.value.fechaEvaluacion;
    let fechaStr = '';
    
    if (fechaRaw instanceof Date) {
      fechaStr = fechaRaw.toISOString().split('T')[0];
    } else {
      fechaStr = fechaRaw; // Por si acaso sigue siendo string
    }

    const nueva: Evaluacion = {
      cadId: this.cursoSeleccionado()!.cadId,
      nombre: this.evaluacionForm.value.nombre,
      fechaEvaluacion: fechaStr
    };

    this.docenteService.guardarEvaluacion(nueva).subscribe({
      next: () => {
        this.snackBar.open('✓ Evaluación creada con éxito', 'Cerrar', { duration: 3000 });
        this.evaluacionForm.reset();
        this.mostrarFormNuevaEv.set(false);
        this.cargarDatosCurso(this.cursoSeleccionado()!);
      },
      error: (err) => {
        console.error('Error al crear evaluación:', err);
        this.snackBar.open('Error al crear evaluación', 'Cerrar', { duration: 3000 });
      }
    });
  }
}
