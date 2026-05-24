import { Component, inject, computed } from '@angular/core';
import { Router } from '@angular/router';
import { MatTooltipModule } from '@angular/material/tooltip';
import { MatDividerModule } from '@angular/material/divider';
import { MatIconModule } from '@angular/material/icon';
import { MatButtonModule } from '@angular/material/button';
import { MatCardModule } from '@angular/material/card';
import { injectQuery } from '@tanstack/angular-query-experimental';

import { AuthQueries } from '../../../auth/data-access/auth.queries';
import { AdminQueries } from '../../data-access/admin.queries';
import { NavbarAdminComponent } from '../../sections/navbar.component/navbar.component';

interface OpcionAdmin {
  titulo: string;
  descripcion: string;
  icono: string;
  ruta: string;
}

@Component({
  selector: 'app-admin-home-page',
  standalone: true,
  imports: [
    MatCardModule,
    MatButtonModule,
    MatIconModule,
    MatDividerModule,
    MatTooltipModule,
    NavbarAdminComponent 
  ],
  templateUrl: './admin-home.page.component.html',
  styleUrl: './admin-home.page.component.css',
})
export class AdminHomePageComponent {

  private readonly router = inject(Router);
  private readonly authQueries = inject(AuthQueries);
  private readonly adminQueries = inject(AdminQueries);

  profileQuery = injectQuery(() => this.authQueries.me());
  dashboardQuery = injectQuery(() => this.adminQueries.dashboard());

  profile = computed(() => this.profileQuery.data());
  dashboard = computed(() => this.dashboardQuery.data());

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
    return `Hola, ${this.adminNombre}`;
  }

  private estadoMetrica(valor: string, loading: boolean, error: boolean): string {
    if (loading) {
      return 'Cargando...';
    }
    if (error) {
      return 'Sin informacion disponible';
    }
    return valor;
  }

  resumenRapido = computed(() => [
    {
      etiqueta: 'Estudiantes',
      valor: this.estadoMetrica(
        this.dashboard()?.cantidadEstudiantes?.toString() ?? '0',
        this.dashboardQuery.isPending(),
        this.dashboardQuery.isError()
      ),
      icono: 'groups'
    },
    {
      etiqueta: 'Docentes',
      valor: this.estadoMetrica(
        this.dashboard()?.cantidadDocentes?.toString() ?? '0',
        this.dashboardQuery.isPending(),
        this.dashboardQuery.isError()
      ),
      icono: 'co_present'
    },
    {
      etiqueta: 'Asistencia promedio',
      valor: this.estadoMetrica(
        this.dashboard() ? `${this.dashboard()!.porcentajeAsistencia}%` : '0%',
        this.dashboardQuery.isPending(),
        this.dashboardQuery.isError()
      ),
      icono: 'calendar_month'
    },
    {
      etiqueta: 'Cursos',
      valor: this.estadoMetrica(
        this.dashboard()?.cantidadCursos?.toString() ?? '0',
        this.dashboardQuery.isPending(),
        this.dashboardQuery.isError()
      ),
      icono: 'school'
    },
  ]);

  opciones: OpcionAdmin[] = [
    {
      titulo: 'Gestión de Usuarios',
      descripcion: 'Administra docentes, estudiantes y personal del establecimiento.',
      icono: 'manage_accounts',
      ruta: '/admin/usuarios',
    },
    {
      titulo: 'Gestión de Cursos',
      descripcion: 'Gestiona cursos, asignaturas y vínculos académicos.',
      icono: 'school',
      ruta: '/admin/usuarios',
    },
    {
      titulo: 'Mensajes',
      descripcion: 'Revisa y envía comunicaciones institucionales.',
      icono: 'chat',
      ruta: '/comunicaciones',
    },
  ];

  navegarA(ruta: string): void {
    this.router.navigate([ruta]);
  }

  cerrarSesion(): void {
    this.router.navigate(['/auth/login']);
  }
}
