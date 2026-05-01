import { Component, inject, signal, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Router } from '@angular/router';
import { HttpClient } from '@angular/common/http';
import { MatToolbarModule } from '@angular/material/toolbar';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
import { MatCardModule } from '@angular/material/card';
import { MatTableModule } from '@angular/material/table';
import { MatDividerModule } from '@angular/material/divider';
import { MatTooltipModule } from '@angular/material/tooltip';
import { BaseChartDirective } from 'ng2-charts';
import { ChartConfiguration, ChartData, ChartType } from 'chart.js';
import { AuthService } from '../../core/services/auth.service';
import { environment } from '../../../environments/environment';

interface AsistenciaAsignatura {
  asignatura: string;
  clasesAsistidas: number;
  clasesAusentes: number;
  totalClases: number;
  porcentaje: number;
}

@Component({
  selector: 'app-student-attendance',
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
    BaseChartDirective
  ],
  templateUrl: './student-attendance.html',
  styleUrl: './student-attendance.css'
})
export class StudentAttendance implements OnInit {
  private router = inject(Router);
  public authService = inject(AuthService);
  private http = inject(HttpClient);

  displayedColumns: string[] = ['asignatura', 'asistidas', 'ausentes', 'total', 'porcentaje'];
  dataSource = signal<AsistenciaAsignatura[]>([]);

  // Chart configuration
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
  public pieChartData: ChartData<'pie', number[], string | string[]> = {
    labels: [ 'Asistencias', 'Inasistencias' ],
    datasets: [ {
      data: [ 0, 0 ],
      backgroundColor: ['#059669', '#dc2626'],
      hoverBackgroundColor: ['#047857', '#b91c1c'],
      borderWidth: 0
    } ]
  };
  public pieChartType: ChartType = 'pie';

  totalAsistidas = 0;
  totalAusentes = 0;
  porcentajeGeneral = 0;

  ngOnInit() {
    this.cargarDatosAsistencia();
  }

  cargarDatosAsistencia() {
    const user = this.authService.currentUser();
    // Intenta sacar el ID del usuario logueado. Si por algún motivo falla, asume ID 5 (Sofía) como fallback.
    const estudianteId = user?.id || 5; 

    const url = `${environment.backGestionUrl}/asistencias/estudiante/${estudianteId}`;
    
    this.http.get<any[]>(url).subscribe({
      next: (data) => {
        const processedData: AsistenciaAsignatura[] = data.map(item => {
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

        this.dataSource.set(processedData);

        // Calcular totales para el dashboard
        this.totalAsistidas = processedData.reduce((acc, curr) => acc + curr.clasesAsistidas, 0);
        this.totalAusentes = processedData.reduce((acc, curr) => acc + curr.clasesAusentes, 0);
        const totalGeneral = this.totalAsistidas + this.totalAusentes;
        
        if (totalGeneral > 0) {
          this.porcentajeGeneral = Number(((this.totalAsistidas / totalGeneral) * 100).toFixed(1));
        }

        // Actualizar gráfico
        this.pieChartData = {
          labels: [ 'Asistencias', 'Inasistencias' ],
          datasets: [ {
            data: [ this.totalAsistidas, this.totalAusentes ],
            backgroundColor: ['#059669', '#dc2626'],
            hoverBackgroundColor: ['#047857', '#b91c1c'],
            borderWidth: 0
          } ]
        };
      },
      error: (err) => {
        console.error('Error cargando asistencias reales:', err);
      }
    });
  }

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
