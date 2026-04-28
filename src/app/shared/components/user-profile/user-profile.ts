import { Component, OnInit, inject, signal, computed } from '@angular/core';
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
  ApoderadoPerfil,
  CursoPerfil,
  DocentePerfil,
  EstudiantePerfil,
  UserProfile,
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
export class UserProfileComponent implements OnInit {
  private authService = inject(AuthService);
  private router = inject(Router);

  /** Signal con los datos del perfil */
  profile = signal<UserProfile | null>(null);
  loading = signal(true);

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

  ngOnInit(): void {
    // Obtener usuario del AuthService y construir el perfil enriquecido (mock)
    const authUser = this.authService.currentUser();
    if (!authUser) {
      this.router.navigate(['/login']);
      return;
    }

    // Construir datos de perfil a partir del usuario autenticado
    // En producción, esto se obtendría del microservicio de autenticación/gestión escolar
    this.profile.set(this.buildMockProfile(authUser));
    this.loading.set(false);
  }

  /** Construye un perfil mock enriquecido basado en el usuario autenticado */
  private buildMockProfile(authUser: { id: string; email: string; name: string; role: string }): UserProfile {
    const rolNombre = authUser.role ?? 'Estudiante';
    const rol = { rol_id: 1, nombre: rolNombre };

    const baseProfile: UserProfile = {
      usuario_id: parseInt(authUser.id, 10) || 1,
      rut: '12.345.678-9',
      nombre: authUser.name?.split(' ')[0] ?? 'Usuario',
      apellido_paterno: authUser.name?.split(' ')[1] ?? 'Apellido',
      apellido_materno: authUser.name?.split(' ')[2],
      email: authUser.email,
      activo: true,
      rol,
    };

    // Enriquecer según rol
    const rolLower = rolNombre.toLowerCase();
    if (rolLower.includes('docente')) {
      const extra: DocentePerfil = { tipo: 'docente', especialidad: 'Matemáticas' };
      return { ...baseProfile, datosEspecificos: extra };
    }
    if (rolLower.includes('estudiante')) {
      const curso: CursoPerfil = { curso_id: 1, nivel: '1° Medio', letra: 'A', anio_academico: 2025 };
      const extra: EstudiantePerfil = { tipo: 'estudiante', curso };
      return { ...baseProfile, datosEspecificos: extra };
    }
    if (rolLower.includes('apoderado')) {
      const extra: ApoderadoPerfil = { tipo: 'apoderado' };
      return { ...baseProfile, datosEspecificos: extra };
    }

    return baseProfile;
  }

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
