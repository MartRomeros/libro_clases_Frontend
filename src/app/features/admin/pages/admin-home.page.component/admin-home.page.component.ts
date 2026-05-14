import { Component, inject, computed } from '@angular/core';
import { Router } from '@angular/router';
import { MatTooltipModule } from '@angular/material/tooltip';
import { MatChipsModule } from '@angular/material/chips';
import { MatBadgeModule } from '@angular/material/badge';
import { MatListModule } from '@angular/material/list';
import { MatDividerModule } from '@angular/material/divider';
import { MatToolbarModule } from '@angular/material/toolbar';
import { MatIconModule } from '@angular/material/icon';
import { MatButtonModule } from '@angular/material/button';
import { MatCardModule } from '@angular/material/card';
import { injectQuery } from '@tanstack/angular-query-experimental';

import { Navbar } from '../../../../layout/navbar/navbar';
import { AuthQueries } from '../../../auth/data-access/auth.queries';

interface OpcionAdmin {
  titulo: string;
  descripcion: string;
  icono: string;
  ruta: string;
  color: string;
  badge?: number;
}

@Component({
  selector: 'app-admin-home-page',
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
    Navbar
  ],
  templateUrl: './admin-home.page.component.html',
  styleUrl: './admin-home.page.component.css',
})
export class AdminHomePageComponent {

  private readonly router = inject(Router);
  private readonly authQueries = inject(AuthQueries);

  profileQuery = injectQuery(() => this.authQueries.me());
  profile = computed(() => this.profileQuery.data());

  get adminNombre(): string {
    return this.profile()?.nombre || 'Administrador';
  }

  get userProfile(): string {
    const user = this.profile();
    const nombre = user?.nombre || 'Usuario';
    const role = user?.rol?.nombre || 'Administrador';
    return `${nombre} | ${role}`;
  }

  get saludoCompleto(): string {
    return `Admin, ${this.adminNombre}`;
  }

  opciones: OpcionAdmin[] = [
    {
      titulo: 'Gestión de Usuarios',
      descripcion: 'Administra docentes, estudiantes y personal administrativo.',
      icono: 'people',
      ruta: '/admin/usuarios',
      color: 'primary',
    },
    {
      titulo: 'Configuración de Cursos',
      descripcion: 'Crea y asigna cursos, niveles y asignaturas.',
      icono: 'settings_suggest',
      ruta: '/admin/cursos',
      color: 'accent',
    },
    {
      titulo: 'Reportes y Estadísticas',
      descripcion: 'Visualiza el rendimiento general y asistencia del colegio.',
      icono: 'analytics',
      ruta: '/admin/reportes',
      color: 'primary',
    },
    {
      titulo: 'Notificaciones Globales',
      descripcion: 'Envía comunicados a toda la comunidad educativa.',
      icono: 'campaign',
      ruta: '/admin/notificaciones',
      color: 'accent',
    },
  ];

  resumenRapido = [
    { etiqueta: 'Usuarios activos', valor: '1,240', icono: 'person' },
    { etiqueta: 'Cursos', valor: '42', icono: 'class' },
    { etiqueta: 'Alertas sistema', valor: '0', icono: 'check_circle' },
    { etiqueta: 'Tickets soporte', valor: '5', icono: 'confirmation_number' },
  ];

  navegarA(ruta: string): void {
    this.router.navigate([ruta]);
  }

  cerrarSesion(): void {
    this.router.navigate(['/auth/login']);
  }
}
