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
import { DocenteService, DocenteCurso } from '../../core/services/docente.service';
import { AuthService } from '../../core/services/auth.service';

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
  private docenteService = inject(DocenteService);
  private authService = inject(AuthService);

  fechaSeleccionada = signal<Date>(new Date());
  cursoSeleccionado = signal<number | null>(null);
  cursosDisponibles = signal<DocenteCurso[]>([]);

  ngOnInit(): void {
    this.cargarCursos();
  }

  cargarCursos(): void {
    const user = this.authService.currentUser();
    const docenteId = user?.id ? Number(user.id) : 2; // ID 2 por defecto para pruebas

    this.docenteService.getCursos(docenteId).subscribe({
      next: (cursos) => {
        this.cursosDisponibles.set(cursos);
        if (cursos.length > 0) {
          // Seleccionamos el primero por defecto si quieres
          // this.cursoSeleccionado.set(cursos[0].cursoId);
        }
      },
      error: (err) => console.error('Error cargando cursos para asistencia:', err)
    });
  }

  volverAlHome(): void {
    this.router.navigate(['/docente']);
  }

  get userProfile(): string {
    const user = this.authService.currentUser();
    const nombre = user?.name || 'Usuario';
    const role = user?.role ? user.role.charAt(0).toUpperCase() + user.role.slice(1).toLowerCase() : 'Docente';
    return `${nombre} | ${role}`;
  }

  cerrarSesion(): void {
    this.authService.logout();
    this.router.navigate(['/login']);
  }
}
