# Servicios, DI y HttpClient — El Backbone de Angular

## Inyección de Dependencias Moderna

```typescript
// Formas de proveer servicios — cuándo usar cada una

// 1. providedIn: 'root' — singleton global (la más común)
@Injectable({ providedIn: 'root' })
export class AuthService {
  private currentUser = signal<User | null>(null);
  isAuthenticated = computed(() => this.currentUser() !== null);
}

// 2. providedIn: 'platform' — compartido entre múltiples apps Angular en la misma página
@Injectable({ providedIn: 'platform' })
export class GlobalConfigService {}

// 3. Provisión en componente — instancia nueva por cada componente
@Component({
  providers: [UserService],  // nueva instancia para este árbol de componentes
})
export class UserComponent {
  private userService = inject(UserService);  // instancia LOCAL, no el singleton
}

// 4. Provisión en ruta — instancia nueva por cada navegación a esa ruta
const routes: Routes = [{
  path: 'users',
  providers: [UserService],  // instancia nueva por cada visita a esta ruta
  loadComponent: () => import('./user-list.component').then(m => m.UserListComponent),
}];

// inject() — la forma moderna (fuera de constructor)
@Component({ ... })
export class MyComponent {
  private authService = inject(AuthService);
  private router = inject(Router);
  private http = inject(HttpClient);

  // inject() también funciona en funciones fuera de clases (guards, resolvers, etc.)
}

// Injection Tokens — para proveer valores primitivos o configuración
import { InjectionToken, inject } from '@angular/core';

export const APP_CONFIG = new InjectionToken<AppConfig>('app.config');
export const API_URL = new InjectionToken<string>('api.url');

// En providers:
{ provide: API_URL, useValue: 'https://api.example.com' }
{ provide: APP_CONFIG, useFactory: () => ({ debug: true, version: '1.0' }) }

// Consumir:
const apiUrl = inject(API_URL);
const config = inject(APP_CONFIG);
```

---

## HttpClient — Configuración y Uso

```typescript
// app.config.ts — configurar HttpClient (Angular v15+)
export const appConfig: ApplicationConfig = {
  providers: [
    provideHttpClient(
      withInterceptors([authInterceptor, errorInterceptor, loggingInterceptor]),
      withFetch(),                    // usar fetch() en lugar de XMLHttpRequest (mejor performance y SSR)
      withXsrfConfiguration({ ... }) // configurar CSRF protection
    ),
  ]
};

// Servicio HTTP — buenas prácticas
@Injectable({ providedIn: 'root' })
export class UserService {
  private http = inject(HttpClient);
  private apiUrl = inject(API_URL);

  // Tipado fuerte siempre
  getUsers(params: UserFilters): Observable<PaginatedResponse<User>> {
    return this.http.get<PaginatedResponse<User>>(`${this.apiUrl}/users`, {
      params: new HttpParams()
        .set('page', params.page.toString())
        .set('size', params.size.toString())
        .set('status', params.status ?? ''),
    });
  }

  getUser(id: string): Observable<User> {
    return this.http.get<User>(`${this.apiUrl}/users/${id}`);
  }

  createUser(data: CreateUserDto): Observable<User> {
    return this.http.post<User>(`${this.apiUrl}/users`, data);
  }

  updateUser(id: string, data: Partial<User>): Observable<User> {
    return this.http.patch<User>(`${this.apiUrl}/users/${id}`, data);
  }

  deleteUser(id: string): Observable<void> {
    return this.http.delete<void>(`${this.apiUrl}/users/${id}`);
  }

  // Upload de archivo con progreso
  uploadAvatar(userId: string, file: File): Observable<HttpEvent<User>> {
    const formData = new FormData();
    formData.append('avatar', file);

    return this.http.post<User>(`${this.apiUrl}/users/${userId}/avatar`, formData, {
      reportProgress: true,
      observe: 'events',  // recibir todos los eventos del upload
    });
  }

  // Para observar el progreso del upload:
  // switch (event.type) {
  //   case HttpEventType.UploadProgress:
  //     const progress = Math.round(100 * event.loaded / (event.total ?? 1));
  //   case HttpEventType.Response:
  //     const user = event.body;
  // }
}
```

---

## Interceptors Funcionales (Angular v15+)

```typescript
// auth.interceptor.ts — interceptor funcional (RECOMENDADO)
import { HttpInterceptorFn, HttpRequest, HttpHandlerFn } from '@angular/common/http';
import { inject } from '@angular/core';

export const authInterceptor: HttpInterceptorFn = (req, next) => {
  const authService = inject(AuthService);
  const token = authService.getToken();

  if (!token) return next(req);

  const authReq = req.clone({
    headers: req.headers.set('Authorization', `Bearer ${token}`),
  });

  return next(authReq);
};

// error.interceptor.ts — manejo global de errores HTTP
import { HttpErrorResponse } from '@angular/common/http';
import { catchError, throwError } from 'rxjs';

export const errorInterceptor: HttpInterceptorFn = (req, next) => {
  const router = inject(Router);
  const notificationService = inject(NotificationService);

  return next(req).pipe(
    catchError((error: HttpErrorResponse) => {
      switch (error.status) {
        case 401:
          // Token expirado — redirigir al login
          router.navigate(['/login']);
          break;
        case 403:
          notificationService.error('You do not have permission for this action');
          break;
        case 404:
          notificationService.error('Resource not found');
          break;
        case 500:
          notificationService.error('Server error. Please try again later.');
          break;
        default:
          notificationService.error(error.message || 'An error occurred');
      }
      return throwError(() => error);
    })
  );
};

// loading.interceptor.ts — mostrar/ocultar loading global
import { finalize } from 'rxjs';

export const loadingInterceptor: HttpInterceptorFn = (req, next) => {
  const loadingService = inject(LoadingService);

  // Ignorar ciertas requests
  if (req.headers.has('X-Skip-Loading')) {
    return next(req.clone({ headers: req.headers.delete('X-Skip-Loading') }));
  }

  loadingService.show();
  return next(req).pipe(
    finalize(() => loadingService.hide())
  );
};

// retry.interceptor.ts — reintentar en errores de red
import { retry } from 'rxjs';

export const retryInterceptor: HttpInterceptorFn = (req, next) => {
  // Solo reintentar GETs (las mutaciones no deben reintentarse automáticamente)
  if (req.method !== 'GET') return next(req);

  return next(req).pipe(
    retry({
      count: 2,
      delay: (error, count) => {
        if (error.status >= 500) return timer(1000 * count);
        return throwError(() => error);  // No reintentar errores 4xx
      }
    })
  );
};
```

---

## Patrones de Servicio con Signals

```typescript
// state.service.ts — servicio con estado usando signals
@Injectable({ providedIn: 'root' })
export class UserStateService {
  private http = inject(HttpClient);

  // Estado privado — solo escribible dentro del servicio
  private _users = signal<User[]>([]);
  private _selectedUser = signal<User | null>(null);
  private _loading = signal(false);
  private _error = signal<string | null>(null);

  // Estado público — solo lectura
  readonly users = this._users.asReadonly();
  readonly selectedUser = this._selectedUser.asReadonly();
  readonly loading = this._loading.asReadonly();
  readonly error = this._error.asReadonly();

  // Computed derivados
  readonly activeUsers = computed(() => this._users().filter(u => u.active));
  readonly selectedUserName = computed(() => this._selectedUser()?.name ?? 'None');
  readonly hasError = computed(() => this._error() !== null);

  loadUsers(filters?: UserFilters) {
    this._loading.set(true);
    this._error.set(null);

    this.http.get<User[]>('/api/users', { params: filters as any }).pipe(
      tap(users => this._users.set(users)),
      catchError(err => {
        this._error.set(err.message);
        return of([]);
      }),
      finalize(() => this._loading.set(false))
    ).subscribe();
  }

  selectUser(user: User) {
    this._selectedUser.set(user);
  }

  addUser(user: User) {
    this._users.update(users => [...users, user]);
  }

  updateUser(updated: User) {
    this._users.update(users =>
      users.map(u => u.id === updated.id ? updated : u)
    );
  }

  removeUser(id: string) {
    this._users.update(users => users.filter(u => u.id !== id));
    if (this._selectedUser()?.id === id) {
      this._selectedUser.set(null);
    }
  }
}
```
