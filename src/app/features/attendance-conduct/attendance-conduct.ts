import { Component, inject, signal } from '@angular/core';
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
export class AttendanceConduct {

  private router = inject(Router);
  fechaSeleccionada = signal<Date>(new Date());
  cursoSeleccionado = signal<string>('');
  cursosDisponibles = ['1°A', '1°B', '2°A', '2°B', '3°A'];


  volverAlHome(): void {
    this.router.navigate(['/docente']);
  }
}
