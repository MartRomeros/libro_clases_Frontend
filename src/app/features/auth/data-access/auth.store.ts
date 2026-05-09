import { Injectable, signal, computed, inject } from '@angular/core';
import { User } from '../models/profile.response.model';
import { injectQueryClient } from '@tanstack/angular-query-experimental';
import { authKeys } from './auth.keys';

@Injectable({
  providedIn: 'root',
})

export class AuthStore {

  private readonly token = signal<string | null>(localStorage.getItem('token'));
  private readonly user = signal<User | null>(
    localStorage.getItem('user') ? JSON.parse(localStorage.getItem('user')!) : null
  );

  readonly currentUser = this.user.asReadonly();
  readonly accessToken = this.token.asReadonly();
  readonly isAuthenticated = computed(() => !!this.token());

  private readonly queryClient = injectQueryClient();

  setSession(token: string, user: User): void {
    localStorage.setItem('token', token);
    localStorage.setItem('user', JSON.stringify(user));
    this.token.set(token);
    this.user.set(user);
    this.queryClient.invalidateQueries({ queryKey: authKeys.all });
  }

  clearSession(): void {
    localStorage.removeItem('token');
    localStorage.removeItem('user');
    this.token.set(null);
    this.user.set(null);
    this.queryClient.clear();
  }
}