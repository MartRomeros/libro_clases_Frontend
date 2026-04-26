# Arquitectura Angular — Patrones Escalables y Nx

## Arquitectura de Features — Smart/Dumb Components

```typescript
// SMART COMPONENT (Container) — gestiona estado y lógica
// Solo en el nivel de feature, no reutilizable
@Component({
  selector: 'app-users-page',
  standalone: true,
  imports: [UserListComponent, UserFilterComponent, AsyncPipe],
  template: `
    <app-user-filter (filtersChange)="onFiltersChange($event)" />
    <app-user-list
      [users]="filteredUsers()"
      [loading]="loading()"
      [error]="error()"
      (select)="onUserSelect($event)"
      (delete)="onUserDelete($event)"
    />
  `
})
export class UsersPageComponent {
  // El smart component inyecta servicios y gestiona el estado
  private userStore = inject(UserStateService);

  filters = signal<UserFilters>({});
  filteredUsers = computed(() =>
    this.userStore.users().filter(u => this.matchesFilters(u, this.filters()))
  );
  loading = this.userStore.loading;
  error = this.userStore.error;

  constructor() {
    this.userStore.loadUsers();
  }

  onFiltersChange(filters: UserFilters) { this.filters.set(filters); }
  onUserSelect(user: User) { inject(Router).navigate(['/users', user.id]); }
  onUserDelete(id: string) { this.userStore.removeUser(id); }

  private matchesFilters(user: User, filters: UserFilters): boolean { ... }
}

// DUMB COMPONENT (Presentational) — solo inputs/outputs, sin servicios
// Reutilizable, testeable de forma aislada
@Component({
  selector: 'app-user-list',
  standalone: true,
  changeDetection: ChangeDetectionStrategy.OnPush,
  template: `
    @if (loading()) { <app-spinner /> }
    @else if (error()) { <app-error [message]="error()!" /> }
    @else {
      @for (user of users(); track user.id) {
        <app-user-card
          [user]="user"
          (select)="select.emit(user)"
          (delete)="delete.emit(user.id)"
        />
      } @empty { <p>No users found</p> }
    }
  `
})
export class UserListComponent {
  users = input.required<User[]>();
  loading = input(false);
  error = input<string | null>(null);
  select = output<User>();
  delete = output<string>();
}
```

---

## NgRx Signal Store (Angular v17.2+)

```typescript
// user.store.ts — gestión de estado con Signal Store
import { signalStore, withState, withComputed, withMethods, patchState } from '@ngrx/signals';
import { withEntities, setAll, addEntity, updateEntity, removeEntity } from '@ngrx/signals/entities';

type UserState = {
  loading: boolean;
  error: string | null;
  selectedUserId: string | null;
};

export const UserStore = signalStore(
  { providedIn: 'root' },

  // Estado inicial
  withState<UserState>({
    loading: false,
    error: null,
    selectedUserId: null,
  }),

  // Entities (colección normalizada)
  withEntities<User>(),

  // Computed
  withComputed(({ entities, selectedUserId }) => ({
    selectedUser: computed(() =>
      entities().find(u => u.id === selectedUserId()) ?? null
    ),
    activeUsers: computed(() => entities().filter(u => u.active)),
    totalCount: computed(() => entities().length),
  })),

  // Métodos (mutaciones + efectos)
  withMethods((store, userService = inject(UserService)) => ({
    async loadUsers(): Promise<void> {
      patchState(store, { loading: true, error: null });
      try {
        const users = await firstValueFrom(userService.getUsers());
        patchState(store, setAll(users));
      } catch (error) {
        patchState(store, { error: 'Failed to load users' });
      } finally {
        patchState(store, { loading: false });
      }
    },

    selectUser(userId: string): void {
      patchState(store, { selectedUserId: userId });
    },

    async createUser(data: CreateUserDto): Promise<void> {
      const user = await firstValueFrom(userService.createUser(data));
      patchState(store, addEntity(user));
    },

    async updateUser(id: string, changes: Partial<User>): Promise<void> {
      const updated = await firstValueFrom(userService.updateUser(id, changes));
      patchState(store, updateEntity({ id, changes: updated }));
    },

    removeUser(id: string): void {
      patchState(store, removeEntity(id));
    },
  }))
);

// Uso en componente
@Component({ ... })
export class UsersComponent {
  protected store = inject(UserStore);

  constructor() {
    this.store.loadUsers();
  }
}

// Template:
// @for (user of store.entities(); track user.id) { ... }
// @if (store.loading()) { <spinner /> }
// {{ store.totalCount() }} users
```

---

## Arquitectura con Nx Monorepo

```bash
# Crear workspace Nx con Angular
npx create-nx-workspace@latest my-company --preset=angular-monorepo

# Estructura resultante:
# apps/
#   my-app/          ← aplicación principal
#   my-app-e2e/      ← tests E2E
# libs/
#   (vacío — aquí crearás las librerías)

# Crear librerías con Nx
nx g @nx/angular:library shared/ui           # librería de componentes UI
nx g @nx/angular:library shared/utils        # utilidades puras
nx g @nx/angular:library feature/users       # feature library
nx g @nx/angular:library data-access/users   # HTTP services + state

# Ejecutar comandos
nx serve my-app
nx build my-app --configuration=production
nx test my-app
nx affected:build   # solo construir lo que cambió
nx affected:test    # solo testear lo que cambió
nx graph            # visualizar dependencias
```

### Estructura de Librerías Nx — Separación de Responsabilidades

```
libs/
├── shared/
│   ├── ui/                   ← Componentes UI puros (sin lógica de negocio)
│   │   ├── button/
│   │   ├── modal/
│   │   └── table/
│   ├── utils/                ← Funciones utilitarias puras
│   │   ├── date.utils.ts
│   │   └── string.utils.ts
│   └── models/               ← Interfaces y tipos compartidos
│       ├── user.model.ts
│       └── api-response.model.ts
│
├── feature/
│   ├── users/                ← Feature completa (smart components + routing)
│   │   ├── src/lib/
│   │   │   ├── user-list/
│   │   │   ├── user-detail/
│   │   │   └── users.routes.ts
│   ├── orders/
│   └── settings/
│
└── data-access/
    ├── users/                ← HTTP services + NgRx/Signal Store para users
    │   ├── user.service.ts
    │   └── user.store.ts
    └── auth/
        ├── auth.service.ts
        └── auth.store.ts
```

```typescript
// tags en project.json — enforcer de dependencias entre librerías
// libs/shared/ui/project.json
{
  "tags": ["scope:shared", "type:ui"]
}

// libs/feature/users/project.json
{
  "tags": ["scope:users", "type:feature"]
}

// .eslintrc.json — reglas de dependencias
{
  "@nx/enforce-module-boundaries": ["error", {
    "depConstraints": [
      // Las features solo pueden depender de data-access y shared
      { "sourceTag": "type:feature", "onlyDependOnLibsWithTags": ["type:data-access", "type:ui", "type:utils"] },
      // shared/ui solo puede depender de shared/utils y shared/models
      { "sourceTag": "type:ui", "onlyDependOnLibsWithTags": ["type:utils", "type:models"] },
    ]
  }]
}
```

---

## Patrones de Comunicación entre Componentes

```typescript
// 1. Input/Output — para parent-child directa (preferida para componentes simples)
// 2. Signal Store — para estado compartido entre features
// 3. Service con signals — para estado compartido en el mismo módulo
// 4. EventBus (Subject) — para comunicación entre features sin dependencia directa

// EventBus pattern — para eventos globales desacoplados
@Injectable({ providedIn: 'root' })
export class EventBusService {
  private events = new Subject<AppEvent>();
  events$ = this.events.asObservable();

  emit(event: AppEvent) {
    this.events.next(event);
  }

  on<T extends AppEvent>(eventType: T['type']): Observable<T> {
    return this.events$.pipe(
      filter((event): event is T => event.type === eventType)
    );
  }
}

// Definición de eventos tipados
type AppEvent =
  | { type: 'USER_LOGGED_IN'; payload: User }
  | { type: 'CART_UPDATED'; payload: { count: number } }
  | { type: 'NOTIFICATION'; payload: { message: string; level: 'info' | 'error' } };

// Uso:
eventBus.emit({ type: 'USER_LOGGED_IN', payload: user });
eventBus.on('USER_LOGGED_IN').pipe(takeUntilDestroyed()).subscribe(({ payload }) => { ... });
```

---

## Feature Flags en Angular

```typescript
// feature-flags.service.ts
@Injectable({ providedIn: 'root' })
export class FeatureFlagsService {
  private flags = signal<Record<string, boolean>>({});

  isEnabled(feature: string): boolean {
    return this.flags()[feature] ?? false;
  }

  // Signal para usar en templates reactivamente
  flag(name: string): Signal<boolean> {
    return computed(() => this.flags()[name] ?? false);
  }

  setFlags(flags: Record<string, boolean>) {
    this.flags.set(flags);
  }
}

// Guard basado en feature flag
export const featureFlagGuard = (flagName: string): CanActivateFn =>
  () => inject(FeatureFlagsService).isEnabled(flagName)
        ? true
        : inject(Router).createUrlTree(['/not-found']);

// En routes:
{
  path: 'new-feature',
  canActivate: [featureFlagGuard('new-dashboard')],
  loadComponent: () => import('./new-feature.component').then(m => m.NewFeatureComponent),
}

// En template:
@if (featureFlags.flag('dark-mode')()) {
  <app-dark-mode-toggle />
}
```
