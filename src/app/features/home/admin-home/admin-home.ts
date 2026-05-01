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

interface OpcionAdmin {
  titulo: string;
  descripcion: string;
  icono: string;
  ruta: string;
  color: string;
  badge?: number;
}

@Component({
  selector: 'app-admin-home',
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
  templateUrl: './admin-home.html',
  styleUrl: './admin-home.css',
})
export class AdminHome {
  constructor(
    private router: Router,
    private authService: AuthService
  ) { }

  get adminNombre(): string {
    const user = this.authService.currentUser();
    return user?.name || 'Administrador';
  }

  get userProfile(): string {
    const user = this.authService.currentUser();
    const nombre = user?.name || 'Usuario';
    const role = user?.role ? user.role.charAt(0).toUpperCase() + user.role.slice(1).toLowerCase() : 'Administrador';
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
    this.authService.logout();
    this.router.navigate(['/login']);
  }
}
