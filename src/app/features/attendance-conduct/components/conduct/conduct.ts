import { Component, signal } from '@angular/core';
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


  tiposAnotacion: string[] = ['Positiva', 'Negativa', 'Informativa'];


  anotacionForm: FormGroup;

  // Anotaciones registradas
  anotaciones = signal<any[]>([]);

  // Estudiantes mock para la vista
  estudiantes = signal<any[]>([
    { id: 1, nombre: 'Ana', apellido: 'González', estadoAsistencia: null },
    { id: 2, nombre: 'Carlos', apellido: 'Muñoz', estadoAsistencia: null },
    { id: 3, nombre: 'Sofía', apellido: 'Pérez', estadoAsistencia: null },
    { id: 4, nombre: 'Matías', apellido: 'Rodríguez', estadoAsistencia: null },
    { id: 5, nombre: 'Valentina', apellido: 'López', estadoAsistencia: null },
  ]);

  constructor(
    private router: Router,
    private fb: FormBuilder,
    private snackBar: MatSnackBar
  ) {
    this.anotacionForm = this.fb.group({
      estudianteId: [null, Validators.required],
      tipo: ['', Validators.required],
      descripcion: ['', [Validators.required, Validators.minLength(10)]],
    });
  }

  registrarAnotacion(): void {
    if (this.anotacionForm.invalid) {
      this.anotacionForm.markAllAsTouched();
      return;
    }

    const { estudianteId, tipo, descripcion } = this.anotacionForm.value;
    const est = this.estudiantes().find(e => e.id === estudianteId);
    if (!est) return;

    const nueva: any = {
      estudianteId,
      estudianteNombre: `${est.nombre} ${est.apellido}`,
      tipo,
      descripcion,
      fecha: new Date(),
    };

    this.anotaciones.update(lista => [nueva, ...lista]);
    this.anotacionForm.reset();
    this.snackBar.open('✓ Anotación registrada', 'Cerrar', {
      duration: 3000,
      panelClass: ['success-snackbar'],
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
