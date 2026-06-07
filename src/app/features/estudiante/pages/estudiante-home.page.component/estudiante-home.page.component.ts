import { Component, inject, computed } from '@angular/core';
import { Router } from '@angular/router';
import { MatIconModule } from '@angular/material/icon';
import { MatCardModule } from '@angular/material/card';
import { MatDividerModule } from '@angular/material/divider';
import { injectQuery } from '@tanstack/angular-query-experimental';

import { MatButtonModule } from '@angular/material/button';
import { MatTooltipModule } from '@angular/material/tooltip';
import { NavbarComponent } from '../../sections/navbar.component/navbar.component';
import { AuthQueries } from '../../../auth/data-access/auth.queries';
import { EstudianteQueries } from '../../data-access/estudiante.queries';
import { Recurso } from '../../models/estudiante.model';

interface OpcionEstudiante {
  titulo: string;
  descripcion: string;
  icono: string;
  ruta: string;
  color: string;
  chip?: string;
}

interface PanelInformativo {
  titulo: string;
  descripcion: string;
  icono: string;
}

@Component({
  selector: 'app-estudiante-home-page',
  standalone: true,
  imports: [NavbarComponent, MatIconModule, MatCardModule, MatDividerModule, MatButtonModule, MatTooltipModule],
  templateUrl: './estudiante-home.page.component.html',
  styleUrl: './estudiante-home.page.component.css',
})
export class EstudianteHomePageComponent {
  private readonly router = inject(Router);
  private readonly authQueries = inject(AuthQueries);
  private readonly estudianteQueries = inject(EstudianteQueries);
  private readonly recursosMock: Recurso[] = [
    { id: 1, asignatura: 'Matemáticas', titulo: 'Guía de Ejercicios: Álgebra Lineal', tipo: 'PDF', fechaSubida: '2026-04-25', tamano: '2.4 MB' },
    { id: 2, asignatura: 'Lenguaje y Comunicación', titulo: 'Lectura Complementaria del mes', tipo: 'PDF', fechaSubida: '2026-04-20', tamano: '1.1 MB' },
    { id: 3, asignatura: 'Historia y Geografía', titulo: 'Presentación: Revolución Industrial', tipo: 'PPTX', fechaSubida: '2026-04-22', tamano: '5.6 MB' },
    { id: 4, asignatura: 'Ciencias Naturales', titulo: 'Laboratorio: Células', tipo: 'DOCX', fechaSubida: '2026-04-28', tamano: '1.8 MB' },
    { id: 5, asignatura: 'Matemáticas', titulo: 'Video explicativo: Funciones Avanzadas', tipo: 'VIDEO', fechaSubida: '2026-04-29', tamano: '124 MB' }
  ];

  profileQuery = injectQuery(() => this.authQueries.me());
  dashboardQuery = injectQuery(() => this.estudianteQueries.dashboard());
  profile = computed(() => this.profileQuery.data());
  loading = computed(() => this.profileQuery.isLoading());
  error = computed(() => this.profileQuery.error());
  dashboardResumen = computed(() => this.dashboardQuery.data());

  estudianteNombre = computed(() => {
    const p = this.profile();
    return p ? `${p.nombre} ${p.apellido_paterno}` : '';
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
      //chip: 'Nuevo',
    },
    {
      titulo: 'Mensajería',
      descripcion: 'Comunícate con tus profesores y personal del colegio.',
      icono: 'forum',
      ruta: '/comunicaciones',
      color: 'primary',
      //chip: '2 mensajes',
    },
  ];

  get resumenRapido() {
    const resumen = this.dashboardResumen();

    return [
      {
        etiqueta: 'Promedio General',
        valor: resumen?.promedioGeneral != null ? resumen.promedioGeneral.toFixed(1) : 'Sin informacion disponible',
        icono: 'star',
      },
      {
        etiqueta: 'Asistencia',
        valor: resumen?.asistenciaGlobal != null ? `${resumen.asistenciaGlobal}%` : 'Sin informacion disponible',
        icono: 'done_all',
      },
      {
        etiqueta: 'Recursos Disponibles',
        valor: String(this.recursosMock.length),
        icono: 'assignment',
      },
      {
        etiqueta: 'Mensajes',
        valor: resumen?.mensajesPendientes != null ? String(resumen.mensajesPendientes) : 'Sin informacion disponible',
        icono: 'mail',
      },
    ];
  }

  panelesInformativos: PanelInformativo[] = [
    {
      titulo: 'Proximas evaluaciones',
      descripcion: 'Sin informacion disponible',
      icono: 'event',
    },
    {
      titulo: 'Actividad semanal',
      descripcion: 'Sin informacion disponible',
      icono: 'school',
    },
  ];

  refetchDashboard(): void {
    this.dashboardQuery.refetch();
  }

  navegarA(ruta: string): void {
    this.router.navigate([ruta]);
  }
}
