import { Component, inject, signal, computed } from '@angular/core';
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
import { injectQuery, injectMutation } from '@tanstack/angular-query-experimental';

import { AuthQueries } from '../../../auth/data-access/auth.queries';
import { AdminQueries } from '../../data-access/admin.queries';
import { AdminMutations } from '../../data-access/admin.mutations';
import { Usuario, Evaluacion } from '../../models/admin.model';
import { Navbar } from '../../../../layout/navbar/navbar';
import { LoadingStateComponent } from '../../../../shared/components/loading-state/loading-state.component';
import { ErrorStateComponent } from '../../../../shared/components/error-state/error-state.component';
import { EmptyStateComponent } from '../../../../shared/components/empty-state/empty-state.component';
import { showErrorSnack } from '../../../../shared/http/error-snackbar';

@Component({
  selector: 'app-user-management-page',
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
    MatNativeDateModule,
    Navbar,
    LoadingStateComponent,
    ErrorStateComponent,
    EmptyStateComponent
  ],
  templateUrl: './user-management.page.component.html',
  styleUrl: './user-management.page.component.css'
})
export class UserManagementPageComponent {
  private readonly fb = inject(FormBuilder);
  private readonly adminQueries = inject(AdminQueries);
  private readonly adminMutations = inject(AdminMutations);
  private readonly authQueries = inject(AuthQueries);
  private readonly router = inject(Router);
  private readonly snackBar = inject(MatSnackBar);


  profileQuery = injectQuery(() => this.authQueries.me());
  profile = computed(() => this.profileQuery.data());

  // Queries
  usuariosQuery = injectQuery(() => this.adminQueries.usuarios());
  docentesQuery = injectQuery(() => this.adminQueries.docentes());
  estudiantesQuery = injectQuery(() => this.adminQueries.estudiantes());
  cadsQuery = injectQuery(() => this.adminQueries.cads());
  cursosQuery = injectQuery(() => this.adminQueries.cursos());
  asignaturasQuery = injectQuery(() => this.adminQueries.asignaturas());

  selectedCadId = signal<number | null>(null);
  evaluacionesQuery = injectQuery(() => 
    this.adminQueries.evaluacionesByCad(this.selectedCadId() || 0)
  );

  // Data mapping helpers (using computed signals from queries)
  usuarios = computed(() => this.usuariosQuery.data() || []);
  docentes = computed(() => this.docentesQuery.data() || []);
  estudiantes = computed(() => this.estudiantesQuery.data() || []);
  evaluaciones = computed(() => this.evaluacionesQuery.data() || []);
  cursos = computed(() => this.cursosQuery.data() || []);
  cads = computed(() => this.cadsQuery.data() || []);
  asignaturas = computed(() => this.asignaturasQuery.data() || []);

  // Mutations
  crearCursoMutation = injectMutation(() => this.adminMutations.crearCurso());
  eliminarCursoMutation = injectMutation(() => this.adminMutations.eliminarCurso());
  crearAsignaturaMutation = injectMutation(() => this.adminMutations.crearAsignatura());
  eliminarAsignaturaMutation = injectMutation(() => this.adminMutations.eliminarAsignatura());
  vincularCADMutation = injectMutation(() => this.adminMutations.vincularCAD());
  eliminarCADMutation = injectMutation(() => this.adminMutations.eliminarCAD());
  
  crearUsuarioMutation = injectMutation(() => this.adminMutations.crearUsuarioCompleto());
  actualizarUsuarioMutation = injectMutation(() => this.adminMutations.actualizarUsuario());
  eliminarUsuarioMutation = injectMutation(() => this.adminMutations.eliminarUsuario());
  
  actualizarEstudianteMutation = injectMutation(() => this.adminMutations.actualizarEstudiante());

  crearEvaluacionMutation = injectMutation(() => this.adminMutations.crearEvaluacion());
  actualizarEvaluacionMutation = injectMutation(() => this.adminMutations.actualizarEvaluacion());
  eliminarEvaluacionMutation = injectMutation(() => this.adminMutations.eliminarEvaluacion());

  // Tables columns
  userColumns: string[] = ['rut', 'nombre', 'email', 'rol', 'activo', 'acciones'];
  evaluacionColumns: string[] = ['nombre', 'fecha', 'cad', 'acciones'];
  
  dateFilter = (d: Date | null): boolean => {
    const day = (d || new Date()).getDay();
    const today = new Date();
    today.setHours(0, 0, 0, 0);
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
      rolId: [3, Validators.required],
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

  // --- MÉTODOS ACADÉMICOS ---
  asignarCurso(estudianteId: number, cursoId: any) {
    if (!cursoId) return;
    this.actualizarEstudianteMutation.mutate({ id: estudianteId, estudiante: { cursoId } }, {
      onSuccess: () => this.mostrarMensaje('Estudiante asignado al curso'),
      onError: (err) => showErrorSnack(this.snackBar, err)
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
    this.crearCursoMutation.mutate(this.cursoForm.value, {
      onSuccess: () => {
        this.mostrarMensaje('Curso creado');
        this.cursoForm.reset({ anioAcademico: new Date().getFullYear() });
      },
      onError: (err) => showErrorSnack(this.snackBar, err)
    });
  }

  eliminarCurso(id: number) {
    if (confirm('¿Eliminar curso?')) {
      this.eliminarCursoMutation.mutate(id, {
        onSuccess: () => this.mostrarMensaje('Curso eliminado'),
        onError: (err) => showErrorSnack(this.snackBar, err)
      });
    }
  }

  crearAsignatura() {
    if (this.asignaturaForm.invalid) return;
    this.crearAsignaturaMutation.mutate(this.asignaturaForm.value, {
      onSuccess: () => {
        this.mostrarMensaje('Asignatura creada');
        this.asignaturaForm.reset();
      },
      onError: (err) => showErrorSnack(this.snackBar, err)
    });
  }

  eliminarAsignatura(id: number) {
    this.eliminarAsignaturaMutation.mutate(id, {
      onSuccess: () => this.mostrarMensaje('Asignatura eliminada'),
      onError: (err) => showErrorSnack(this.snackBar, err)
    });
  }

  vincularCAD() {
    if (this.cadForm.invalid) return;
    this.vincularCADMutation.mutate(this.cadForm.value, {
      onSuccess: () => {
        this.mostrarMensaje('Vínculo académico creado');
        this.cadForm.reset();
      },
      onError: (err) => showErrorSnack(this.snackBar, err)
    });
  }

  eliminarCAD(id: number) {
    if (confirm('¿Eliminar vínculo?')) {
      this.eliminarCADMutation.mutate(id, {
        onSuccess: () => this.mostrarMensaje('Vínculo eliminado'),
        onError: (err) => showErrorSnack(this.snackBar, err)
      });
    }
  }

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
      this.actualizarUsuarioMutation.mutate({ id: this.currentUserId, usuario }, {
        onSuccess: () => {
          this.mostrarMensaje('Usuario actualizado correctamente');
          this.resetUserForm();
        },
        onError: (err) => {
          showErrorSnack(this.snackBar, err);
        }
      });
    } else {
      this.crearUsuarioMutation.mutate({ usuario, extraData: { cursoId: 1 } }, {
        onSuccess: (nuevoUser) => {
          const perfil = this.getRolNombre(nuevoUser.rolId);
          this.mostrarMensaje(`¡${perfil} creado con éxito!`);
          this.resetUserForm();
        },
        onError: (err) => {
          showErrorSnack(this.snackBar, err);
        }
      });
    }
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
      this.eliminarUsuarioMutation.mutate(id, {
        onSuccess: () => this.mostrarMensaje('Usuario eliminado'),
        onError: (err) => showErrorSnack(this.snackBar, err)
      });
    }
  }

  // Evaluaciones
  buscarEvaluaciones(cadId: string) {
    if (!cadId) return;
    this.selectedCadId.set(Number(cadId));
  }

  onSubmitEval() {
    if (this.evalForm.invalid) return;
    const evalData: Evaluacion = this.evalForm.value;

    if (this.isEditing && this.currentEvalId) {
      this.actualizarEvaluacionMutation.mutate({ id: this.currentEvalId, evaluacion: evalData }, {
        onSuccess: () => {
          this.mostrarMensaje('Evaluación actualizada');
          this.resetEvalForm();
        },
        onError: (err) => showErrorSnack(this.snackBar, err)
      });
    } else {
      this.crearEvaluacionMutation.mutate(evalData, {
        onSuccess: () => {
          this.mostrarMensaje('Evaluación creada');
          this.resetEvalForm();
        },
        onError: (err) => showErrorSnack(this.snackBar, err)
      });
    }
  }

  eliminarEval(id: number, cadId: number) {
    if (confirm('¿Eliminar evaluación?')) {
      this.eliminarEvaluacionMutation.mutate({ id, cadId }, {
        onSuccess: () => this.mostrarMensaje('Eliminada'),
        onError: (err) => showErrorSnack(this.snackBar, err)
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
    this.router.navigate(['/auth/login']);
  }

  get userProfile(): string {
    const user = this.profile();
    return `${user?.nombre || 'Admin'} | Administrador`;
  }
}
