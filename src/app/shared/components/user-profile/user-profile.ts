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

import { AuthService } from '../../../core/services/auth.service';
import {
  DocentePerfil,
  EstudiantePerfil,
} from '../../../core/models/user-profile.model';

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
  ],
  templateUrl: './user-profile.html',
  styleUrl: './user-profile.css',
})
export class UserProfileComponent {
  private authService = inject(AuthService);
  private router = inject(Router);

  /** Query con los datos del perfil */
  profileQuery = this.authService.profileQuery;

  /** Alias para data del perfil */
  profile = computed(() => this.profileQuery.data());
  loading = computed(() => this.profileQuery.isLoading());

  /** Iniciales para el avatar */
  initials = computed(() => {
    const p = this.profile();
    if (!p) return '?';
    return `${p.nombre.charAt(0)}${p.apellido_paterno.charAt(0)}`.toUpperCase();
  });

  /** Nombre completo */
  fullName = computed(() => {
    const p = this.profile();
    if (!p) return '';
    const parts = [p.nombre, p.apellido_paterno, p.apellido_materno].filter(Boolean);
    return parts.join(' ');
  });

  /** Color de chip de rol */
  rolColor = computed(() => {
    const rol = this.profile()?.rol?.nombre?.toLowerCase() ?? '';
    if (rol.includes('admin')) return 'warn';
    if (rol.includes('docente')) return 'primary';
    if (rol.includes('estudiante')) return 'accent';
    return undefined;
  });

  /** Icono principal según el rol */
  rolIcon = computed(() => {
    const rol = this.profile()?.rol?.nombre?.toLowerCase() ?? '';
    if (rol.includes('admin')) return 'admin_panel_settings';
    if (rol.includes('docente')) return 'school';
    if (rol.includes('estudiante')) return 'person';
    if (rol.includes('apoderado')) return 'family_restroom';
    return 'account_circle';
  });

  /** Casteos tipados para el template */
  asDocente(d: unknown): DocentePerfil { return d as DocentePerfil; }
  asEstudiante(d: unknown): EstudiantePerfil { return d as EstudiantePerfil; }

  volver(): void {
    const rol = this.profile()?.rol?.nombre?.toLowerCase() ?? '';
    if (rol.includes('admin')) this.router.navigate(['/admin']);
    else if (rol.includes('docente')) this.router.navigate(['/docente']);
    else if (rol.includes('estudiante')) this.router.navigate(['/estudiante']);
    else this.router.navigate(['/login']);
  }
}
