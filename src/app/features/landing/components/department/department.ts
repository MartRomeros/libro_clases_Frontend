import { Component } from '@angular/core';
import { MatCardModule } from '@angular/material/card';
import { MatIconModule } from '@angular/material/icon';

@Component({
  selector: 'app-department',
  imports: [MatCardModule, MatIconModule],
  templateUrl: './department.html',
  styleUrl: './department.css',
})
export class Department { }
