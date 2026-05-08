import { Component, computed, inject } from '@angular/core';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
import { MatToolbarModule } from '@angular/material/toolbar';
import { Router } from '@angular/router';
import { injectQuery } from '@tanstack/angular-query-experimental';
import { MatTooltipModule } from '@angular/material/tooltip';
import { AuthStore } from '../../features/auth/data-access/auth.store';
import { AuthQueries } from '../../features/auth/data-access/auth.queries';

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

  private router = inject(Router);
  private authStore = inject(AuthStore)

  private authQuery = inject(AuthQueries)

  profileQuery = injectQuery(() => this.authQuery.me())

  user = computed(() => this.profileQuery.data())
  loading = computed(() => this.profileQuery.isLoading())

  navegarA(ruta: string): void {
    this.router.navigate([ruta]);
  }

  cerrarSesion(): void {
    this.authStore.clearSession()
    this.router.navigate(['auth'])
  }

}
