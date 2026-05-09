import { Component, ViewChild } from '@angular/core';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
import { MatSidenav, MatSidenavModule } from '@angular/material/sidenav'
import { MatListItem, MatListItemIcon, MatListItemTitle, MatNavList } from '@angular/material/list';
import { RouterLink } from '@angular/router';
import { Toolbar } from '../toolbar/toolbar';

@Component({
  selector: 'app-navbar',
  imports: [
    MatSidenavModule,
    MatIconModule,
    MatButtonModule,
    MatNavList,
    MatListItem,
    MatListItemIcon,
    MatListItemTitle,
    RouterLink,
    Toolbar


  ],
  templateUrl: './navbar.html',
  styleUrl: './navbar.css',
})
export class Navbar {
  @ViewChild('sidenav') sidenav!: MatSidenav;
}
