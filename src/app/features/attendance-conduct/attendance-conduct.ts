import { Component, inject, signal, OnInit } from '@angular/core';
import { Router } from '@angular/router';
import { MatIconModule } from '@angular/material/icon';
import { MatToolbarModule } from '@angular/material/toolbar';
import { MatButtonModule } from '@angular/material/button';
import { CommonModule, DatePipe } from '@angular/common';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatSelectModule } from '@angular/material/select';
import { MatDatepickerModule } from '@angular/material/datepicker';
import { MatNativeDateModule } from '@angular/material/core';
import { MatCardModule } from '@angular/material/card';
import { MatTabsModule } from '@angular/material/tabs';

import { MatInputModule } from '@angular/material/input';
import { Attendance } from './components/attendance/attendance';
import { Conduct } from './components/conduct/conduct';
import { AttendanceConductService, Course } from './services/attendance-conduct.service';

@Component({
  standalone: true,
  selector: 'app-attendance-conduct',
  imports: [
    MatToolbarModule,
    MatIconModule,
    MatButtonModule,
    MatInputModule,
    DatePipe,
    MatFormFieldModule,
    MatSelectModule,
    MatDatepickerModule,
    MatNativeDateModule,
    MatCardModule,
    MatTabsModule,
    CommonModule,
    Attendance,
    Conduct
  ],
  templateUrl: './attendance-conduct.html',
  styleUrl: './attendance-conduct.css',
})
export class AttendanceConduct implements OnInit {

  private router = inject(Router);
  private attendanceConductService = inject(AttendanceConductService);

  fechaSeleccionada = signal<Date>(new Date());
  cursoSeleccionado = signal<number | string>('');
  cursosDisponibles = signal<Course[]>([]);

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

  ngOnInit(): void {
    this.attendanceConductService.getCursosDocente().subscribe({
      next: (response) => {
        if (response.success && response.data) {
          this.cursosDisponibles.set(response.data);
        }
      },
      error: (error) => {
        console.error('Error al obtener cursos del docente', error);
      }
    });
  }

  volverAlHome(): void {
    this.router.navigate(['/docente']);
  }
}
