import { Component, EventEmitter, Input, Output, inject, signal } from '@angular/core';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
import { MatMenuModule } from '@angular/material/menu';
import { MatSidenav } from '@angular/material/sidenav';
import { MatToolbarModule } from '@angular/material/toolbar';
import { MatTooltipModule } from '@angular/material/tooltip';
import { Router, RouterLink } from '@angular/router';
import { AuthStore } from '../../../auth/data-access/auth.store';

@Component({
  selector: 'app-toolbar-docente',
  imports: [MatToolbarModule, MatButtonModule, MatIconModule, MatMenuModule, MatTooltipModule,RouterLink],
  templateUrl: './toolbar.component.html',
  styleUrl: './toolbar.component.css',
})
export class ToolbarComponent {
  private readonly authStore = inject(AuthStore);
  private readonly router = inject(Router);

  @Input() sidenav?: MatSidenav;
  @Output() menuClick = new EventEmitter<void>();
  isScrolled = signal(false);

  verPerfil(): void {
    this.router.navigate(['/perfil']);
  }

  cerrarSesion(): void {
    this.authStore.clearSession();
    this.router.navigate(['/auth/login']);
  }
}
