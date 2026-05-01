import { Component } from '@angular/core';
import { Router } from '@angular/router';
import { MatCardModule } from '@angular/material/card';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
import { MatToolbarModule } from '@angular/material/toolbar';
import { MatDividerModule } from '@angular/material/divider';
import { MatListModule } from '@angular/material/list';
import { MatBadgeModule } from '@angular/material/badge';
import { MatChipsModule } from '@angular/material/chips';
import { MatTooltipModule } from '@angular/material/tooltip';
import { AuthService } from '../../../core/services/auth.service';

interface OpcionEstudiante {
  titulo: string;
  descripcion: string;
  icono: string;
  ruta: string;
  color: string;
  badge?: number;
}

@Component({
  selector: 'app-estudiante-home',
  standalone: true,
  imports: [
    MatCardModule,
    MatButtonModule,
    MatIconModule,
    MatToolbarModule,
    MatDividerModule,
    MatListModule,
    MatBadgeModule,
    MatChipsModule,
    MatTooltipModule,
  ],
  templateUrl: './estudiante-home.html',
  styleUrl: './estudiante-home.css',
})
export class EstudianteHome {
  constructor(
    private router: Router,
    private authService: AuthService
  ) { }

  get estudianteNombre(): string {
    const user = this.authService.currentUser();
    return user?.name || 'Estudiante';
  }

  get userProfile(): string {
    const user = this.authService.currentUser();
    const nombre = user?.name || 'Usuario';
    const role = user?.role ? user.role.charAt(0).toUpperCase() + user.role.slice(1).toLowerCase() : 'Estudiante';
    return `${nombre} | ${role}`;
  }

  get saludoCompleto(): string {
    return `Alumno, ${this.estudianteNombre}`;
  }

  opciones: OpcionEstudiante[] = [
    {
      titulo: 'Mis Calificaciones',
      descripcion: 'Revisa tus notas y promedios por asignatura.',
      icono: 'grade',
      ruta: '/estudiante/notas',
      color: 'primary',
    },
    {
      titulo: 'Mi Asistencia',
      descripcion: 'Consulta tu porcentaje de asistencia y atrasos.',
      icono: 'event_available',
      ruta: '/estudiante/asistencia',
      color: 'accent',
    },
    {
      titulo: 'Material de Estudio',
      descripcion: 'Descarga guías, presentaciones y recursos de tus clases.',
      icono: 'library_books',
      ruta: '/estudiante/recursos',
      color: 'primary',
    },
    {
      titulo: 'Comunicados',
      descripcion: 'Infórmate sobre noticias y eventos del colegio.',
      icono: 'announcement',
      ruta: '/estudiante/noticias',
      color: 'accent',
      badge: 2,
    },
  ];

  resumenRapido = [
    { etiqueta: 'Promedio General', valor: '6.4', icono: 'star' },
    { etiqueta: 'Asistencia', valor: '95%', icono: 'done_all' },
    { etiqueta: 'Tareas hoy', valor: '2', icono: 'assignment' },
    { etiqueta: 'Mensajes', valor: '2', icono: 'mail' },
  ];

  navegarA(ruta: string): void {
    this.router.navigate([ruta]);
  }

  cerrarSesion(): void {
    this.authService.logout();
    this.router.navigate(['/login']);
  }
}
