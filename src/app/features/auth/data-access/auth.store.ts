import { Injectable, signal, computed } from '@angular/core';
import { User } from '../models/profile.response.model';

@Injectable({
  providedIn: 'root',
})

export class AuthStore {

  private readonly token = signal<string | null>(localStorage.getItem('token'));
  private readonly user = signal<User | null>(null);

  readonly currentUser = this.user.asReadonly();
  readonly accessToken = this.token.asReadonly();
  readonly isAuthenticated = computed(() => !!this.token());

  setSession(token: string, user: User): void {
    localStorage.setItem('token', token);
    localStorage.setItem('user', JSON.stringify(user))
    this.token.set(token);
    this.user.set(user);
  }

  clearSession(): void {
    localStorage.clear;
    this.token.set(null);
    this.user.set(null);
  }
}