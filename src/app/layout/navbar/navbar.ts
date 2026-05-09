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

  profileQuery = injectQuery(() => this.authService.profileOptions());
  currentUser = computed(() => this.authStore.currentUser() || this.profileQuery.data());

  navegarA(ruta: string): void {
    this.router.navigate([ruta]);
  }

  cerrarSesion(): void {
    this.authStore.clearSession()
    this.router.navigate(['auth'])
  }

}
