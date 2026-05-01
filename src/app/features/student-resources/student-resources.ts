import { Component, inject, signal, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Router } from '@angular/router';
import { MatToolbarModule } from '@angular/material/toolbar';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
import { MatCardModule } from '@angular/material/card';
import { MatTableModule } from '@angular/material/table';
import { MatDividerModule } from '@angular/material/divider';
import { MatTooltipModule } from '@angular/material/tooltip';
import { MatChipsModule } from '@angular/material/chips';
import { AuthService } from '../../core/services/auth.service';

interface Recurso {
  id: number;
  asignatura: string;
  titulo: string;
  tipo: 'PDF' | 'DOCX' | 'PPTX' | 'VIDEO' | 'ENLACE';
  fechaSubida: string;
  tamano: string;
}

@Component({
  selector: 'app-student-resources',
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
    MatChipsModule
  ],
  templateUrl: './student-resources.html',
  styleUrl: './student-resources.css'
})
export class StudentResources implements OnInit {
  private router = inject(Router);
  public authService = inject(AuthService);

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

  get userProfile(): string {
    const user = this.authService.currentUser();
    const nombre = user?.name || 'Usuario';
    const role = user?.role ? user.role.charAt(0).toUpperCase() + user.role.slice(1).toLowerCase() : 'Estudiante';
    return `${nombre} | ${role}`;
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

  volverAlHome(): void {
    this.router.navigate(['/estudiante']);
  }

  cerrarSesion(): void {
    this.authService.logout();
    this.router.navigate(['/login']);
  }
}
