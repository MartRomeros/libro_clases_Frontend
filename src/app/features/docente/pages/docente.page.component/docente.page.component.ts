import { Component, computed, inject } from '@angular/core';
import { Resumen } from '../../models/resumen.docente.model';
import { OpcionDocente } from '../../models/menu.options.model';
import { Navbar } from '../../../../layout/navbar/navbar';
import { CommonModule } from '@angular/common';
import { MatIconModule } from '@angular/material/icon';
import { Router } from '@angular/router';
import { AuthStore } from '../../../auth/data-access/auth.store';
import { MatCardModule } from '@angular/material/card';
import { MatDividerModule } from '@angular/material/divider';
import { MatBadgeModule } from '@angular/material/badge';
import { MatButtonModule } from '@angular/material/button';
import { User } from '../../../auth/models/profile.response.model';
import { AuthQueries } from '../../../auth/data-access/auth.queries';
import { injectQuery } from '@tanstack/angular-query-experimental';

@Component({
  selector: 'app-docente.page.component',
  imports: [
    Navbar,
    CommonModule,
    MatIconModule,
    MatCardModule,
    MatDividerModule,
    MatBadgeModule,
    MatButtonModule
  ],
  templateUrl: './docente.page.component.html',
  styleUrl: './docente.page.component.css',
})
export class DocentePageComponent {

  private readonly router = inject(Router)
  readonly authStore = inject(AuthStore)
  private readonly authQueries = inject(AuthQueries)
  private queryProfile = injectQuery(() => this.authQueries.me())

  profile = computed(()=> this.queryProfile.data())

  loading = computed(()=> this.queryProfile.isPending())

  fullName = computed(() => {
    const p = this.profile();
    if (!p) return '';
    const parts = [p.nombre, p.apellido_paterno, p.apellido_materno].filter(Boolean);
    return parts.join(' ');
  });


  opciones: OpcionDocente[] = [
    {
      titulo: 'Mis Clases',
      descripcion: 'Gestiona tus cursos, asignaturas y evaluaciones asignadas.',
      icono: 'menu_book',
      ruta: '/docente/clases',
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
      ruta: '/docente/mensajes',
      color: 'accent',
      badge: 3,
    },
  ];

  resumenRapido: Resumen[] = [
    { etiqueta: 'Clases hoy', valor: '3', icono: 'today' },
    { etiqueta: 'Estudiantes', valor: '87', icono: 'group' },
    { etiqueta: 'Evaluaciones pendientes', valor: '2', icono: 'pending_actions' },
    { etiqueta: 'Mensajes sin leer', valor: '3', icono: 'mark_email_unread' },
  ];


  navegarA(ruta: string): void {
    this.router.navigate([ruta]);
  }



}
