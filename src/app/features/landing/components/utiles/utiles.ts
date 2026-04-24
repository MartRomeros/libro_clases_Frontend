import { Component } from '@angular/core';
import { MatButtonModule } from '@angular/material/button';
import { MatCardModule } from '@angular/material/card';
import { MatIconModule } from '@angular/material/icon';

@Component({
  selector: 'app-utiles',
  imports: [MatCardModule, MatButtonModule, MatIconModule],
  templateUrl: './utiles.html',
  styleUrl: './utiles.css',
})
export class Utiles { }
