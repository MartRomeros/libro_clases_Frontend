import { Component, computed, effect, inject, signal } from '@angular/core';
import { ActivatedRoute, Router } from '@angular/router';
import { AuthQueries } from '../../../auth/data-access/auth.queries';
import { injectQuery } from '@tanstack/angular-query-experimental';
import { AttendanceQueries } from '../../data-access/docente.queries';
import { MatIconModule } from '@angular/material/icon';
import { MatCardModule } from '@angular/material/card';
import { MatTabsModule } from '@angular/material/tabs';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';
import { MatSelectModule } from '@angular/material/select';
import { CommonModule } from '@angular/common';
import { AttendanceComponent } from '../../sections/attendance.component/attendance.component';
import { ConductComponent } from '../../sections/conduct.component/conduct.component';
import { MatButtonModule } from '@angular/material/button';
import { LoadingStateComponent } from '../../../../shared/components/loading-state/loading-state.component';
import { ErrorStateComponent } from '../../../../shared/components/error-state/error-state.component';
import { Course } from '../../models/curso.response.model';
import { NavbarComponent } from '../../sections/navbar.component/navbar.component';

@Component({
  selector: 'app-attendance.page.component',
  imports: [
    CommonModule,
    MatIconModule,
    MatCardModule,
    MatTabsModule,
    MatFormFieldModule,
    MatInputModule,
    MatSelectModule,
    AttendanceComponent,
    ConductComponent,
    MatButtonModule,
    LoadingStateComponent,
    ErrorStateComponent,
    NavbarComponent
  ],
  templateUrl: './attendance.page.component.html',
  styleUrl: './attendance.page.component.css',
})
export class AttendancePageComponent {

  private readonly authQueries = inject(AuthQueries)
  private readonly attendanceQueries = inject(AttendanceQueries)
  private router = inject(Router);
  private route = inject(ActivatedRoute);


  profileQuery = injectQuery(() => this.authQueries.me())  
  profile = computed(() => this.profileQuery.data())

  cursosQuery = injectQuery(()=> this.attendanceQueries.cursosDocente())
  cursosDisponibles = computed<Course[]>(() => this.cursosQuery.data()?.data ?? [])
  cursos = computed<Course[]>(() => this.cursosDisponibles())

  fechaSeleccionada = signal<Date>(new Date());
  cursoSeleccionado = signal<Course | null>(null);

  // IDs derivados del curso seleccionado
  cadIdSeleccionado  = computed<number | ''>(() => this.cursoSeleccionado()?.cad_id  ?? '');
  cursoIdSeleccionado = computed<number | ''>(() => this.cursoSeleccionado()?.curso_id ?? '');

  private cadIdDesdeRuta = computed<number | null>(() => {
    const raw = this.route.snapshot.queryParamMap.get('cadId');
    if (!raw) return null;
    const parsed = Number(raw);
    return Number.isFinite(parsed) ? parsed : null;
  });

  private syncCursoDesdeRuta = effect(() => {
    const cursos = this.cursos();
    const cadId = this.cadIdDesdeRuta();
    const selected = this.cursoSeleccionado();

    if (!cadId || cursos.length === 0 || selected) return;

    const curso = cursos.find(c => c.cad_id === cadId);
    if (curso) {
      this.cursoSeleccionado.set(curso);
    }
  });

  volver(): void {
    const rol = this.profile()?.rol?.nombre?.toLowerCase() ?? '';
    if (rol.includes('admin')) this.router.navigate(['/admin']);
    else if (rol.includes('docente')) this.router.navigate(['/docente']);
    else if (rol.includes('estudiante')) this.router.navigate(['/estudiante']);
    else this.router.navigate(['/auth/login']);
  }



}
