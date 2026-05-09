import { CommonModule } from '@angular/common';
import { Component, OnDestroy, OnInit, computed, inject, signal } from '@angular/core';
import { ActivatedRoute, Router } from '@angular/router';
import { MatButtonModule } from '@angular/material/button';
import { MatCardModule } from '@angular/material/card';
import { MatIconModule } from '@angular/material/icon';
import { NavigationHistoryService } from '../../../core/services/navigation-history.service';

@Component({
  selector: 'app-no-access-page',
  standalone: true,
  imports: [CommonModule, MatButtonModule, MatCardModule, MatIconModule],
  templateUrl: './no-access.page.component.html',
  styleUrl: './no-access.page.component.css',
})
export class NoAccessPageComponent implements OnInit, OnDestroy {
  private readonly router = inject(Router);
  private readonly route = inject(ActivatedRoute);
  private readonly navigationHistory = inject(NavigationHistoryService);

  readonly countdown = signal(5);
  readonly returnUrl = signal('/auth/login');
  readonly fallbackUrl = computed(() => this.navigationHistory.getLastSuccessfulUrl() ?? '/auth/login');

  private timerId: number | null = null;

  ngOnInit(): void {
    const requestedReturnUrl = this.route.snapshot.queryParamMap.get('returnUrl');
    this.returnUrl.set(this.sanitizeReturnUrl(requestedReturnUrl) ?? this.navigationHistory.getLastSuccessfulUrl() ?? this.fallbackUrl());
    this.startCountdown();
  }

  ngOnDestroy(): void {
    if (this.timerId !== null) {
      window.clearInterval(this.timerId);
    }
  }

  volver(): void {
    this.navigateBack();
  }

  private startCountdown(): void {
    this.timerId = window.setInterval(() => {
      const current = this.countdown();

      if (current <= 1) {
        this.navigateBack();
        return;
      }

      this.countdown.set(current - 1);
    }, 1000);
  }

  private navigateBack(): void {
    if (this.timerId !== null) {
      window.clearInterval(this.timerId);
      this.timerId = null;
    }

    this.router.navigateByUrl(this.returnUrl() || this.fallbackUrl());
  }

  private sanitizeReturnUrl(value: string | null): string | null {
    if (!value) return null;
    if (!value.startsWith('/')) return null;
    if (value.startsWith('/no-access')) return null;
    return value;
  }
}
