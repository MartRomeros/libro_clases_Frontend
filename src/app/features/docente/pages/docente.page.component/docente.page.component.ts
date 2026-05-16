import { Component, computed, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Router } from '@angular/router';
import { injectQuery } from '@tanstack/angular-query-experimental';

import { MatIconModule } from '@angular/material/icon';
import { MatCardModule } from '@angular/material/card';
import { MatDividerModule } from '@angular/material/divider';
import { MatBadgeModule } from '@angular/material/badge';
import { MatButtonModule } from '@angular/material/button';
import { MatTableModule } from '@angular/material/table';
import { BaseChartDirective } from 'ng2-charts';
import { ChartData, ChartOptions } from 'chart.js';

import { Resumen } from '../../models/resumen.docente.model';
import { OpcionDocente } from '../../models/menu.options.model';
import { AuthQueries } from '../../../auth/data-access/auth.queries';
import { DocenteDashboardQueries } from '../../data-access/docente-dashboard.queries';
import { ComunicacionesQueries } from '../../../comunicaciones/data-access/comunicaciones.queries';
import { LoadingStateComponent } from '../../../../shared/components/loading-state/loading-state.component';
import { ErrorStateComponent } from '../../../../shared/components/error-state/error-state.component';
import { EmptyStateComponent } from '../../../../shared/components/empty-state/empty-state.component';
import { NavbarComponent } from '../../sections/navbar.component/navbar.component';

@Component({
  selector: 'app-docente.page.component',
  standalone: true,
  imports: [
    //Navbar,
    CommonModule,
    MatIconModule,
    MatCardModule,
    MatDividerModule,
    MatBadgeModule,
    MatButtonModule,
    MatTableModule,
    BaseChartDirective,
    NavbarComponent,
    LoadingStateComponent,
    ErrorStateComponent,
    EmptyStateComponent,
  ],
  templateUrl: './docente.page.component.html',
  styleUrl: './docente.page.component.css',
})
export class DocentePageComponent {
  private readonly router = inject(Router);
  private readonly authQueries = inject(AuthQueries);
  private readonly dashboardQueries = inject(DocenteDashboardQueries);
  private readonly comunicacionesQueries = inject(ComunicacionesQueries);

  private userQuery = injectQuery(() => this.authQueries.me());
  private dashboardQuery = injectQuery(() => this.dashboardQueries.dashboard());
  private conversacionesQuery = injectQuery(() =>
    this.comunicacionesQueries.conversaciones(this.userQuery.data()?.email),
  );

  user = computed(() => this.userQuery.data() || null);
  loading = computed(() => this.userQuery.isLoading());
  error = computed(() => this.userQuery.error());

  dashboard = computed(() => this.dashboardQuery.data());
  dashboardLoading = computed(() => this.dashboardQuery.isLoading());
  dashboardError = computed(() => this.dashboardQuery.error());
  dashboardIsEmpty = computed(() => {
    const data = this.dashboard();
    if (!data) return false;

    const noAssignments = data.assignments.length === 0;
    const noCourses = data.courses.length === 0;
    const noSummaryData =
      data.summary.totalStudents === 0 &&
      data.summary.pendingEvaluations === 0 &&
      data.summary.todayAttendances === 0 &&
      data.summary.monthlyAnnotations === 0;

    return noAssignments && noCourses && noSummaryData;
  });

  fullName = computed(() => {
    const p = this.user();
    if (!p) return '';
    const parts = [p.nombre, p.apellido_paterno, p.apellido_materno].filter(Boolean);
    return parts.join(' ');
  });

  misClasesColumns: string[] = ['curso', 'asignatura', 'sala', 'acciones'];
  misClasesData = computed(() =>
    (this.dashboard()?.assignments ?? []).map((item) => ({
      cadId: item.cadId,
      curso: item.courseName,
      asignatura: item.subjectName,
      sala: item.roomIds.length > 0 ? `Sala ${item.roomIds.join(', ')}` : 'Sin sala',
    })),
  );

  opciones: OpcionDocente[] = [
    {
      titulo: 'Mis Clases',
      descripcion: 'Gestiona tus cursos, asignaturas y evaluaciones asignadas.',
      icono: 'menu_book',
      ruta: '/docente/cursos',
      color: 'primary',
    },
    {
      titulo: 'Asistencia y Conducta',
      descripcion: 'Registra asistencia diaria y anotaciones de conducta de los estudiantes.',
      icono: 'fact_check',
      ruta: '/docente/asistencia',
      color: 'accent',
    },
    {
      titulo: 'Evaluaciones y Notas',
      descripcion: 'Crea evaluaciones y registra las calificaciones de tus estudiantes.',
      icono: 'grading',
      ruta: '/docente/evaluaciones',
      color: 'primary',
    },
    {
      titulo: 'Mensajería',
      descripcion: 'Comunícate con apoderados, estudiantes y personal del colegio.',
      icono: 'forum',
      ruta: '/comunicaciones',
      color: 'accent',
      badge: 3,
    },
  ];

  resumenRapido = computed<Resumen[]>(() => {
    const summary = this.dashboard()?.summary;
    if (!summary) {
      return [
        { etiqueta: 'Estudiantes', valor: '0', icono: 'boy' },
        { etiqueta: 'Evaluaciones Pendientes', valor: '0', icono: 'pending_actions' },
        { etiqueta: 'Asistencias registradas', valor: '0', icono: 'fact_check' },
        { etiqueta: 'Anotaciones del mes', valor: '0', icono: 'check' },
      ];
    }

    return [
      { etiqueta: 'Estudiantes', valor: String(summary.totalStudents), icono: 'boy' },
      {
        etiqueta: 'Evaluaciones Pendientes',
        valor: String(summary.pendingEvaluations),
        icono: 'pending_actions',
      },
      {
        etiqueta: 'Asistencias registradas',
        valor: String(summary.todayAttendances),
        icono: 'fact_check',
      },
      {
        etiqueta: 'Anotaciones del mes',
        valor: String(summary.monthlyAnnotations),
        icono: 'check',
      },
    ];
  });

  mensajesRecientes = computed(() => {
    const conversaciones = this.conversacionesQuery.data() ?? [];
    return conversaciones
      .filter((conv) => conv.mensajes.some((msg) => !msg.esMio))
      .sort((a, b) => b.fechaUltimoMensaje.getTime() - a.fechaUltimoMensaje.getTime())
      .slice(0, 3)
      .map((conv) => {
        const ultimoRecibido = [...conv.mensajes]
          .reverse()
          .find((msg) => !msg.esMio && msg.remitenteNombre);
        return {
          remitente: ultimoRecibido?.remitenteNombre || conv.participantes[0]?.nombre || 'Sin remitente',
          asunto: conv.asunto || 'Sin asunto',
          fecha: this.formatearFechaMensaje(conv.fechaUltimoMensaje),
          preview: conv.ultimoMensaje || 'Sin contenido',
        };
      });
  });

  asistenciaChartData = computed<ChartData<'bar'>>(() => {
    const courses = this.dashboard()?.courses ?? [];
    return {
      labels: courses.map((item) => item.courseName),
      datasets: [
        {
          label: 'Asistencia (registros)',
          data: courses.map((item) => item.attendanceCount),
          backgroundColor: '#2563eb',
          borderRadius: 8,
        },
      ],
    };
  });

  promedioGeneralChartData = computed<ChartData<'bar'>>(() => {
    const courses = this.dashboard()?.courses ?? [];
    return {
      labels: courses.map((item) => item.courseName),
      datasets: [
        {
          label: 'Promedio (escala 1.0 a 7.0)',
          data: courses.map((item) => item.generalAverage),
          backgroundColor: '#059669',
          borderRadius: 8,
        },
      ],
    };
  });

  asistenciaChartOptions: ChartOptions<'bar'> = {
    responsive: true,
    maintainAspectRatio: false,
    scales: {
      y: {
        beginAtZero: true,
        max: 100,
      },
    },
    plugins: {
      legend: {
        display: false,
      },
    },
  };

  promedioGeneralChartOptions: ChartOptions<'bar'> = {
    responsive: true,
    maintainAspectRatio: false,
    scales: {
      y: {
        beginAtZero: true,
        max: 7,
      },
    },
    plugins: {
      legend: {
        display: false,
      },
    },
  };

  navegar(ruta: string) {
    this.router.navigate([ruta]);
  }

  irAAsistenciaPorCurso(cadId: number): void {
    this.router.navigate(['/docente/asistencia'], {
      queryParams: { cadId },
    });
  }

  reintentarDashboard(): void {
    this.dashboardQuery.refetch();
  }

  private formatearFechaMensaje(fecha: Date): string {
    return new Intl.DateTimeFormat('es-CL', {
      weekday: 'short',
      day: '2-digit',
      month: '2-digit',
      hour: '2-digit',
      minute: '2-digit',
      hour12: false,
    }).format(fecha);
  }
}
