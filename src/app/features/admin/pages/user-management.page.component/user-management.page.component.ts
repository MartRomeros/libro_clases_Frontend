import { Component, computed, effect, inject, signal } from '@angular/core';
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
import { MatCheckboxModule } from '@angular/material/checkbox';
import { MatPaginatorIntl, MatPaginatorModule, PageEvent } from '@angular/material/paginator';
import { MatListModule } from '@angular/material/list';
import { injectQuery, injectMutation } from '@tanstack/angular-query-experimental';

import { AuthQueries } from '../../../auth/data-access/auth.queries';
import { AdminQueries } from '../../data-access/admin.queries';
import { AdminMutations } from '../../data-access/admin.mutations';
import { Usuario, Evaluacion } from '../../models/admin.model';
import { NavbarAdminComponent } from '../../sections/navbar.component/navbar.component';
import { LoadingStateComponent } from '../../../../shared/components/loading-state/loading-state.component';
import { ErrorStateComponent } from '../../../../shared/components/error-state/error-state.component';
import { EmptyStateComponent } from '../../../../shared/components/empty-state/empty-state.component';
import { showErrorSnack } from '../../../../shared/http/error-snackbar';

function getSpanishPaginatorIntl(): MatPaginatorIntl {
  const paginatorIntl = new MatPaginatorIntl();
  paginatorIntl.itemsPerPageLabel = 'Filas por página';
  paginatorIntl.nextPageLabel = 'Siguiente página';
  paginatorIntl.previousPageLabel = 'Página anterior';
  paginatorIntl.firstPageLabel = 'Primera página';
  paginatorIntl.lastPageLabel = 'Última página';
  paginatorIntl.getRangeLabel = (page: number, pageSize: number, length: number) => {
    if (length === 0 || pageSize === 0) {
      return `0 de ${length}`;
    }

    const startIndex = page * pageSize;
    const endIndex = Math.min(startIndex + pageSize, length);
    return `${startIndex + 1} - ${endIndex} de ${length}`;
  };

  return paginatorIntl;
}

@Component({
  selector: 'app-user-management-page',
  standalone: true,
  providers: [{ provide: MatPaginatorIntl, useFactory: getSpanishPaginatorIntl }],
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
    MatCheckboxModule,
    MatPaginatorModule,
    MatListModule,
    NavbarAdminComponent,
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
  salasQuery = injectQuery(() => this.adminQueries.salas());

  selectedCadId = signal<number | null>(null);
  evaluacionesQuery = injectQuery(() => 
    this.adminQueries.evaluacionesByCad(this.selectedCadId() || 0)
  );
  hasSelectedCad = computed(() => (this.selectedCadId() ?? 0) > 0);

  // Data mapping helpers (using computed signals from queries)
  usuarios = computed(() => this.usuariosQuery.data() || []);
  usuariosPaginados = computed(() => {
    const inicio = this.userPageIndex() * this.userPageSize();
    return this.usuarios().slice(inicio, inicio + this.userPageSize());
  });
  docentes = computed(() => this.docentesQuery.data() || []);
  estudiantes = computed(() => this.estudiantesQuery.data() || []);
  estudiantesPaginados = computed(() => {
    const inicio = this.studentPageIndex() * this.studentPageSize();
    return this.estudiantes().slice(inicio, inicio + this.studentPageSize());
  });
  evaluaciones = computed(() => this.evaluacionesQuery.data() || []);
  evaluacionesPaginadas = computed(() => {
    const inicio = this.evalPageIndex() * this.evalPageSize();
    return this.evaluaciones().slice(inicio, inicio + this.evalPageSize());
  });
  cursos = computed(() => this.cursosQuery.data() || []);
  cursosPaginados = computed(() => {
    const inicio = this.coursePageIndex() * this.coursePageSize();
    return this.cursos().slice(inicio, inicio + this.coursePageSize());
  });
  cads = computed(() => this.cadsQuery.data() || []);
  asignaturas = computed(() => this.asignaturasQuery.data() || []);
  salas = computed(() => this.salasQuery.data() || []);
  asignaturasPaginadas = computed(() => {
    const inicio = this.subjectPageIndex() * this.subjectPageSize();
    return this.asignaturas().slice(inicio, inicio + this.subjectPageSize());
  });

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
  pageSizeOptions: number[] = [5, 10, 20];
  userPageIndex = signal(0);
  userPageSize = signal(5);
  coursePageIndex = signal(0);
  coursePageSize = signal(4);
  subjectPageIndex = signal(0);
  subjectPageSize = signal(4);
  studentPageIndex = signal(0);
  studentPageSize = signal(5);
  evalPageIndex = signal(0);
  evalPageSize = signal(5);
  
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
      apellidoMaterno: [''],
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
      docenteId: ['', Validators.required],
      salaId: ['', Validators.required]
    });

    effect(() => {
      const totalUsuarios = this.usuarios().length;
      const paginaActualFueraDeRango = this.userPageIndex() * this.userPageSize() >= totalUsuarios;

      if (totalUsuarios === 0 || paginaActualFueraDeRango) {
        this.userPageIndex.set(0);
      }
    });

    effect(() => {
      const totalCursos = this.cursos().length;
      const paginaActualFueraDeRango = this.coursePageIndex() * this.coursePageSize() >= totalCursos;

      if (totalCursos === 0 || paginaActualFueraDeRango) {
        this.coursePageIndex.set(0);
      }
    });

    effect(() => {
      const totalAsignaturas = this.asignaturas().length;
      const paginaActualFueraDeRango = this.subjectPageIndex() * this.subjectPageSize() >= totalAsignaturas;

      if (totalAsignaturas === 0 || paginaActualFueraDeRango) {
        this.subjectPageIndex.set(0);
      }
    });

    effect(() => {
      const totalEstudiantes = this.estudiantes().length;
      const paginaActualFueraDeRango = this.studentPageIndex() * this.studentPageSize() >= totalEstudiantes;

      if (totalEstudiantes === 0 || paginaActualFueraDeRango) {
        this.studentPageIndex.set(0);
      }
    });

    effect(() => {
      const totalEvaluaciones = this.evaluaciones().length;
      const paginaActualFueraDeRango = this.evalPageIndex() * this.evalPageSize() >= totalEvaluaciones;

      if (totalEvaluaciones === 0 || paginaActualFueraDeRango) {
        this.evalPageIndex.set(0);
      }
    });

    effect(() => {
      this.selectedCadId();
      this.evalPageIndex.set(0);
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

  onUsersPageChange(event: PageEvent): void {
    this.userPageIndex.set(event.pageIndex);
    this.userPageSize.set(event.pageSize);
  }

  onCoursesPageChange(event: PageEvent): void {
    this.coursePageIndex.set(event.pageIndex);
    this.coursePageSize.set(event.pageSize);
  }

  onSubjectsPageChange(event: PageEvent): void {
    this.subjectPageIndex.set(event.pageIndex);
    this.subjectPageSize.set(event.pageSize);
  }

  onStudentsPageChange(event: PageEvent): void {
    this.studentPageIndex.set(event.pageIndex);
    this.studentPageSize.set(event.pageSize);
  }

  onEvaluationsPageChange(event: PageEvent): void {
    this.evalPageIndex.set(event.pageIndex);
    this.evalPageSize.set(event.pageSize);
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
