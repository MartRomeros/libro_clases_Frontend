import { Injectable, inject, signal, computed } from '@angular/core';
import { HttpClient, HttpErrorResponse } from '@angular/common/http';
import { Observable, catchError, tap, throwError, map, of, firstValueFrom } from 'rxjs';
import { environment } from '../../../environments/environment';
import { AuthResponse, LoginRequest, User } from '../models/auth.model';
import { injectQuery, injectQueryClient } from '@tanstack/angular-query-experimental';
import { UserProfile } from '../models/user-profile.model';

@Injectable({
  providedIn: 'root'
})
export class AuthService {
  private http = inject(HttpClient);
  private queryClient = injectQueryClient();
  private apiUrl = `${environment.apiUrl}/auth`;

  // Use signals for basic auth state
  token = signal<string | null>(localStorage.getItem('token'));
  isAuthenticated = computed(() => !!this.token());

  // Query to validate token
  validateTokenQuery = injectQuery(() => ({
    queryKey: ['validateToken', this.token()],
    queryFn: () => firstValueFrom(
      this.http.get<{ valid: boolean }>(`${this.apiUrl}/validate`).pipe(
        map(res => res.valid),
        catchError(() => of(false))
      )
    ),
    enabled: !!this.token(),
    retry: false,
  }));

  // Query to get user profile
  profileQuery = injectQuery(() => ({
    queryKey: ['userProfile', this.token()],
    queryFn: () => firstValueFrom(
      this.http.get<UserProfile>(`${this.apiUrl}/profile`).pipe(
        catchError(err => {
          if (err.status === 401) {
            this.logout();
          }
          return throwError(() => err);
        })
      )
    ),
    enabled: !!this.token(),
    retry: false,
  }));

  login(credentials: LoginRequest): Observable<AuthResponse> {
    return this.http.post<AuthResponse>(`${this.apiUrl}/login`, credentials).pipe(
      tap(response => {
        this.saveAuthData(response.token);
        // Refresh queries after login
        this.queryClient.invalidateQueries({ queryKey: ['validateToken'] });
        this.queryClient.invalidateQueries({ queryKey: ['userProfile'] });
      }),
      catchError(this.handleError)
    );
  }

  logout(): void {
    localStorage.removeItem('token');
    this.token.set(null);
    this.queryClient.clear();
  }

  forgotPassword(email: string): Observable<any> {
    return this.http.post(`${this.apiUrl}/forgot-password`, { email }).pipe(
      catchError(this.handleError)
    );
  }

  private saveAuthData(token: string): void {
    localStorage.setItem('token', token);
    this.token.set(token);
  }

  private handleError(error: HttpErrorResponse) {
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
