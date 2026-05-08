import { Component, inject, computed } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Router } from '@angular/router';
import { MatCardModule } from '@angular/material/card';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
import { MatChipsModule } from '@angular/material/chips';
import { MatDividerModule } from '@angular/material/divider';
import { MatTooltipModule } from '@angular/material/tooltip';
import { MatProgressSpinnerModule } from '@angular/material/progress-spinner';

import { Navbar } from '../../../layout/navbar/navbar';
import { DocentePerfil, EstudiantePerfil } from '../../../features/auth/models/profile.response.model';
import { AuthQueries } from '../../../features/auth/data-access/auth.queries';
import { injectQuery } from '@tanstack/angular-query-experimental';

@Component({
  selector: 'app-user-profile',
  standalone: true,
  imports: [
    CommonModule,
    MatCardModule,
    MatButtonModule,
    MatIconModule,
    MatChipsModule,
    MatDividerModule,
    MatTooltipModule,
    MatProgressSpinnerModule,
    Navbar 
  ],
  templateUrl: './user-profile.html',
  styleUrl: './user-profile.css',
})
export class UserProfileComponent {

  private authQuery = inject(AuthQueries)
  private router = inject(Router);

  profileQuery = injectQuery(()=> this.authQuery.me())
  user = computed(()=> this.profileQuery.data())
  loading = computed(()=> this.profileQuery.isLoading())
  

  initials = computed(() => {
    const p = this.user()
    if (!p) return '?';
    return `${p.nombre.charAt(0)}${p.apellido_paterno.charAt(0)}`.toUpperCase();
  });

  fullName = computed(() => {
    const p = this.user()
    if (!p) return '';
    const parts = [p.nombre, p.apellido_paterno, p.apellido_materno].filter(Boolean);
    return parts.join(' ');
  });

  rolColor = computed(() => {
    const rol = this.user()?.rol.nombre.toLowerCase() ?? '';
    if (rol.includes('admin')) return 'warn';
    if (rol.includes('docente')) return 'primary';
    if (rol.includes('estudiante')) return 'accent';
    return undefined;
  });

  rolIcon = computed(() => {
    const rol = this.user()?.rol.nombre.toLowerCase() ?? '';
    if (rol.includes('admin')) return 'admin_panel_settings';
    if (rol.includes('docente')) return 'school';
    if (rol.includes('estudiante')) return 'person';
    if (rol.includes('apoderado')) return 'family_restroom';
    return 'account_circle';
  });

  asDocente(d: unknown): DocentePerfil { return d as DocentePerfil; }
  asEstudiante(d: unknown): EstudiantePerfil { return d as EstudiantePerfil; }

  volver(): void {
    const rol = this.user()?.rol.nombre.toLowerCase() ?? '';
    if (rol.includes('admin')) this.router.navigate(['/admin']);
    else if (rol.includes('docente')) this.router.navigate(['/docente']);
    else if (rol.includes('estudiante')) this.router.navigate(['/estudiante']);
    else this.router.navigate(['/auth/login']);
  }
}
