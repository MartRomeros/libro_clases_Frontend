import { Component, signal, input, effect, inject } from '@angular/core';
import { MatCardModule } from '@angular/material/card';
import { MatIconModule } from '@angular/material/icon';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatSelectModule } from '@angular/material/select';
import { MatInputModule } from '@angular/material/input';
import { MatButtonModule } from '@angular/material/button';
import { MatDividerModule } from '@angular/material/divider';
import { MatChipsModule } from '@angular/material/chips';
import { FormBuilder, FormGroup, ReactiveFormsModule, Validators } from '@angular/forms';
import { Router } from '@angular/router';
import { MatSnackBar, MatSnackBarModule } from '@angular/material/snack-bar';
import { CommonModule, DatePipe } from '@angular/common';
import { DocenteService } from '../../../../core/services/docente.service';
import { AuthService } from '../../../../core/services/auth.service';

@Component({
  standalone: true,
  selector: 'app-conduct',
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
    CommonModule
  ],
  templateUrl: './conduct.html',
  styleUrl: './conduct.css',
})
export class Conduct {

  private fb = inject(FormBuilder);
  private snackBar = inject(MatSnackBar);
  private docenteService = inject(DocenteService);
  private authService = inject(AuthService);

  // Recibe el cursoId desde el padre
  cursoId = input<number | null>(null);

  tiposAnotacion: string[] = ['Positiva', 'Negativa', 'Informativa'];
  anotacionForm: FormGroup;

  // Anotaciones registradas (para mostrar en la lista de abajo)
  anotaciones = signal<any[]>([]);

  // Estudiantes reales del curso
  estudiantes = signal<any[]>([]);

  constructor() {
    this.anotacionForm = this.fb.group({
      estudianteId: [null, Validators.required],
      tipo: ['', Validators.required],
      descripcion: ['', [Validators.required, Validators.minLength(10)]],
    });

    // Escuchar cambios en la selección del estudiante para cargar su historial
    this.anotacionForm.get('estudianteId')?.valueChanges.subscribe(id => {
      if (id) {
        this.cargarHistorialEstudiante(id);
      } else {
        this.anotaciones.set([]);
      }
    });

    // Efecto para cargar alumnos cuando cambie el cursoId
    effect(() => {
      const id = this.cursoId();
      if (id) {
        this.cargarEstudiantes(id);
      } else {
        this.estudiantes.set([]);
      }
    }, { allowSignalWrites: true });
  }

  cargarHistorialEstudiante(estudianteId: number): void {
    this.docenteService.getAnotacionesPorEstudiante(estudianteId).subscribe({
      next: (data) => {
        const est = this.estudiantes().find(e => e.id === estudianteId);
        const historial = data.map(a => ({
          estudianteNombre: est?.nombreCompleto || 'Estudiante',
          tipo: a.tipo,
          descripcion: a.descripcion,
          fecha: a.fechaRegistro
        }));
        this.anotaciones.set(historial);
      },
      error: (err) => console.error('Error cargando historial:', err)
    });
  }

  cargarEstudiantes(cursoId: number): void {
    this.docenteService.getEstudiantesPorCurso(cursoId).subscribe({
      next: (data) => {
        this.estudiantes.set(data.map(est => ({
          id: est.estudianteId,
          nombreCompleto: est.estudianteFullName
        })));
      },
      error: (err) => console.error('Error cargando alumnos para conducta:', err)
    });
  }

  registrarAnotacion(): void {
    if (this.anotacionForm.invalid) {
      this.anotacionForm.markAllAsTouched();
      return;
    }

    const user = this.authService.currentUser();
    const docenteId = user?.id ? Number(user.id) : 2;

    const { estudianteId, tipo, descripcion } = this.anotacionForm.value;
    
    const payload = {
      estudianteId,
      docenteId,
      tipo,
      descripcion,
      fechaRegistro: new Date().toISOString()
    };

    this.docenteService.guardarAnotacion(payload).subscribe({
      next: (res) => {
        const est = this.estudiantes().find(e => e.id === estudianteId);
        
        // Agregar a la lista visual
        const nuevaVisual: any = {
          estudianteNombre: est?.nombreCompleto || 'Estudiante',
          tipo,
          descripcion,
          fecha: new Date(),
        };

        this.anotaciones.update(lista => [nuevaVisual, ...lista]);
        this.anotacionForm.reset();
        
        this.snackBar.open('✓ Anotación registrada con éxito', 'Cerrar', {
          duration: 3000,
          panelClass: ['success-snackbar'],
        });
      },
      error: (err) => {
        console.error('Error al guardar anotación:', err);
        this.snackBar.open('Error al guardar en el servidor', 'Cerrar', { duration: 3000 });
      }
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
