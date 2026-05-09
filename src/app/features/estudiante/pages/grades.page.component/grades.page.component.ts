import { Component, inject, computed, effect } from '@angular/core';
import { CommonModule } from '@angular/common';
import { MatTableDataSource, MatTableModule } from '@angular/material/table';
import { MatCardModule } from '@angular/material/card';
import { MatDividerModule } from '@angular/material/divider';
import { MatIconModule } from '@angular/material/icon';
import { MatButtonModule } from '@angular/material/button';
import { Router } from '@angular/router';
import { injectQuery } from '@tanstack/angular-query-experimental';

import { Navbar } from '../../../../layout/navbar/navbar';
import { AuthQueries } from '../../../auth/data-access/auth.queries';
import { EstudianteQueries } from '../../data-access/estudiante.queries';
import { LoadingStateComponent } from '../../../../shared/components/loading-state/loading-state.component';
import { ErrorStateComponent } from '../../../../shared/components/error-state/error-state.component';
import { EmptyStateComponent } from '../../../../shared/components/empty-state/empty-state.component';

@Component({
  selector: 'app-grades-page',
  standalone: true,
  imports: [
    CommonModule,
    Navbar,
    MatCardModule,
    MatDividerModule,
    MatIconModule,
    MatTableModule,
    MatButtonModule,
    LoadingStateComponent,
    ErrorStateComponent,
    EmptyStateComponent
   ],
  templateUrl: './grades.page.component.html',
  styleUrl: './grades.page.component.css',
})
export class GradesPageComponent {
  private readonly authQueries = inject(AuthQueries);
  private readonly estudianteQueries = inject(EstudianteQueries);
  private readonly router = inject(Router);

  profileQuery = injectQuery(() => this.authQueries.me());
  profile = computed(() => this.profileQuery.data());
  estudianteId = computed(() => this.profile()?.usuario_id ?? 0);

  notasQuery = injectQuery(() => 
    this.estudianteQueries.notas(this.estudianteId())
  );

  isLoading = computed(() => 
    this.profileQuery.isPending() || 
    (!!this.estudianteId() && this.notasQuery.isPending())
  );

  isError = computed(() => this.profileQuery.isError() || this.notasQuery.isError());
  error = computed(() => this.profileQuery.error() || this.notasQuery.error());
  
  dataSource = new MatTableDataSource<any>([]);
  displayedColumns: string[] = ['asignatura', 'nota1', 'nota2', 'nota3', 'promedio'];

  tablaData = computed(() => {
    const notas = this.notasQuery.data() ?? [];
    return notas.map(n => {
      const v1 = n.notaEv1 || null;
      const v2 = n.notaEv2 || null;
      const v3 = n.notaEv3 || null;
      
      let suma = 0;
      let cont = 0;
      if (v1) { suma += v1; cont++; }
      if (v2) { suma += v2; cont++; }
      if (v3) { suma += v3; cont++; }

      return {
        asignatura: n.asignaturaNombre,
        nota1: v1 || '-',
        nota2: v2 || '-',
        nota3: v3 || '-',
        promedio: cont > 0 ? (suma / cont).toFixed(1) : '-'
      };
    });
  });

  constructor() {
    effect(() => {
      this.dataSource.data = this.tablaData();
    });
  }

  volver(): void {
    this.router.navigate(['/estudiante']);
  }
}
