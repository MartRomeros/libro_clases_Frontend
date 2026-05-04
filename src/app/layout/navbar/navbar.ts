import { Component, computed, inject } from '@angular/core';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
import { MatToolbarModule } from '@angular/material/toolbar';
import { AuthService } from '../../core/services/auth.service';
import { Router } from '@angular/router';
import { injectQuery } from '@tanstack/angular-query-experimental';
import { MatTooltipModule } from '@angular/material/tooltip';
import { AuthStore } from '../../features/auth/data-access/auth.store';
import { User } from '../../features/auth/models/profile.response.model';

@Component({
  selector: 'app-navbar',
  imports: [
    MatButtonModule,
    MatIconModule,
    MatToolbarModule,
    MatTooltipModule
  ],
  templateUrl: './navbar.html',
  styleUrl: './navbar.css',
})
export class Navbar {

  private authService = inject(AuthService);
  private router = inject(Router);
  authStore = inject(AuthStore)

  user:User = JSON.parse(localStorage.getItem('user') || "")

  profileQuery = injectQuery(() => this.authService.profileOptions());

  docenteNombre = computed(() => {
    const p = this.profileQuery.data();
    return p ? `${p.nombre} ${p.apellido_paterno}` : 'Docente';
  });

  navegarA(ruta: string): void {
    this.router.navigate([ruta]);
  }

  cerrarSesion(): void {
    this.authStore.clearSession()
    this.router.navigate(['auth'])
  }

}
