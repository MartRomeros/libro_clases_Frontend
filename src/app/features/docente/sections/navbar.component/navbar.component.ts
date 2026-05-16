import { Component, ViewChild, inject } from '@angular/core';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
import { MatListItem, MatListItemIcon, MatListItemTitle, MatNavList } from '@angular/material/list';
import { MatMenuModule } from '@angular/material/menu';
import { MatSidenav, MatSidenavModule } from '@angular/material/sidenav';
import { Router, RouterLink } from '@angular/router';
import { AuthStore } from '../../../auth/data-access/auth.store';
import { ToolbarComponent } from '../toolbar.component/toolbar.component';

@Component({
  selector: 'app-navbar-docente',
  imports: [
    MatSidenavModule,
    MatIconModule,
    MatButtonModule,
    MatMenuModule,
    MatNavList,
    MatListItem,
    MatListItemIcon,
    MatListItemTitle,
    ToolbarComponent ,
    RouterLink
  ],
  templateUrl: './navbar.component.html',
  styleUrl: './navbar.component.css',
})
export class NavbarComponent {
  private readonly authStore = inject(AuthStore);
  private readonly router = inject(Router);

  @ViewChild('sidenav') sidenav!: MatSidenav;

  verPerfil(): void {
    this.sidenav.close();
    this.router.navigate(['/perfil']);
  }

  cerrarSesion(): void {
    this.authStore.clearSession();
    this.sidenav.close();
    this.router.navigate(['/auth/login']);
  }
}
