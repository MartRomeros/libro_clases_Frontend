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
  private backGestionUrl = environment.backGestionUrl;
  
  // Use signals for state management
  currentUser = signal<User | null>(this.getUserFromStorage());
  token = signal<string | null>(localStorage.getItem('token'));
  isAuthenticated = signal<boolean>(!!this.token());

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
    return this.http.get<{ valid: boolean }>(`${this.apiUrl}/validate-token`).pipe(
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

  fetchUserDetails(id: number, role: string): Observable<any> {
    // Lógica para determinar el endpoint según el rol
    const cleanRole = role?.toLowerCase().trim();
    let endpoint = `${this.backGestionUrl}/usuarios/${id}`;
    
    if (cleanRole === 'docente') {
      endpoint = `${this.backGestionUrl}/docentes/${id}`;
    } else if (cleanRole === 'estudiante') {
      endpoint = `${this.backGestionUrl}/estudiantes/${id}`;
    }
    
    console.log(`Consumiendo BackGestion (${role}): ${endpoint}`);

    return this.http.get<any>(endpoint).pipe(
      tap(data => {
        let user = this.currentUser();
        
        if (!user) {
          user = { id: id.toString(), email: '', name: '', role: role };
        }

        if (data) {
          const userData = data.usuario || data;
          const fullName = `${userData.nombre || ''} ${userData.apellidoPaterno || ''} ${userData.apellidoMaterno || ''}`.trim();
          
          const updatedUser = {
            ...user,
            id: data.estudianteId?.toString() || data.docenteId?.toString() || data.id?.toString() || user.id,
            name: fullName || user.name,
            email: userData.email || user.email
          };
          
          this.currentUser.set(updatedUser);
          localStorage.setItem('user', JSON.stringify(updatedUser));
          console.log('DATOS CARGADOS DESDE BACKGESTION:', updatedUser);
        }
      }),
      catchError(err => {
        console.error('Error al obtener detalles desde BackGestion:', err);
        return of(null);
      })
    );
  }

  private saveAuthData(token: string, user?: User): void {
    localStorage.setItem('token', token);
    
    // Si el backend no envió usuario, creamos uno temporal que se llenará con fetchUserDetails
    const userData = user || { id: '', email: '', name: '', role: '' };
    
    localStorage.setItem('user', JSON.stringify(userData));
    this.token.set(token);
    this.currentUser.set(userData);
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
