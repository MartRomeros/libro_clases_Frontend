import { CommonModule } from '@angular/common';
import { Component, inject, signal, computed } from '@angular/core';
import { MatButtonModule } from '@angular/material/button';
import { MatCardModule } from '@angular/material/card';
import { MatChipsModule } from '@angular/material/chips';
import { MatDividerModule } from '@angular/material/divider';
import { MatIconModule } from '@angular/material/icon';
import { MatTableModule } from '@angular/material/table';
import { MatToolbarModule } from '@angular/material/toolbar';
import { MatTooltipModule } from '@angular/material/tooltip';
import { Router } from '@angular/router';
import { injectQuery } from '@tanstack/angular-query-experimental';

import { AuthQueries } from '../../../auth/data-access/auth.queries';
import { Navbar } from '../../../../layout/navbar/navbar';
import { Recurso } from '../../models/estudiante.model';

@Component({
  selector: 'app-resources-page',
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
    MatChipsModule,
    Navbar 
  ],
  templateUrl: './resources.page.component.html',
  styleUrl: './resources.page.component.css',
})
export class ResourcesPageComponent {
  private readonly router = inject(Router);
  private readonly authQueries = inject(AuthQueries);

  profileQuery = injectQuery(() => this.authQueries.me());
  profile = computed(() => this.profileQuery.data());

  displayedColumns: string[] = ['tipo', 'asignatura', 'titulo', 'fecha', 'tamano', 'acciones'];
  dataSource = signal<Recurso[]>([]);

  ngOnInit() {
    this.cargarRecursosMock();
  }

  cargarRecursosMock() {
    const data: Recurso[] = [
      { id: 1, asignatura: 'Matemáticas', titulo: 'Guía de Ejercicios: Álgebra Lineal', tipo: 'PDF', fechaSubida: '2026-04-25', tamano: '2.4 MB' },
      { id: 2, asignatura: 'Lenguaje y Comunicación', titulo: 'Lectura Complementaria del mes', tipo: 'PDF', fechaSubida: '2026-04-20', tamano: '1.1 MB' },
      { id: 3, asignatura: 'Historia y Geografía', titulo: 'Presentación: Revolución Industrial', tipo: 'PPTX', fechaSubida: '2026-04-22', tamano: '5.6 MB' },
      { id: 4, asignatura: 'Ciencias Naturales', titulo: 'Laboratorio: Células', tipo: 'DOCX', fechaSubida: '2026-04-28', tamano: '1.8 MB' },
      { id: 5, asignatura: 'Matemáticas', titulo: 'Video explicativo: Funciones Avanzadas', tipo: 'VIDEO', fechaSubida: '2026-04-29', tamano: '124 MB' }
    ];
    this.dataSource.set(data);
  }

  volver(): void {
    this.router.navigate(['/estudiante']);
  }

  getIconoRecurso(tipo: string): string {
    switch (tipo) {
      case 'PDF': return 'picture_as_pdf';
      case 'PPTX': return 'slideshow';
      case 'DOCX': return 'description';
      case 'VIDEO': return 'play_circle_filled';
      case 'ENLACE': return 'link';
      default: return 'insert_drive_file';
    }
  }

  getColorClaseRecurso(tipo: string): string {
    switch (tipo) {
      case 'PDF': return 'text-red';
      case 'PPTX': return 'text-orange';
      case 'DOCX': return 'text-blue';
      case 'VIDEO': return 'text-purple';
      default: return 'text-gray';
    }
  }

  descargarRecurso(recurso: Recurso) {
    alert(`Preparando la descarga de: ${recurso.titulo} (${recurso.tamano}).`);
  }
}
