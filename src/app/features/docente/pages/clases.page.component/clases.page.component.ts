import { Component, signal, inject, computed } from '@angular/core';
import { CommonModule } from '@angular/common';
import { MatCardModule } from '@angular/material/card';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
import { MatTableModule, MatTableDataSource } from '@angular/material/table';
import { MatProgressSpinnerModule } from '@angular/material/progress-spinner';
import { MatDividerModule } from '@angular/material/divider';
import { MatListModule } from '@angular/material/list';
import { Router } from '@angular/router';
import { injectQuery } from '@tanstack/angular-query-experimental';

import { Navbar } from '../../../../layout/navbar/navbar';
import { AuthQueries } from '../../../auth/data-access/auth.queries';
import { EvaluationsQueries } from '../../data-access/evaluations.queries';
import { DocenteCurso } from '../../models/evaluations.model';

@Component({
  selector: 'app-clases-page',
  standalone: true,
  imports: [
    CommonModule,
    MatCardModule,
    MatButtonModule,
    MatIconModule,
    MatTableModule,
    MatProgressSpinnerModule,
    MatDividerModule,
    MatListModule,
    Navbar
  ],
  templateUrl: './clases.page.component.html',
  styleUrl: './clases.page.component.css'
})
export class ClasesPageComponent {
  private readonly authQueries = inject(AuthQueries);
  private readonly evaluationsQueries = inject(EvaluationsQueries);
  private readonly router = inject(Router);

  profileQuery = injectQuery(() => this.authQueries.me());
  profile = computed(() => this.profileQuery.data());

  cursosQuery = injectQuery(() =>
    this.evaluationsQueries.cursosDocente(this.profile()?.usuario_id ?? 0)
  );
  
  cursos = computed(() => this.cursosQuery.data() ?? []);
  
  displayedColumns = ['curso', 'asignatura', 'anioAcademico', 'acciones'];
  dataSource = new MatTableDataSource<DocenteCurso>([]);

  constructor() {
    // Update dataSource when cursos change
    const checkData = () => {
      if (!this.cursosQuery.isPending()) {
        this.dataSource.data = this.cursos();
      } else {
        setTimeout(checkData, 100);
      }
    };
    checkData();
  }

  verDetalleCurso(curso: DocenteCurso): void {
    // Navigate to evaluaciones with the selected course
    this.router.navigate(['/docente/evaluaciones'], { 
      state: { cursoSeleccionado: curso } 
    });
  }

  volver(): void {
    const rol = this.profile()?.rol?.nombre?.toLowerCase() ?? '';
    if (rol.includes('admin')) this.router.navigate(['/admin']);
    else if (rol.includes('docente')) this.router.navigate(['/docente']);
    else if (rol.includes('estudiante')) this.router.navigate(['/estudiante']);
    else this.router.navigate(['/login']);
  }
}
