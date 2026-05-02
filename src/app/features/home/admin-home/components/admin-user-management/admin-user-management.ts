import { Component, inject, signal, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule, ReactiveFormsModule, FormBuilder, FormGroup, Validators } from '@angular/forms';
import { Router } from '@angular/router';
import { MatToolbarModule } from '@angular/material/toolbar';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
import { MatCardModule } from '@angular/material/card';
import { MatTableModule } from '@angular/material/table';
import { MatTabsModule } from '@angular/material/tabs';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';
import { MatSelectModule } from '@angular/material/select';
import { MatSnackBar, MatSnackBarModule } from '@angular/material/snack-bar';
import { MatDividerModule } from '@angular/material/divider';
import { MatTooltipModule } from '@angular/material/tooltip';
import { MatDatepickerModule } from '@angular/material/datepicker';
import { MatNativeDateModule } from '@angular/material/core';
import { AdminService, Docente, Estudiante, Usuario } from '../../../../../core/services/admin.service';
import { AuthService } from '../../../../../core/services/auth.service';
import { Evaluacion } from '../../../../../core/services/docente.service';


@Component({
  selector: 'app-admin-user-management',
  standalone: true,
  imports: [
    CommonModule,
    FormsModule,
    ReactiveFormsModule,
    MatToolbarModule,
    MatButtonModule,
    MatIconModule,
    MatCardModule,
    MatTableModule,
    MatTabsModule,
    MatFormFieldModule,
    MatInputModule,
    MatSelectModule,
    MatSnackBarModule,
    MatDividerModule,
    MatTooltipModule,
    MatDatepickerModule,
    MatNativeDateModule
  ],
  templateUrl: './admin-user-management.html',
  styleUrl: './admin-user-management.css'
})
export class AdminUserManagement implements OnInit {
  private fb = inject(FormBuilder);
  private adminService = inject(AdminService);
  public authService = inject(AuthService);
  private router = inject(Router);
  private snackBar = inject(MatSnackBar);

  // Data signals
  usuarios = signal<Usuario[]>([]);
  docentes = signal<Docente[]>([]);
  estudiantes = signal<Estudiante[]>([]);
  evaluaciones = signal<Evaluacion[]>([]);
  
  // Para mapear IDs a nombres
  cursos = signal<any[]>([]); // Lista de cursos
  cads = signal<any[]>([]);   // Lista de CADs (Curso-Asignatura-Docente)
  asignaturas = signal<any[]>([]); // Lista de asignaturas

  // Tables columns
  userColumns: string[] = ['rut', 'nombre', 'email', 'rol', 'activo', 'acciones'];
  evaluacionColumns: string[] = ['nombre', 'fecha', 'cad', 'acciones']; // Quité 'id'
  
  // Filtro para el calendario (No domingos, no pasado)
  dateFilter = (d: Date | null): boolean => {
    const day = (d || new Date()).getDay();
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    
    // 0 es Domingo. Solo permitimos 1-6 y fechas >= hoy
    return day !== 0 && (d ? d >= today : true);
  };

  // Forms
  userForm: FormGroup;
  evalForm: FormGroup;
  cursoForm: FormGroup;
  asignaturaForm: FormGroup;
  cadForm: FormGroup;
  
  isEditing = false;
  currentUserId?: number;
  currentEvalId?: number;

  constructor() {
    this.userForm = this.fb.group({
      rut: ['', Validators.required],
      nombre: ['', Validators.required],
      apellidoPaterno: ['', Validators.required],
      apellidoMaterno: ['', Validators.required],
      email: ['', [Validators.required, Validators.email]],
      password: [''],
      rolId: [3, Validators.required], // Default Estudiante
      activo: [true]
    });

    this.evalForm = this.fb.group({
      nombre: ['', Validators.required],
      fechaEvaluacion: ['', Validators.required],
      cadId: ['', Validators.required]
    });

    this.cursoForm = this.fb.group({
      nivel: ['', Validators.required],
      letra: ['', Validators.required],
      anioAcademico: [new Date().getFullYear(), Validators.required]
    });

    this.asignaturaForm = this.fb.group({
      nombre: ['', Validators.required]
    });

    this.cadForm = this.fb.group({
      cursoId: ['', Validators.required],
      asignaturaId: ['', Validators.required],
      docenteId: ['', Validators.required]
    });
  }

  ngOnInit() {
    this.cargarTodo();
  }

  cargarTodo() {
    this.adminService.getUsuarios().subscribe(data => this.usuarios.set(data));
    this.adminService.getCads().subscribe(data => this.cads.set(data));
    this.adminService.getCursos().subscribe(data => this.cursos.set(data));
    this.adminService.getAsignaturas().subscribe(data => this.asignaturas.set(data));
    this.adminService.getEstudiantes().subscribe(data => this.estudiantes.set(data));
  }

  // --- MÉTODOS ACADÉMICOS ---
  asignarCurso(estudianteId: number, cursoId: any) {
    if (!cursoId) return;
    this.adminService.actualizarEstudiante(estudianteId, { cursoId }).subscribe({
      next: () => {
        this.mostrarMensaje('Estudiante asignado al curso');
        this.cargarTodo();
      },
      error: (e) => this.mostrarMensaje('Error al asignar curso')
    });
  }

  getNombreEstudiante(id: number): string {
    const user = this.usuarios().find(u => u.usuarioId === id);
    return user ? `${user.nombre} ${user.apellidoPaterno}` : `ID: ${id}`;
  }

  getCursoEstudiante(id: number): number {
    const est = this.estudiantes().find(e => e.estudianteId === id);
    return est ? est.cursoId : 0;
  }
  crearCurso() {
    if (this.cursoForm.invalid) return;
    this.adminService.crearCurso(this.cursoForm.value).subscribe({
      next: () => {
        this.mostrarMensaje('Curso creado');
        this.cursoForm.reset({ anioAcademico: new Date().getFullYear() });
        this.cargarTodo();
      },
      error: (e) => this.mostrarMensaje('Error al crear curso')
    });
  }

  eliminarCurso(id: number) {
    if (confirm('¿Eliminar curso?')) {
      this.adminService.eliminarCurso(id).subscribe({
        next: () => {
          this.mostrarMensaje('Curso eliminado');
          this.cargarTodo();
        },
        error: (e) => this.mostrarMensaje('No se puede eliminar: tiene dependencias')
      });
    }
  }

  crearAsignatura() {
    if (this.asignaturaForm.invalid) return;
    this.adminService.crearAsignatura(this.asignaturaForm.value).subscribe({
      next: () => {
        this.mostrarMensaje('Asignatura creada');
        this.asignaturaForm.reset();
        this.cargarTodo();
      },
      error: (e) => this.mostrarMensaje('Error al crear asignatura')
    });
  }

  eliminarAsignatura(id: number) {
    this.adminService.eliminarAsignatura(id).subscribe({
      next: () => {
        this.mostrarMensaje('Asignatura eliminada');
        this.cargarTodo();
      },
      error: (e) => this.mostrarMensaje('Error al eliminar')
    });
  }

  vincularCAD() {
    if (this.cadForm.invalid) return;
    this.adminService.vincularCAD(this.cadForm.value).subscribe({
      next: () => {
        this.mostrarMensaje('Vínculo académico creado');
        this.cadForm.reset();
        this.cargarTodo();
      },
      error: (e) => this.mostrarMensaje('Error al vincular: ya existe o datos inválidos')
    });
  }

  eliminarCAD(id: number) {
    if (confirm('¿Eliminar vínculo?')) {
      this.adminService.eliminarCAD(id).subscribe(() => {
        this.mostrarMensaje('Vínculo eliminado');
        this.cargarTodo();
      });
    }
  }

  // --- FIN MÉTODOS ACADÉMICOS ---

  getCadNombre(cadId: number): string {
    const cad = this.cads().find(c => c.cadId === cadId);
    if (cad) {
      return `${cad.curso} - ${cad.asignaturaNombre} (${cad.docente})`;
    }
    return `ID: ${cadId}`;
  }

  onSubmitUser() {
    if (this.userForm.invalid) {
      this.mostrarMensaje('Formulario inválido');
      return;
    }

    const formData = this.userForm.value;
    const usuario: Usuario = {
      rut: formData.rut,
      nombre: formData.nombre,
      apellidoPaterno: formData.apellidoPaterno,
      apellidoMaterno: formData.apellidoMaterno,
      email: formData.email,
      password: formData.password || '123456', 
      rolId: formData.rolId,
      activo: formData.activo
    };

    if (this.isEditing && this.currentUserId) {
      this.adminService.actualizarUsuario(this.currentUserId, usuario).subscribe({
        next: () => {
          this.mostrarMensaje('Usuario actualizado correctamente');
          this.resetUserForm();
          this.cargarTodo();
        },
        error: (err) => {
          console.error('Error update:', err);
          this.mostrarMensaje('Error al actualizar');
        }
      });
    } else {
      this.adminService.crearUsuario(usuario).subscribe({
        next: (nuevoUser) => {
          console.log('Usuario creado:', nuevoUser);
          if (formData.rolId === 2) { 
            this.adminService.crearDocente({ docenteId: nuevoUser.usuarioId! }).subscribe({
              next: () => this.finalizarCreacion('Docente'),
              error: (e) => this.finalizarCreacion('Usuario (Error perfil docente)')
            });
          } else if (formData.rolId === 3) { 
            this.adminService.crearEstudiante({ estudianteId: nuevoUser.usuarioId!, cursoId: 1 }).subscribe({
              next: () => this.finalizarCreacion('Estudiante'),
              error: (e) => this.finalizarCreacion('Usuario (Error perfil estudiante)')
            });
          } else {
            this.finalizarCreacion('Administrador');
          }
        },
        error: (err) => {
          console.error('Error create:', err);
          this.mostrarMensaje('Error: RUT o Email ya existen');
        }
      });
    }
  }

  private finalizarCreacion(perfil: string) {
    this.mostrarMensaje(`¡${perfil} creado con éxito!`);
    this.resetUserForm();
    this.cargarTodo();
  }

  editarUsuario(user: Usuario) {
    this.isEditing = true;
    this.currentUserId = user.usuarioId;
    this.userForm.patchValue({
      rut: user.rut,
      nombre: user.nombre,
      apellidoPaterno: user.apellidoPaterno,
      apellidoMaterno: user.apellidoMaterno,
      email: user.email,
      rolId: user.rolId,
      activo: user.activo
    });
    this.userForm.get('password')?.setValidators([]);
    this.userForm.get('password')?.updateValueAndValidity();
  }

  eliminarUsuario(id: number) {
    if (confirm('¿Estás seguro de eliminar este usuario?')) {
      this.adminService.eliminarUsuario(id).subscribe(() => {
        this.mostrarMensaje('Usuario eliminado');
        this.cargarTodo();
      });
    }
  }

  // Evaluaciones
  buscarEvaluaciones(cadId: string) {
    if (!cadId) return;
    this.adminService.getEvaluacionesByCad(Number(cadId)).subscribe(data => this.evaluaciones.set(data));
  }

  onSubmitEval() {
    if (this.evalForm.invalid) return;
    const evalData: Evaluacion = this.evalForm.value;

    if (this.isEditing && this.currentEvalId) {
      this.adminService.actualizarEvaluacion(this.currentEvalId, evalData).subscribe(() => {
        this.mostrarMensaje('Evaluación actualizada');
        this.resetEvalForm();
        this.buscarEvaluaciones(evalData.cadId.toString());
      });
    } else {
      this.adminService.crearEvaluacion(evalData).subscribe(() => {
        this.mostrarMensaje('Evaluación creada');
        this.resetEvalForm();
        this.buscarEvaluaciones(evalData.cadId.toString());
      });
    }
  }

  eliminarEval(id: number, cadId: number) {
    if (confirm('¿Eliminar evaluación?')) {
      this.adminService.eliminarEvaluacion(id).subscribe(() => {
        this.mostrarMensaje('Eliminada');
        this.buscarEvaluaciones(cadId.toString());
      });
    }
  }

  // Helpers
  resetUserForm() {
    this.userForm.reset({ rolId: 3, activo: true });
    this.isEditing = false;
    this.currentUserId = undefined;
  }

  resetEvalForm() {
    this.evalForm.reset();
    this.isEditing = false;
    this.currentEvalId = undefined;
  }

  mostrarMensaje(msg: string) {
    this.snackBar.open(msg, 'Cerrar', { duration: 3000 });
  }

  getRolNombre(id: number): string {
    switch(id) {
      case 1: return 'Admin';
      case 2: return 'Docente';
      case 3: return 'Estudiante';
      default: return 'Desconocido';
    }
  }

  volverAlHome(): void {
    this.router.navigate(['/admin']);
  }

  cerrarSesion(): void {
    this.authService.logout();
    this.router.navigate(['/login']);
  }

  get userProfile(): string {
    const user = this.authService.currentUser();
    return `${user?.name || 'Admin'} | Administrador`;
  }
}

