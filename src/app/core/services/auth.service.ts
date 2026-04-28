import { Injectable, inject, signal } from '@angular/core';
import { HttpClient, HttpErrorResponse } from '@angular/common/http';
import { Observable, catchError, tap, throwError, map, of } from 'rxjs';
import { environment } from '../../../environments/environment';
import { AuthResponse, LoginRequest, User } from '../models/auth.model';

@Injectable({
  providedIn: 'root'
})
export class AuthService {
  private http = inject(HttpClient);
  private apiUrl = `${environment.apiUrl}/auth`;

  // Use signals for state management
  currentUser = signal<User | null>(this.getUserFromStorage());
  token = signal<string | null>(localStorage.getItem('token'));
  isAuthenticated = signal<boolean>(!!this.token());

  constructor() {
    // ⚠️ SOLO DESARROLLO: inyecta un usuario mock y salta el login
    if (!environment.production && environment.bypassLogin && !this.currentUser()) {
      const mock = environment.mockUser;
      const mockUser: User = {
        id: mock.id,
        email: mock.email,
        name: `${mock.nombre} ${mock.apellido_paterno}`,
        role: mock.role,
      };
      this.saveAuthData('mock-dev-token', mockUser);
    }
  }


  login(credentials: LoginRequest): Observable<AuthResponse> {
    return this.http.post<AuthResponse>(`${this.apiUrl}/login`, credentials).pipe(
      tap(response => {
        this.saveAuthData(response.token, response.user);
      }),
      catchError(this.handleError)
    );
  }

  logout(): void {
    localStorage.removeItem('token');
    localStorage.removeItem('user');
    this.token.set(null);
    this.currentUser.set(null);
    this.isAuthenticated.set(false);
  }

  validateToken(): Observable<boolean> {
    const token = this.token();
    if (!token) return of(false);

    // In a real app, this would call an endpoint to verify the token
    return this.http.get<{ valid: boolean }>(`${this.apiUrl}/validate`).pipe(
      map(res => res.valid),
      tap(isValid => {
        if (!isValid) this.logout();
      }),
      catchError(() => {
        this.logout();
        return of(false);
      })
    );
  }

  forgotPassword(email: string): Observable<any> {
    return this.http.post(`${this.apiUrl}/forgot-password`, { email }).pipe(
      catchError(this.handleError)
    );
  }

  private saveAuthData(token: string, user: User): void {
    localStorage.setItem('token', token);
    localStorage.setItem('user', JSON.stringify(user));
    this.token.set(token);
    this.currentUser.set(user);
    this.isAuthenticated.set(true);
  }

  private getUserFromStorage(): User | null {
    const user = localStorage.getItem('user');
    if (!user || user === 'undefined' || user === 'null') return null;
    try {
      return JSON.parse(user);
    } catch (e) {
      console.error('Error parsing user from storage', e);
      localStorage.removeItem('user');
      return null;
    }
  }

  private handleError(error: HttpErrorResponse) {
    let errorMessage = 'Ocurrió un error inesperado';

    if (error.error instanceof ErrorEvent) {
      // Client-side error
      errorMessage = `Error: ${error.error.message}`;
    } else {
      // Server-side error
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
