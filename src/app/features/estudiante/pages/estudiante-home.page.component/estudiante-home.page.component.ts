import { Component, inject, computed } from '@angular/core';
import { Router } from '@angular/router';
import { MatIconModule } from '@angular/material/icon';
import { MatCardModule } from '@angular/material/card';
import { MatDividerModule } from '@angular/material/divider';
import { MatBadgeModule } from '@angular/material/badge';
import { injectQuery } from '@tanstack/angular-query-experimental';

import { Navbar } from '../../../../layout/navbar/navbar';
import { AuthQueries } from '../../../auth/data-access/auth.queries';

interface OpcionEstudiante {
  titulo: string;
  descripcion: string;
  icono: string;
  ruta: string;
  color: string;
  badge?: number;
}

@Component({
  selector: 'app-estudiante-home-page',
  standalone: true,
  imports: [Navbar, MatIconModule, MatCardModule, MatDividerModule, MatBadgeModule],
  templateUrl: './estudiante-home.page.component.html',
  styleUrl: './estudiante-home.page.component.css',
})
export class EstudianteHomePageComponent {
  private readonly router = inject(Router);
  private readonly authQueries = inject(AuthQueries);

  profileQuery = injectQuery(() => this.authQueries.me());
  profile = computed(() => this.profileQuery.data());

  docenteNombre = computed(() => {
    const p = this.profile();
    return p ? `${p.nombre} ${p.apellido_paterno}` : 'Estudiante';
  });

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
}
