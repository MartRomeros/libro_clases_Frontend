# Performance y SSR — Optimización en Angular

## Deferrable Views — Lazy Loading de Componentes (Angular v17+)

```typescript
// La característica de performance más importante de Angular v17
@Component({
  template: `
    <!-- Cargar solo cuando es visible en el viewport -->
    @defer (on viewport) {
      <app-heavy-chart [data]="chartData()" />
    } @placeholder {
      <div class="chart-skeleton" style="height: 300px">Loading chart...</div>
    } @loading (minimum 500ms) {
      <app-spinner />
    } @error {
      <p>Failed to load chart. <button (click)="retry()">Retry</button></p>
    }

    <!-- Cargar en idle del browser -->
    @defer (on idle) {
      <app-recommendation-engine />
    }

    <!-- Cargar cuando el usuario interactúa -->
    @defer (on interaction(triggerEl)) {
      <app-comments-section />
    }
    <button #triggerEl>Load Comments</button>

    <!-- Cargar cuando hover -->
    @defer (on hover) {
      <app-user-tooltip />
    }

    <!-- Cargar inmediatamente pero en el siguiente idle (sin bloquear render) -->
    @defer (on immediate) {
      <app-analytics-widget />
    }

    <!-- Defer condicional -->
    @defer (when isAuthenticated()) {
      <app-dashboard />
    }

    <!-- Prefetch — cargar en background sin renderizar todavía -->
    @defer (on viewport; prefetch on idle) {
      <app-video-player />
    }
  `
})
```

---

## OnPush y TrackBy — Optimizar Re-renders

```typescript
// REGLA: Siempre OnPush en componentes nuevos
@Component({
  changeDetection: ChangeDetectionStrategy.OnPush,
  template: `
    <!-- trackBy SIEMPRE en @for con listas -->
    @for (user of users(); track user.id) {
      <app-user-card [user]="user" />
    }

    <!-- trackBy función para lógica más compleja -->
    @for (item of items(); track trackByFn($index, item)) {
      <app-item [item]="item" />
    }

    <!-- async pipe gestiona suscripciones automáticamente -->
    @if (user$ | async; as user) {
      <p>{{ user.name }}</p>
    }
  `
})
export class UsersComponent {
  // Con signals: OnPush funciona perfectamente — solo re-renderiza cuando el signal cambia
  users = input.required<User[]>();
  items = inject(ItemsService).items;

  trackByFn(index: number, item: Item): string {
    return item.id;
  }
}

// Ejemplo de problema común con OnPush
@Component({
  changeDetection: ChangeDetectionStrategy.OnPush,
  template: `{{ user().name }}`
})
export class UserComponent {
  user = input.required<User>();

  updateName() {
    // ❌ INCORRECTO — mutar el objeto no cambia la referencia del signal
    this.user().name = 'New Name';  // el template NO se actualiza

    // ✅ CORRECTO — emitir un nuevo objeto desde el padre
    // El padre debe hacer: user.set({ ...user(), name: 'New Name' })
  }
}
```

---

## Bundle Optimization — Reducir el Tamaño

```bash
# Analizar el bundle
ng build --configuration production --stats-json
npx webpack-bundle-analyzer dist/app/browser/stats.json

# O con source-map-explorer
ng build --source-map
npx source-map-explorer 'dist/**/*.js'
```

```typescript
// Lazy loading de rutas — el más impactante
{
  path: 'admin',
  loadChildren: () => import('./features/admin/admin.routes').then(m => m.ADMIN_ROUTES)
}

// Lazy loading de componentes pesados en el componente
export class AppComponent {
  showModal = false;
  // El componente se carga solo cuando el usuario lo activa
  // Usar @defer (on interaction) en el template
}

// Import dinámico para librerías pesadas
async loadChart() {
  const { Chart } = await import('chart.js');
  // usar Chart
}

// Evitar imports de barrel que cargan todo el módulo
// ❌ Importa TODA la librería de Material
import { MatButton, MatInput, MatSelect } from '@angular/material/...';

// ✅ Import específico — solo lo que necesitas
import { MatButtonModule } from '@angular/material/button';
import { MatInputModule } from '@angular/material/input';
```

---

## SSR con Angular Universal y Hydration

```bash
# Agregar SSR a un proyecto existente (Angular v17+)
ng add @angular/ssr
```

```typescript
// app.config.ts — configuración SSR + hydration
export const appConfig: ApplicationConfig = {
  providers: [
    provideRouter(routes),
    provideClientHydration(   // activa hydration (Angular v16+)
      withEventReplay()       // captura eventos durante hydration (v18+)
    ),
  ]
};

// server.ts — servidor Express (generado automáticamente)
// Angular v17+ genera server.ts automáticamente con ng add @angular/ssr

// Detectar entorno (SSR vs browser)
@Injectable({ providedIn: 'root' })
export class PlatformService {
  private platformId = inject(PLATFORM_ID);

  isBrowser = isPlatformBrowser(this.platformId);
  isServer  = isPlatformServer(this.platformId);
}

// Evitar acceso a browser APIs en SSR
@Component({ ... })
export class ComponentWithBrowserAPI {
  private platformId = inject(PLATFORM_ID);

  ngOnInit() {
    if (isPlatformBrowser(this.platformId)) {
      // Este código solo corre en el browser, no en el servidor
      const width = window.innerWidth;
      localStorage.setItem('key', 'value');
    }
  }
}

// TransferState — transferir datos del servidor al cliente
import { TransferState, makeStateKey } from '@angular/platform-browser';

const USERS_KEY = makeStateKey<User[]>('users');

@Injectable({ providedIn: 'root' })
export class UserService {
  private transferState = inject(TransferState);
  private http = inject(HttpClient);
  private platformId = inject(PLATFORM_ID);

  getUsers(): Observable<User[]> {
    // En el servidor: hacer la petición y guardar el resultado
    if (isPlatformServer(this.platformId)) {
      return this.http.get<User[]>('/api/users').pipe(
        tap(users => this.transferState.set(USERS_KEY, users))
      );
    }

    // En el cliente: usar los datos del servidor si están disponibles
    const cachedUsers = this.transferState.get(USERS_KEY, null);
    if (cachedUsers) {
      this.transferState.remove(USERS_KEY);
      return of(cachedUsers);  // No re-hace la petición HTTP
    }

    return this.http.get<User[]>('/api/users');
  }
}
```

---

## Incremental Hydration (Angular v19)

```typescript
// Hydration incremental — hidratar partes de la página a demanda
// El servidor renderiza todo, pero el cliente hidrata selectivamente

@Component({
  template: `
    <!-- Esta parte se hidrata solo cuando el usuario interactúa -->
    @defer (hydrate on interaction) {
      <app-comments [postId]="postId()" />
    }

    <!-- Esta se hidrata cuando es visible -->
    @defer (hydrate on viewport) {
      <app-related-posts />
    }

    <!-- Esta nunca se hidrata (solo contenido estático del servidor) -->
    @defer (hydrate never) {
      <app-footer />
    }
  `
})
```

---

## Performance: Web Vitals en Angular

```typescript
// Medir Core Web Vitals
import { getCLS, getFID, getLCP, getFCP, getTTFB } from 'web-vitals';

// En main.ts o en un servicio de analytics:
if (isPlatformBrowser(inject(PLATFORM_ID))) {
  getCLS(metric => reportMetric('CLS', metric));
  getLCP(metric => reportMetric('LCP', metric));
  getFID(metric => reportMetric('FID', metric));
}

// Optimizaciones de imágenes (Angular v14.2+)
import { NgOptimizedImage } from '@angular/common';

@Component({
  imports: [NgOptimizedImage],
  template: `
    <!-- ngSrc en lugar de src — optimiza automáticamente -->
    <img ngSrc="hero.jpg" width="1200" height="600" priority />
    <!-- priority → preload hint, importante para LCP -->

    <img ngSrc="avatar.jpg" width="48" height="48" />
    <!-- Sin priority → lazy load automático -->
  `
})
```
