import { Component, computed, inject, signal } from '@angular/core';
import { Router } from '@angular/router';
import { AuthQueries } from '../../../auth/data-access/auth.queries';
import { injectQuery } from '@tanstack/angular-query-experimental';
import { AttendanceQueries } from '../../data-access/docente.queries';
import { Navbar } from '../../../../layout/navbar/navbar';
import { MatIconModule } from '@angular/material/icon';
import { MatCardModule } from '@angular/material/card';
import { MatTabsModule } from '@angular/material/tabs';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';
import { MatSelectModule } from '@angular/material/select';
import { MatDatepickerModule } from '@angular/material/datepicker';
import { MatNativeDateModule } from '@angular/material/core';
import { CommonModule } from '@angular/common';
import { AttendanceComponent } from '../../sections/attendance.component/attendance.component';
import { ConductComponent } from '../../sections/conduct.component/conduct.component';
import { MatButtonModule } from '@angular/material/button';

@Component({
  selector: 'app-attendance.page.component',
  imports: [
    CommonModule,
    Navbar,
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
    MatButtonModule
    
  ],
  templateUrl: './attendance.page.component.html',
  styleUrl: './attendance.page.component.css',
})
export class AttendancePageComponent {

  private readonly authQueries = inject(AuthQueries)
  private readonly attendanceQueries = inject(AttendanceQueries)
  private router = inject(Router);


  profileQuery = injectQuery(() => this.authQueries.me())  
  profile = computed(() => this.profileQuery.data())

  cursosQuery = injectQuery(()=> this.attendanceQueries.cursosDocente())
  cursosDisponibles = computed(()=> this.cursosQuery.data())

  fechaSeleccionada = signal<Date>(new Date());
  cursoSeleccionado = signal<number | string>('');


  // Listado de feriados en Chile 2026 (año actual según contexto)
  private feriadosChile = [
    '2026-01-01', // Año Nuevo
    '2026-04-03', // Viernes Santo
    '2026-04-04', // Sábado Santo
    '2026-05-01', // Día del Trabajo
    '2026-05-21', // Día de las Glorias Navales
    '2026-06-29', // San Pedro y San Pablo
    '2026-07-16', // Día de la Virgen del Carmen
    '2026-08-15', // Asunción de la Virgen
    '2026-09-18', // Fiestas Patrias
    '2026-09-19', // Glorias del Ejército
    '2026-10-12', // Encuentro de Dos Mundos
    '2026-10-31', // Día de las Iglesias Evangélicas
    '2026-11-01', // Día de Todos los Santos
    '2026-12-08', // Inmaculada Concepción
    '2026-12-25', // Navidad
  ];

  dateFilter = (d: Date | null): boolean => {
    const date = d || new Date();
    const day = date.getDay();
    const dateString = date.toISOString().split('T')[0];

    // 0 = Domingo, 6 = Sábado. Solo permitimos 1-5 (Lunes-Viernes)
    const esFinDeSemana = day === 0 || day === 6;

    // Verificar si es feriado
    const esFeriado = this.feriadosChile.includes(dateString);

    return !esFinDeSemana && !esFeriado;
  };

  

  volver(): void {
    const rol = this.profile()?.rol?.nombre?.toLowerCase() ?? '';
    if (rol.includes('admin')) this.router.navigate(['/admin']);
    else if (rol.includes('docente')) this.router.navigate(['/docente']);
    else if (rol.includes('estudiante')) this.router.navigate(['/estudiante']);
    else this.router.navigate(['/login']);
  }



}
