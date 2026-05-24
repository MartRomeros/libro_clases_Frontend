import { CommonModule } from '@angular/common';
import { Component, inject, signal, computed } from '@angular/core';
import { MatIconModule } from '@angular/material/icon';
import { Router } from '@angular/router';
import { injectQuery } from '@tanstack/angular-query-experimental';

import { AuthQueries } from '../../../auth/data-access/auth.queries';
import { NavbarComponent } from '../../sections/navbar.component/navbar.component';
import { Recurso } from '../../models/estudiante.model';
import { EmptyStateComponent } from '../../../../shared/components/empty-state/empty-state.component';

@Component({
  selector: 'app-resources-page',
  standalone: true,
  imports: [
    CommonModule,
    MatIconModule,
    NavbarComponent,
    EmptyStateComponent
  ],
  templateUrl: './resources.page.component.html',
  styleUrl: './resources.page.component.css',
})
export class ResourcesPageComponent {
  private readonly router = inject(Router);
  private readonly authQueries = inject(AuthQueries);

  profileQuery = injectQuery(() => this.authQueries.me());
  profile = computed(() => this.profileQuery.data());

  dataSource = signal<Recurso[]>([]);
  filtroActivo = signal<'TODOS' | 'PDF' | 'PPTX'>('TODOS');
  terminoBusqueda = signal('');

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

  recursosFiltrados = computed(() => {
    const filtro = this.filtroActivo();
    const termino = this.terminoBusqueda().trim().toLowerCase();

    return this.dataSource().filter((recurso) => {
      const coincideFiltro = filtro === 'TODOS' ? true : recurso.tipo === filtro;
      const coincideBusqueda =
        !termino ||
        [
          recurso.asignatura,
          recurso.titulo,
          recurso.tipo,
          recurso.tamano,
          this.formatearFecha(recurso.fechaSubida),
        ]
          .join(' ')
          .toLowerCase()
          .includes(termino);

      return coincideFiltro && coincideBusqueda;
    });
  });

  archivosNuevos = computed(() => this.dataSource().length);
  almacenamientoResumen = computed(() => 'Sin informacion disponible');
  totalMostrados = computed(() => this.recursosFiltrados().length);

  volver(): void {
    this.router.navigate(['/estudiante']);
  }

  setFiltro(tipo: 'TODOS' | 'PDF' | 'PPTX'): void {
    this.filtroActivo.set(tipo);
  }

  actualizarBusqueda(valor: string): void {
    this.terminoBusqueda.set(valor);
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

  getBadgeClaseTipo(tipo: string): string {
    switch (tipo) {
      case 'PDF': return 'badge-red';
      case 'PPTX': return 'badge-orange';
      case 'DOCX': return 'badge-blue';
      case 'VIDEO': return 'badge-purple';
      case 'ENLACE': return 'badge-green';
      default: return 'badge-gray';
    }
  }

  getBoxClaseTipo(tipo: string): string {
    switch (tipo) {
      case 'PDF': return 'box-red';
      case 'PPTX': return 'box-orange';
      case 'DOCX': return 'box-blue';
      case 'VIDEO': return 'box-purple';
      case 'ENLACE': return 'box-green';
      default: return 'box-gray';
    }
  }

  formatearFecha(fechaIso: string): string {
    const fecha = new Date(`${fechaIso}T00:00:00`);
    return new Intl.DateTimeFormat('es-CL', {
      day: '2-digit',
      month: 'short',
      year: 'numeric',
    }).format(fecha);
  }

  descargarRecurso(recurso: Recurso) {
    alert(`Preparando la descarga de: ${recurso.titulo} (${recurso.tamano}).`);
  }
}
