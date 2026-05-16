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
import { MatDatepickerModule } from '@angular/material/datepicker';
import { MAT_DATE_LOCALE, MatNativeDateModule } from '@angular/material/core';
import { CommonModule } from '@angular/common';
import { AttendanceComponent } from '../../sections/attendance.component/attendance.component';
import { ConductComponent } from '../../sections/conduct.component/conduct.component';
import { MatButtonModule } from '@angular/material/button';
import { MatSnackBar, MatSnackBarModule } from '@angular/material/snack-bar';
import { LoadingStateComponent } from '../../../../shared/components/loading-state/loading-state.component';
import { ErrorStateComponent } from '../../../../shared/components/error-state/error-state.component';
import { Course } from '../../models/curso.response.model';
import { isBusinessDayChile } from '../../utils/chile-business-day.util';
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
    MatDatepickerModule,
    MatNativeDateModule,
    AttendanceComponent,
    ConductComponent ,
    MatButtonModule,
    MatSnackBarModule,
    LoadingStateComponent,
    ErrorStateComponent,
    NavbarComponent
  ],
  providers: [{ provide: MAT_DATE_LOCALE, useValue: 'es-CL' }],
  templateUrl: './attendance.page.component.html',
  styleUrl: './attendance.page.component.css',
})
export class AttendancePageComponent {

  private readonly authQueries = inject(AuthQueries)
  private readonly attendanceQueries = inject(AttendanceQueries)
  private snackBar = inject(MatSnackBar);
  private router = inject(Router);
  private route = inject(ActivatedRoute);


  profileQuery = injectQuery(() => this.authQueries.me())  
  profile = computed(() => this.profileQuery.data())

  cursosQuery = injectQuery(()=> this.attendanceQueries.cursosDocente())
  cursosDisponibles = computed<Course[]>(() => this.cursosQuery.data()?.data ?? [])
  cursos = computed<Course[]>(() => this.cursosDisponibles())

  fechaSeleccionada = signal<Date>(new Date());
  cursoSeleccionado = signal<number | string>('');
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

    const existeCurso = cursos.some(curso => curso.cad_id === cadId);
    if (existeCurso) {
      this.cursoSeleccionado.set(cadId);
    }
  });

  dateFilter = (d: Date | null): boolean => {
    const date = d ?? new Date();
    return isBusinessDayChile(date);
  };

  onDateChange(date: Date | null): void {
    if (!date) {
      this.snackBar.open('Formato de fecha inválido. Usa dd/mm/yyyy.', 'Entendido', {
        duration: 3500,
        panelClass: ['warn-snackbar'],
      });
      return;
    }

    if (!isBusinessDayChile(date)) {
      this.snackBar.open('No se permiten fines de semana ni feriados de Chile.', 'Entendido', {
        duration: 4000,
        panelClass: ['warn-snackbar'],
      });
      const previousDate = this.fechaSeleccionada();
      this.fechaSeleccionada.set(new Date(previousDate));
      return;
    }

    this.fechaSeleccionada.set(date);
  }

  

  volver(): void {
    const rol = this.profile()?.rol?.nombre?.toLowerCase() ?? '';
    if (rol.includes('admin')) this.router.navigate(['/admin']);
    else if (rol.includes('docente')) this.router.navigate(['/docente']);
    else if (rol.includes('estudiante')) this.router.navigate(['/estudiante']);
    else this.router.navigate(['/auth/login']);
  }



}
