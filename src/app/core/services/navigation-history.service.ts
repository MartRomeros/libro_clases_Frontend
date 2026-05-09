import { Injectable, inject } from '@angular/core';
import { NavigationEnd, Router } from '@angular/router';
import { filter } from 'rxjs';

const LAST_SUCCESSFUL_URL_KEY = 'last_successful_url';

@Injectable({ providedIn: 'root' })
export class NavigationHistoryService {
  private readonly router = inject(Router);

  constructor() {
    const storedUrl = sessionStorage.getItem(LAST_SUCCESSFUL_URL_KEY);
    if (storedUrl) {
      this.lastSuccessfulUrl = storedUrl;
    }

    this.router.events
      .pipe(filter((event): event is NavigationEnd => event instanceof NavigationEnd))
      .subscribe((event) => {
        if (this.isTrackableUrl(event.urlAfterRedirects)) {
          this.lastSuccessfulUrl = event.urlAfterRedirects;
          sessionStorage.setItem(LAST_SUCCESSFUL_URL_KEY, event.urlAfterRedirects);
        }
      });
  }

  private lastSuccessfulUrl: string | null = null;

  getLastSuccessfulUrl(): string | null {
    return this.lastSuccessfulUrl;
  }

  clear(): void {
    this.lastSuccessfulUrl = null;
    sessionStorage.removeItem(LAST_SUCCESSFUL_URL_KEY);
  }

  private isTrackableUrl(url: string): boolean {
    return !url.startsWith('/no-access') && !url.startsWith('/auth');
  }
}
