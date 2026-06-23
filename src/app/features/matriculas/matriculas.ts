import { Component, OnInit, inject } from '@angular/core';
import { FormBuilder, FormGroup, ReactiveFormsModule, Validators } from '@angular/forms';
import { CommonModule } from '@angular/common';
import { MatButtonModule } from '@angular/material/button';
import { MatOptionModule } from '@angular/material/core';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatIconModule } from '@angular/material/icon';
import { MatInputModule } from '@angular/material/input';
import { MatSelectModule } from '@angular/material/select';
import { MatSnackBar, MatSnackBarModule } from '@angular/material/snack-bar';
import { RouterLink, Router } from '@angular/router';
import { Navbar } from '../landing/sections/navbar/navbar';
import { Footer } from '../landing/sections/footer/footer';
import { AdminApi } from '../admin/data-access/admin.api';
import { Curso, Estudiante } from '../admin/models/admin.model';

@Component({
  selector: 'app-matriculas',
  imports: [
    ReactiveFormsModule,
    CommonModule,
    MatFormFieldModule,
    MatOptionModule,
    MatInputModule,
    MatSelectModule,
    MatButtonModule,
    MatIconModule,
    MatSnackBarModule,
    RouterLink,
    Navbar,
    Footer
  ],
  templateUrl: './matriculas.html',
  styleUrl: './matriculas.css',
})
export class Matriculas implements OnInit {
  private fb = inject(FormBuilder);
  private router = inject(Router);
  private adminApi = inject(AdminApi);
  private snackBar = inject(MatSnackBar);

  matriculaForm: FormGroup;
  cursosList: Curso[] = [];
  estudiantesList: Estudiante[] = [];
  cuposDisponibles: number | null = null;
  isLoadingCupos = false;
  isInitiatingPayment = false;

  rutStatus: 'found' | 'new' | null = null;
  lastRutStatus: 'found' | 'new' | null = null;
  isNewStudent = true;
  existingEstudianteId: number | null = null;

  constructor() {
    this.matriculaForm = this.fb.group({
      nombreAlumno: ['', Validators.required],
      apellidosAlumno: ['', Validators.required],
      rutAlumno: ['', Validators.required],
      curso: ['', Validators.required],
      nombreApoderado: ['', Validators.required],
      rutApoderado: ['', Validators.required]
    });
  }

  async ngOnInit() {
    try {
      this.cursosList = await this.adminApi.getCursos();
      this.cursosList.sort((a, b) => {
        if (a.nivel !== b.nivel) {
          return a.nivel.localeCompare(b.nivel, undefined, { numeric: true });
        }
        return a.letra.localeCompare(b.letra);
      });

      // Cargar lista de estudiantes de la BD para validación de existencia por RUT
      this.estudiantesList = await this.adminApi.getEstudiantes();
    } catch (error) {
      console.error('Error al inicializar la página de matrícula:', error);
    }
  }

  onRutInput(value: string) {
    this.buscarAlumnoPorRut(value);
  }

  async buscarAlumnoPorRut(rut: string) {
    if (!rut || rut.trim().length < 3) {
      this.rutStatus = null;
      this.isNewStudent = true;
      this.existingEstudianteId = null;
      return;
    }

    const normalizeRut = (r: string) => r.replace(/[^0-9kK]/g, '').toLowerCase();
    const searchRut = normalizeRut(rut);

    try {
      // Consultar al microservicio MsMatriculas para obtener estudiante y apoderado
      const data = await this.adminApi.buscarEstudianteMatricula(searchRut);

      if (data) {
        this.rutStatus = 'found';
        this.isNewStudent = false;
        this.existingEstudianteId = data.estudiante_id;
        this.lastRutStatus = 'found';

        // Autopopular datos del alumno
        this.matriculaForm.patchValue({
          nombreAlumno: data.estudiante_nombre || '',
          apellidosAlumno: `${data.estudiante_apellido_paterno || ''} ${data.estudiante_apellido_materno || ''}`.trim(),
          curso: data.curso_id
        }, { emitEvent: false });

        // Autopopular datos de su apoderado si está asociado
        if (data.apoderado_id) {
          this.matriculaForm.patchValue({
            nombreApoderado: `${data.apoderado_nombre || ''} ${data.apoderado_apellido_paterno || ''} ${data.apoderado_apellido_materno || ''}`.trim().replace(/\s+/g, ' '),
            rutApoderado: data.apoderado_rut || ''
          }, { emitEvent: false });
        } else {
          // Limpiar apoderado si no hay relación en la base de datos
          this.matriculaForm.patchValue({
            nombreApoderado: '',
            rutApoderado: ''
          }, { emitEvent: false });
        }

        this.onCursoChange(data.curso_id);
      }
    } catch (error) {
      // Si el estudiante no existe (404) u ocurre un error, se trata como Alumno Nuevo
      this.rutStatus = 'new';
      this.isNewStudent = true;
      this.existingEstudianteId = null;

      if (this.lastRutStatus === 'found') {
        this.matriculaForm.patchValue({
          nombreAlumno: '',
          apellidosAlumno: '',
          curso: '',
          nombreApoderado: '',
          rutApoderado: ''
        }, { emitEvent: false });
        this.cuposDisponibles = null;
      }
      this.lastRutStatus = 'new';
    }
  }

  async onCursoChange(cursoId: number) {
    if (!cursoId) {
      this.cuposDisponibles = null;
      return;
    }
    this.isLoadingCupos = true;
    this.cuposDisponibles = null;
    try {
      const estudiantes = await this.adminApi.getEstudiantesByCurso(cursoId);
      const uniqueEstudiantes = new Set(estudiantes.map(e => e.estudianteId));
      const cantAlumnos = uniqueEstudiantes.size;
      this.cuposDisponibles = 30 - cantAlumnos;
    } catch (error) {
      console.error('Error al consultar cupos del curso:', error);
      this.cuposDisponibles = null;
    } finally {
      this.isLoadingCupos = false;
    }
  }

  async grabar() {
  if (this.matriculaForm.invalid || this.cuposDisponibles === null || this.cuposDisponibles <= 0) {
    this.matriculaForm.markAllAsTouched();
    return;
  }

  this.isInitiatingPayment = true;

  // Guardar datos del formulario en sessionStorage para recuperarlos tras el pago
  const formData = this.matriculaForm.value;
  sessionStorage.setItem('matriculaFormData', JSON.stringify(formData));

  const amount = 1000;
  const returnUrl = `${window.location.origin}/webpay-return`;

  try {
    // 1. Consumimos el BFF para inicializar la transacción en Webpay
    const { url, token } = await this.adminApi.iniciarPagoWebpay(amount, returnUrl);
    
    if (url && token) {
      // Crear formulario dinámico para POST a Webpay
      const form = document.createElement('form');
      form.action = url;
      form.method = 'POST';
      
      const inputToken = document.createElement('input');
      inputToken.type = 'hidden';
      inputToken.name = 'token_ws';
      inputToken.value = token;
      
      form.appendChild(inputToken);
      document.body.appendChild(form);
      form.submit();
    } else {
      throw new Error('La URL de pago o token recibidos desde el backend están vacíos');
    }

  } catch (error) {
    console.error('Error al iniciar pago Webpay:', error);
    this.snackBar.open(
      'No se pudo iniciar el proceso de pago. Intente nuevamente.',
      'Cerrar',
      { duration: 5000, panelClass: ['snack-error'] }
    );
    // Si la redirección falla o la API cae, devolvemos el botón a su estado activo
    this.isInitiatingPayment = false;
  }
}

  limpiar() {
    this.matriculaForm.reset();
    this.cuposDisponibles = null;
    this.rutStatus = null;
    this.lastRutStatus = null;
    this.isNewStudent = true;
    this.existingEstudianteId = null;
  }
}
