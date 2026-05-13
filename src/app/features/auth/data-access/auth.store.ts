import { Injectable, signal, computed, inject } from '@angular/core';
import { QueryClient } from '@tanstack/angular-query-experimental';
import { User } from '../models/profile.response.model';

@Injectable({
  providedIn: 'root',
})

export class AuthStore {  
  private readonly queryClient = inject(QueryClient);
  private readonly token = signal<string | null>(localStorage.getItem('token'));
  
  readonly accessToken = this.token.asReadonly();
  readonly isAuthenticated = computed(() => !!this.token());

  setSession(token: string): void {
    localStorage.setItem('token', token);
    this.token.set(token);
  }

  clearSession(): void {
    localStorage.clear();
    this.queryClient.clear();
    this.token.set(null);
  }
}
