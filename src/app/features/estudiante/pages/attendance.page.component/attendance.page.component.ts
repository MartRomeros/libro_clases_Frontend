import { Component, inject, computed } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Router } from '@angular/router';
import { MatToolbarModule } from '@angular/material/toolbar';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
import { MatCardModule } from '@angular/material/card';
import { MatTableModule } from '@angular/material/table';
import { MatDividerModule } from '@angular/material/divider';
import { MatTooltipModule } from '@angular/material/tooltip';
import { BaseChartDirective } from 'ng2-charts';
import { ChartConfiguration, ChartData, ChartType } from 'chart.js';
import { injectQuery } from '@tanstack/angular-query-experimental';

import { Navbar } from '../../../../layout/navbar/navbar';
import { AuthQueries } from '../../../auth/data-access/auth.queries';
import { EstudianteQueries } from '../../data-access/estudiante.queries';
import { LoadingStateComponent } from '../../../../shared/components/loading-state/loading-state.component';
import { ErrorStateComponent } from '../../../../shared/components/error-state/error-state.component';
import { EmptyStateComponent } from '../../../../shared/components/empty-state/empty-state.component';

@Component({
  selector: 'app-attendance-page',
  standalone: true,
  imports: [
    CommonModule,
    MatToolbarModule,
    MatButtonModule,
    MatIconModule,
    MatCardModule,
    MatTableModule,
    MatDividerModule,
    MatTooltipModule,
    BaseChartDirective,
    Navbar,
    LoadingStateComponent,
    ErrorStateComponent,
    EmptyStateComponent
  ],
  templateUrl: './attendance.page.component.html',
  styleUrl: './attendance.page.component.css',
})
export class AttendancePageComponent {
  private readonly router = inject(Router);
  private readonly authQueries = inject(AuthQueries);
  private readonly estudianteQueries = inject(EstudianteQueries);

  profileQuery = injectQuery(() => this.authQueries.me());
  profile = computed(() => this.profileQuery.data());

  private estudianteId = computed(() => {
    return this.profile()?.usuario_id ?? 0;
  });

  asistenciaQuery = injectQuery(() => 
    this.estudianteQueries.asistencia(this.estudianteId())
  );

  isLoading = computed(() => 
    this.profileQuery.isPending() || 
    (!!this.estudianteId() && this.asistenciaQuery.isPending())
  );
  
  isError = computed(() => this.profileQuery.isError() || this.asistenciaQuery.isError());
  error = computed(() => this.profileQuery.error() || this.asistenciaQuery.error());

  processedData = computed(() => {
    const response = this.asistenciaQuery.data();
    if (!response) return [];
    const data = response.data || response;
    if (!Array.isArray(data)) return [];
    return data.map((item: any) => {
      const asistidas = Number(item.clasesAsistidas) || 0;
      const ausentes = Number(item.clasesAusentes) || 0;
      const total = asistidas + ausentes;
      const porcentaje = total > 0 ? Number(((asistidas / total) * 100).toFixed(1)) : 0;

      return {
        asignatura: item.asignaturaNombre,
        clasesAsistidas: asistidas,
        clasesAusentes: ausentes,
        totalClases: total,
        porcentaje: porcentaje,
      };
    });
  });

  totalAsistidas = computed(() =>
    this.processedData().reduce((acc, curr) => acc + curr.clasesAsistidas, 0),
  );
  totalAusentes = computed(() =>
    this.processedData().reduce((acc, curr) => acc + curr.clasesAusentes, 0),
  );

  porcentajeGeneral = computed(() => {
    const total = this.totalAsistidas() + this.totalAusentes();
    return total > 0 ? Number(((this.totalAsistidas() / total) * 100).toFixed(1)) : 0;
  });

  displayedColumns: string[] = ['asignatura', 'asistidas', 'ausentes', 'total', 'porcentaje'];

  public pieChartOptions: ChartConfiguration['options'] = {
    responsive: true,
    maintainAspectRatio: false,
    plugins: {
      legend: {
        display: true,
        position: 'bottom',
        labels: {
          font: { family: "'Inter', sans-serif", size: 13 },
        },
      },
    },
  };

  pieChartData = computed<ChartData<'pie', number[], string | string[]>>(() => ({
    labels: ['Asistencias', 'Inasistencias'],
    datasets: [
      {
        data: [this.totalAsistidas(), this.totalAusentes()],
        backgroundColor: ['#059669', '#dc2626'],
        hoverBackgroundColor: ['#047857', '#b91c1c'],
        borderWidth: 0,
      },
    ],
  }));

  public pieChartType: ChartType = 'pie';

  volver(): void {
    this.router.navigate(['/estudiante']);
  }
}
