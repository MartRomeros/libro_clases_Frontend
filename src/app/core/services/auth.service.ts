import { Injectable, inject, signal, computed } from '@angular/core';
import { HttpClient, HttpErrorResponse } from '@angular/common/http';
import { Router } from '@angular/router';
import { catchError, tap, throwError, map, of, firstValueFrom } from 'rxjs';
import { environment } from '../../../environments/environment';
import { AuthResponse, LoginRequest, User } from '../models/auth.model';
import { injectQueryClient } from '@tanstack/angular-query-experimental';
import { UserProfile } from '../models/user-profile.model';

@Injectable({
  providedIn: 'root',
})
export class AuthService {
  private http = inject(HttpClient);
  private router = inject(Router);
  private queryClient = injectQueryClient();
  private apiUrl = `${environment.apiUrl}/auth`;

  token = signal<string | null>(localStorage.getItem('token'));
  currentUser = signal<User | null>(this.getUserFromStorage());
  isAuthenticated = computed(() => !!this.token());

  validateTokenOptions() {
    return {
      queryKey: ['validateToken', this.token()] as const,
      queryFn: () =>
        firstValueFrom(
          this.http.get<{ valid: boolean }>(`${this.apiUrl}/validate`).pipe(
            map((res) => res.valid),
            catchError(() => of(false)),
          ),
        ),
      enabled: !!this.token(),
      retry: false,
    };
  }

  profileOptions() {
    return {
      queryKey: ['userProfile', this.token()] as const,
      queryFn: () =>
        firstValueFrom(
          this.http.get<UserProfile>(`${this.apiUrl}/profile`).pipe(
            catchError((err: HttpErrorResponse) => {
              if (err.status === 401) {
                this.handleUnauthorized();
              }
              return throwError(() => err);
            }),
          ),
        ),
      enabled: !!this.token(),
      retry: false,
    };
  }

  loginOptions() {
    return {
      mutationKey: ['login'] as const,
      mutationFn: (credentials: LoginRequest) =>
        firstValueFrom(
          this.http.post<AuthResponse>(`${this.apiUrl}/login`, credentials).pipe(
            tap((response) => {
              this.saveAuthData(response.token, response.user);
              this.queryClient.invalidateQueries({ queryKey: ['validateToken'] });
              this.queryClient.invalidateQueries({ queryKey: ['userProfile'] });
            }),
            catchError(AuthService.handleError),
          ),
        ),
    };
  }

  logout(): void {
    localStorage.removeItem('token');
    localStorage.removeItem('user');
    this.token.set(null);
    this.currentUser.set(null);
    this.queryClient.clear();
    this.router.navigate(['/login']);
  }

  handleUnauthorized(): void {
    this.logout();
  }

  saveAuthData(token: string, user?: User): void {
    localStorage.setItem('token', token);
    this.token.set(token);
    if (user) {
      localStorage.setItem('user', JSON.stringify(user));
      this.currentUser.set(user);
    }
  }

  private getUserFromStorage(): User | null {
    const user = localStorage.getItem('user');
    if (!user || user === 'undefined' || user === 'null') return null;
    try {
      return JSON.parse(user);
    } catch {
      localStorage.removeItem('user');
      return null;
    }
  }

  static handleError(error: HttpErrorResponse) {
    let errorMessage = 'Ocurrió un error inesperado';

    if (error.error instanceof ErrorEvent) {
      errorMessage = `Error: ${error.error.message}`;
    } else {
      if (error.status === 401) {
        errorMessage = 'Credenciales inválidas. Por favor, intente de nuevo.';
      } else if (error.status === 403) {
        errorMessage = 'No tiene permisos para acceder a este recurso.';
      } else if (error.status === 404) {
        errorMessage = 'El recurso solicitado no fue encontrado.';
      } else if (error.error?.message) {
        errorMessage = error.error.message;
      }
    }

    return throwError(() => errorMessage);
  }
}
