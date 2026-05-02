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
import { MatProgressSpinnerModule } from '@angular/material/progress-spinner';
import { BaseChartDirective } from 'ng2-charts';
import { ChartConfiguration, ChartData, ChartType } from 'chart.js';
import { injectQuery } from '@tanstack/angular-query-experimental';
import { AuthService } from '../../../../../core/services/auth.service';
import { AdminService, AttendanceByStudent } from '../../../../../core/services/admin.service';
import { Navbar } from '../../../../../layout/navbar/navbar';


@Component({
  selector: 'app-attendance',
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
    MatProgressSpinnerModule,
    BaseChartDirective,
    Navbar 
  ],
  templateUrl: './attendance.html',
  styleUrl: './attendance.css'
})
export class Attendance {

  private router = inject(Router);
  public authService = inject(AuthService);
  private adminService = inject(AdminService);

  private estudianteId = computed(() => {
    const user = this.authService.currentUser()
    return user?.id || '5';
  });

  asistenciaQuery = injectQuery(() =>
    this.adminService.getAsistenciasEstudianteOptions(parseInt(this.estudianteId()))
  );

  processedData = computed(() => {
    const data = this.asistenciaQuery.data();
    if (!data) return [];
    return data.map((item: AttendanceByStudent) => {
      const asistidas = item.clasesAsistidas || 0;
      const ausentes = item.clasesAusentes || 0;
      const total = asistidas + ausentes;
      const porcentaje = total > 0 ? Number(((asistidas / total) * 100).toFixed(1)) : 0;

      return {
        asignatura: item.asignaturaNombre,
        clasesAsistidas: asistidas,
        clasesAusentes: ausentes,
        totalClases: total,
        porcentaje: porcentaje
      };
    });
  });

  totalAsistidas = computed(() => this.processedData().reduce((acc, curr) => acc + curr.clasesAsistidas, 0));
  totalAusentes = computed(() => this.processedData().reduce((acc, curr) => acc + curr.clasesAusentes, 0));

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
          font: { family: "'Inter', sans-serif", size: 13 }
        }
      },
    }
  };

  pieChartData = computed<ChartData<'pie', number[], string | string[]>>(() => ({
    labels: ['Asistencias', 'Inasistencias'],
    datasets: [{
      data: [this.totalAsistidas(), this.totalAusentes()],
      backgroundColor: ['#059669', '#dc2626'],
      hoverBackgroundColor: ['#047857', '#b91c1c'],
      borderWidth: 0
    }]
  }));

  public pieChartType: ChartType = 'pie';

  get userProfile(): string {
    const user = this.authService.currentUser();
    const nombre = user?.name || 'Usuario';
    const role = user?.role ? user.role.charAt(0).toUpperCase() + user.role.slice(1).toLowerCase() : 'Estudiante';
    return `${nombre} | ${role}`;
  }

  volverAlHome(): void {
    this.router.navigate(['/estudiante']);
  }

  cerrarSesion(): void {
    this.authService.logout();
    this.router.navigate(['/login']);
  }
}