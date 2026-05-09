import { Component, Input, Output, EventEmitter, OnChanges, SimpleChanges } from '@angular/core';
import { CommonModule } from '@angular/common';
import { MatIconModule } from '@angular/material/icon';
import { MatButtonModule } from '@angular/material/button';
import { toAppError } from '../../http/error-normalizer';
import { AppError } from '../../http/app-error.model';

@Component({
  selector: 'app-error-state',
  standalone: true,
  imports: [CommonModule, MatIconModule, MatButtonModule],
  templateUrl: './error-state.component.html',
  styleUrl: './error-state.component.css'
})
export class ErrorStateComponent implements OnChanges {
  @Input() error: unknown | AppError;
  @Input() title?: string;
  @Input() message?: string;
  @Input() retryLabel = 'Reintentar';

  @Output() retry = new EventEmitter<void>();

  normalizedError?: AppError;

  ngOnChanges(changes: SimpleChanges): void {
    if (changes['error']) {
      this.normalizedError = toAppError(this.error);
    }
  }

  onRetry(): void {
    this.retry.emit();
  }
}
