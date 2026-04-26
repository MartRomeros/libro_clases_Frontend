# Routing y Navegación — Angular Router Moderno

## Configuración de Rutas — Standalone API

```typescript
// app.routes.ts — configuración principal
import { Routes } from '@angular/router';
import { authGuard } from './core/guards/auth.guard';
import { userResolver } from './core/resolvers/user.resolver';

export const routes: Routes = [
  // Ruta simple
  { path: '', redirectTo: 'dashboard', pathMatch: 'full' },

  // Ruta con lazy loading (SIEMPRE preferir esto)
  {
    path: 'dashboard',
    loadComponent: () => import('./features/dashboard/dashboard.component')
      .then(m => m.DashboardComponent),
    canActivate: [authGuard],
  },

  // Ruta con lazy loading de rutas hijas (feature module style con standalone)
  {
    path: 'users',
    canActivate: [authGuard],
    loadChildren: () => import('./features/users/users.routes')
      .then(m => m.USERS_ROUTES),
  },

  // Ruta con parámetros y resolver
  {
    path: 'users/:id',
    loadComponent: () => import('./features/users/user-detail/user-detail.component')
      .then(m => m.UserDetailComponent),
    canActivate: [authGuard],
    resolve: { user: userResolver },
    data: { title: 'User Detail', breadcrumb: 'User' }
  },

  // Ruta con múltiples guards
  {
    path: 'admin',
    loadChildren: () => import('./features/admin/admin.routes').then(m => m.ADMIN_ROUTES),
    canActivate: [authGuard, adminGuard],
    canMatch: [() => inject(FeatureService).isEnabled('admin')],
  },

  // Wildcard — SIEMPRE al final
  { path: '**', loadComponent: () => import('./shared/not-found/not-found.component')
    .then(m => m.NotFoundComponent) },
];

// app.config.ts — bootstrap standalone
export const appConfig: ApplicationConfig = {
  providers: [
    provideRouter(routes,
      withPreloading(PreloadAllModules),    // o withPreloading(QuicklinkStrategy) con quicklink
      withComponentInputBinding(),           // inputs del componente se mapean a route params
      withViewTransitions(),                 // View Transitions API (v17+)
      withRouterConfig({ paramsInheritanceStrategy: 'always' })
    ),
  ]
};
```

---

## Guards — Funcionales (Angular v15.2+)

```typescript
// auth.guard.ts — guard funcional (la forma moderna)
import { inject } from '@angular/core';
import { CanActivateFn, Router } from '@angular/router';
import { AuthService } from '../services/auth.service';
import { map } from 'rxjs/operators';

export const authGuard: CanActivateFn = (route, state) => {
  const authService = inject(AuthService);
  const router = inject(Router);

  // Puede retornar: boolean | UrlTree | Observable<boolean|UrlTree> | Promise<boolean|UrlTree>
  return authService.isAuthenticated$.pipe(
    map(isAuth => {
      if (isAuth) return true;
      return router.createUrlTree(['/login'], {
        queryParams: { returnUrl: state.url }
      });
    })
  );
};

// Guard con signals
export const featureGuard: CanActivateFn = (route) => {
  const featureService = inject(FeatureService);
  const router = inject(Router);

  // Acceder a signals en guards (dentro del injection context)
  if (featureService.isEnabled(route.data['feature'])) {
    return true;
  }
  return router.createUrlTree(['/403']);
};

// canMatch — para decidir si una ruta aplica al match (útil para A/B testing)
export const abTestGuard: CanMatchFn = (route) => {
  const abService = inject(AbTestService);
  return abService.isInGroup('variant-b');
};

// canDeactivate — prevenir salida sin guardar
export const unsavedChangesGuard: CanDeactivateFn<HasUnsavedChanges> = (component) => {
  if (component.hasUnsavedChanges()) {
    return confirm('You have unsaved changes. Leave anyway?');
  }
  return true;
};

export interface HasUnsavedChanges {
  hasUnsavedChanges(): boolean;
}
```

---

## Resolvers — Cargar Datos Antes de Navegar

```typescript
// user.resolver.ts — resolver funcional
import { inject } from '@angular/core';
import { ResolveFn, Router } from '@angular/router';
import { UserService } from '../services/user.service';
import { User } from '../models/user.model';
import { catchError, EMPTY } from 'rxjs';

export const userResolver: ResolveFn<User> = (route) => {
  const userService = inject(UserService);
  const router = inject(Router);
  const userId = route.paramMap.get('id')!;

  return userService.getUser(userId).pipe(
    catchError(() => {
      // Si falla, redirigir en lugar de mostrar página rota
      router.navigate(['/not-found']);
      return EMPTY;
    })
  );
};

// Usar el dato en el componente
@Component({ ... })
export class UserDetailComponent {
  private route = inject(ActivatedRoute);

  // Opción 1: con routerLink inputBinding habilitado (withComponentInputBinding)
  // El resolver 'user' se convierte en un input del componente
  user = input.required<User>();

  // Opción 2: leer desde snapshot o observable
  user$ = this.route.data.pipe(map(data => data['user'] as User));
}
```

---

## Leer Parámetros de Ruta — Formas Modernas

```typescript
@Component({ ... })
export class UserDetailComponent {
  private route = inject(ActivatedRoute);
  private router = inject(Router);

  // Con withComponentInputBinding() — el parámetro se pasa como input (RECOMENDADO)
  id = input.required<string>();      // :id en la ruta
  tab = input<string>('overview');    // ?tab=... en queryParams
  user = input.required<User>();      // dato del resolver 'user'

  // Sin withComponentInputBinding — usar ActivatedRoute
  userId$ = this.route.paramMap.pipe(map(params => params.get('id')!));
  userId  = this.route.snapshot.paramMap.get('id');  // solo valor actual

  // Navigation programática
  goToUser(id: string) {
    this.router.navigate(['/users', id]);
    this.router.navigate(['../'], { relativeTo: this.route });
    this.router.navigateByUrl('/users');

    // Con query params
    this.router.navigate(['/users'], {
      queryParams: { tab: 'orders', page: 2 },
      queryParamsHandling: 'merge',  // merge con los actuales
    });
  }
}
```

---

## Router Outlet Avanzado

```typescript
// Outlets con nombre — para sidebars, modales, etc.
const routes: Routes = [
  {
    path: 'dashboard',
    component: DashboardComponent,
    children: [
      // Outlet secundario: 'sidebar'
      { path: 'details/:id', component: DetailComponent, outlet: 'sidebar' },
    ]
  }
];

// Template con múltiples outlets
@Component({
  template: `
    <main>
      <router-outlet />  <!-- outlet primario -->
    </main>
    <aside>
      <router-outlet name="sidebar" />  <!-- outlet secundario -->
    </aside>
  `
})
export class DashboardLayoutComponent {}

// Navegar a outlet secundario
this.router.navigate([
  { outlets: { sidebar: ['details', '123'] } }
]);

// Título de página reactivo
const routes: Routes = [{
  path: 'users/:id',
  title: 'User Detail',  // estático
  // o dinámico con resolver:
  title: (route) => inject(UserService).getUser(route.paramMap.get('id')!).pipe(
    map(user => `${user.name} - My App`)
  ),
}];
```

---

## Preloading Strategy — Optimizar el Lazy Loading

```typescript
// app.config.ts — estrategias de precarga
provideRouter(routes,
  // PreloadAllModules — precarga todo en background después del bootstrap
  withPreloading(PreloadAllModules),

  // NoPreloading — default, sin precarga (routes se cargan on-demand)
  withPreloading(NoPreloading),

  // Custom strategy — precarga según datos de la ruta
);

// Custom preloading strategy
@Injectable({ providedIn: 'root' })
export class SelectivePreloadingStrategy implements PreloadingStrategy {
  preload(route: Route, load: () => Observable<any>): Observable<any> {
    return route.data?.['preload'] ? load() : of(null);
  }
}

// En la ruta: data: { preload: true }
```
