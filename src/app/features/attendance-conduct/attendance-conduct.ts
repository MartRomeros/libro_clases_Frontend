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

  ngOnInit(): void {
    this.attendanceConductService.getCursosDocente().subscribe({
      next: (response) => {
        if (response.success && response.data) {
          this.cursosDisponibles.set(response.data);
          if (response.data.length > 0) {
            this.cursoSeleccionado.set(response.data[0].curso_id);
          }
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
