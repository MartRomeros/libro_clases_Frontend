import { Component, Input, Output, EventEmitter } from '@angular/core';
import { CommonModule } from '@angular/common';
import { MatCardModule } from '@angular/material/card';
import { MatIconModule } from '@angular/material/icon';
import { MatBadgeModule } from '@angular/material/badge';

@Component({
  selector: 'app-mensajeria-card',
  standalone: true,
  imports: [CommonModule, MatCardModule, MatIconModule, MatBadgeModule],
  template: `
    <mat-card class="opcion-card" (click)="onClick.emit()" tabindex="0">
      <mat-card-content class="opcion-card-content">
        <div class="opcion-icon-wrapper icon-blue">
          @if (badge > 0) {
            <mat-icon [matBadge]="badge" matBadgeColor="warn" class="opcion-icono">
              forum
            </mat-icon>
          } @else {
            <mat-icon class="opcion-icono">forum</mat-icon>
          }
        </div>
        <div class="opcion-texto">
          <h3 class="opcion-titulo">Mensajería</h3>
          <p class="opcion-descripcion">
            Comunícate con apoderados, estudiantes y personal del colegio.
          </p>
        </div>
        <mat-icon class="opcion-chevron">chevron_right</mat-icon>
      </mat-card-content>
    </mat-card>
  `,
  styles: [`
    :host {
      display: block;
    }
    .opcion-card {
      cursor: pointer;
      transition: all 0.3s ease;
      border-radius: 16px;
      overflow: hidden;
      border: none;
      box-shadow: 0 4px 12px rgba(0,0,0,0.05);
      background: white;
    }
    .opcion-card:hover {
      transform: translateY(-4px);
      box-shadow: 0 8px 24px rgba(0,0,0,0.1);
    }
    .opcion-card-content {
      display: flex;
      align-items: center;
      padding: 24px !ng-important;
      gap: 20px;
    }
    .opcion-icon-wrapper {
      width: 64px;
      height: 64px;
      border-radius: 16px;
      display: flex;
      align-items: center;
      justify-content: center;
      flex-shrink: 0;
    }
    .icon-blue {
      background-color: #e3f2fd;
      color: #1976d2;
    }
    .opcion-icono {
      font-size: 32px;
      width: 32px;
      height: 32px;
    }
    .opcion-texto {
      flex: 1;
    }
    .opcion-titulo {
      margin: 0;
      font-size: 1.25rem;
      font-weight: 700;
      color: #2c3e50;
    }
    .opcion-descripcion {
      margin: 4px 0 0;
      font-size: 0.95rem;
      color: #64748b;
      line-height: 1.4;
    }
    .opcion-chevron {
      color: #cbd5e1;
    }
  `]
})
export class MensajeriaCardComponent {
  @Input() badge = 0;
  @Output() onClick = new EventEmitter<void>();
}
