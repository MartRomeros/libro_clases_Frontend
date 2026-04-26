# Signals y RxJS — Reactividad en Angular Moderno

## Signals API Completa (Angular v16+, estable v17)

### Primitivos Fundamentales

```typescript
import { signal, computed, effect, Signal, WritableSignal } from '@angular/core';

// signal() — valor reactivo mutable
const count = signal(0);
const name = signal<string | null>(null);  // tipado explícito cuando hay ambigüedad

// Leer el valor (llamar como función)
console.log(count());  // 0

// Escribir valores
count.set(5);                   // reemplazar
count.update(n => n + 1);       // transformar basado en valor actual
count.mutate(arr => arr.push('item'));  // mutar (para arrays/objetos — evitar)
// Preferir: items.update(arr => [...arr, 'item'])

// computed() — derivado reactivo de solo lectura
const doubled = computed(() => count() * 2);
const fullName = computed(() => `${firstName()} ${lastName()}`);

// computed con dependencies tracking automático
// Angular rastrea qué signals se leen dentro del computed
const isAdult = computed(() => user().age >= 18);  // se recalcula cuando user() cambia

// effect() — side effect reactivo
const loggingEffect = effect(() => {
  // Este bloque se ejecuta cada vez que count() cambia
  console.log('Count changed to:', count());
  // NUNCA escribir signals dentro de effect sin allowSignalWrites
});

// effect con cleanup
const timerEffect = effect((onCleanup) => {
  const id = setInterval(() => count.update(n => n + 1), 1000);
  onCleanup(() => clearInterval(id));  // se ejecuta antes del próximo effect y en destroy
});

// effect con allowSignalWrites (usar con cuidado — puede crear loops)
effect(() => {
  if (sourceSignal() > 10) {
    targetSignal.set(0);  // requiere allowSignalWrites: true
  }
}, { allowSignalWrites: true });
```

### Signals Avanzados (v19+)

```typescript
import { linkedSignal, resource } from '@angular/core';

// linkedSignal — signal que resetea cuando otra signal cambia
const selectedUserId = signal<number>(1);
const selectedTab = linkedSignal(() => {
  selectedUserId();  // cuando selectedUserId cambia...
  return 'overview'; // ...selectedTab vuelve a 'overview'
});

// resource() — signal para datos async (experimental v19)
const userResource = resource({
  request: () => ({ id: userId() }),  // params reactivos
  loader: ({ request, abortSignal }) =>
    fetch(`/api/users/${request.id}`, { signal: abortSignal })
      .then(res => res.json()),
});
// userResource.value()  → Signal<User | undefined>
// userResource.status() → Signal<'idle' | 'loading' | 'loaded' | 'error' | 'reloading'>
// userResource.error()  → Signal<unknown>
// userResource.reload() → refetch manual
```

### Interoperabilidad Signals ↔ RxJS

```typescript
import { toSignal, toObservable } from '@angular/core/rxjs-interop';
import { inject } from '@angular/core';

@Component({ ... })
export class SearchComponent {
  private searchService = inject(SearchService);

  // String de búsqueda como signal
  searchQuery = signal('');

  // Observable → Signal (con cleanup automático por el injection context)
  results = toSignal(
    toObservable(this.searchQuery).pipe(
      debounceTime(300),
      distinctUntilChanged(),
      filter(q => q.length >= 2),
      switchMap(q => this.searchService.search(q)),
    ),
    { initialValue: [] }  // valor mientras el observable no emite
  );

  // Con manejo de errores
  safeResults = toSignal(
    this.searchService.results$.pipe(
      catchError(() => of([]))
    ),
    { initialValue: [] }
  );

  // Signal → Observable (cuando necesitas operadores RxJS)
  count = signal(0);
  count$ = toObservable(this.count); // Observable<number>
}

// FUERA de un injection context — pasar el injector manualmente
const results = toSignal(myObservable$, { injector: myInjector });
```

---

## RxJS en Angular — Operadores Esenciales

### El Arsenal de Operadores

```typescript
import { Component, inject } from '@angular/core';
import { Observable, Subject, BehaviorSubject, combineLatest, forkJoin, of, from } from 'rxjs';
import {
  map, filter, tap, take, first, takeUntil, takeUntilDestroyed,
  switchMap, mergeMap, concatMap, exhaustMap,
  debounceTime, distinctUntilChanged, throttleTime,
  catchError, retry, retryWhen, throwError,
  shareReplay, share, publishReplay,
  startWith, scan, reduce,
  withLatestFrom, combineLatestWith,
  delay, timeout
} from 'rxjs/operators';

// takeUntilDestroyed — el más importante para Angular (v16+)
@Component({ ... })
export class MyComponent {
  private destroyRef = inject(DestroyRef); // opcional — takeUntilDestroyed lo inyecta solo

  ngOnInit() {
    this.service.data$
      .pipe(takeUntilDestroyed(this.destroyRef))  // unsubscribe automático al destroy
      .subscribe(data => this.data = data);

    // Sin pasar destroyRef — solo funciona en injection context
    this.service.other$
      .pipe(takeUntilDestroyed())
      .subscribe(x => this.x = x);
  }
}
```

### Operadores de Transformación — Cuándo Usar Cada Uno

```typescript
// switchMap — cancela el observable anterior (el más común para HTTP)
// Usar para: búsquedas, navegación, cualquier cosa donde solo importa la última petición
searchQuery$.pipe(
  debounceTime(300),
  switchMap(q => this.http.get(`/api/search?q=${q}`))  // cancela petición anterior
);

// mergeMap — ejecuta todos en paralelo, sin cancelar
// Usar para: operaciones independientes que pueden correr simultáneamente
selectedIds$.pipe(
  mergeMap(id => this.http.get(`/api/items/${id}`))  // todas las peticiones corren en paralelo
);

// concatMap — ejecuta secuencialmente, espera cada uno
// Usar para: guardar archivos en orden, operaciones que deben ser secuenciales
filesToUpload$.pipe(
  concatMap(file => this.uploadService.upload(file))  // una a la vez, en orden
);

// exhaustMap — ignora nuevas emisiones mientras procesa la actual
// Usar para: botones de login (ignorar doble clic), acciones que no deben interrumpirse
loginButton$.pipe(
  exhaustMap(() => this.authService.login(credentials))  // ignora clicks mientras hace login
);
```

### Manejo de Errores en RxJS

```typescript
// catchError — recuperarse del error
this.http.get('/api/users').pipe(
  catchError(error => {
    if (error.status === 404) return of([]);  // fallback
    return throwError(() => error);            // re-lanzar si no sabemos manejar
  })
);

// retry con backoff exponencial
this.http.get('/api/data').pipe(
  retry({
    count: 3,
    delay: (error, retryCount) => timer(Math.pow(2, retryCount) * 1000)
  })
);

// timeout — falla si no emite en X ms
this.http.get('/api/data').pipe(
  timeout(5000),  // Error después de 5 segundos
  catchError(err => err instanceof TimeoutError ? of(null) : throwError(() => err))
);
```

### Subjects — Cuándo Usar Cada Uno

```typescript
// Subject — multicasting, no tiene valor actual
const click$ = new Subject<MouseEvent>();
// Uso: puente entre eventos y observables
btn.addEventListener('click', e => click$.next(e));

// BehaviorSubject — tiene valor actual, emite a nuevos suscriptores
const loading$ = new BehaviorSubject<boolean>(false);
loading$.value  // acceso sincrónico al valor actual
loading$.next(true);

// ReplaySubject — recuerda N valores para nuevos suscriptores
const history$ = new ReplaySubject<string>(5);  // recuerda últimos 5

// AsyncSubject — solo emite el ÚLTIMO valor cuando completa
const asyncResult$ = new AsyncSubject<number>();
// Útil para operaciones que solo tienen resultado al completar

// CUÁNDO USAR CADA UNO:
// Subject:        eventos/acciones que no necesitan valor inicial
// BehaviorSubject: estado que siempre debe tener un valor actual
// ReplaySubject:  auditoría, cache de eventos recientes
// En Angular moderno: considerar signals antes de BehaviorSubject para estado local
```

### Patrones de Combinación

```typescript
// combineLatest — combina cuando CUALQUIERA cambia (todos deben emitir al menos 1)
combineLatest([user$, permissions$, settings$]).pipe(
  map(([user, permissions, settings]) => ({ user, permissions, settings }))
);

// forkJoin — combina cuando TODOS completan (ideal para múltiples HTTP)
forkJoin({
  user: this.http.get<User>('/api/user'),
  orders: this.http.get<Order[]>('/api/orders'),
  config: this.http.get<Config>('/api/config'),
}).subscribe(({ user, orders, config }) => { ... });

// withLatestFrom — combina con el último valor de otro observable
clicks$.pipe(
  withLatestFrom(currentUser$),
  map(([click, user]) => ({ click, user }))
);

// shareReplay — compartir un observable y reproducir los últimos N valores
const expensiveData$ = this.http.get('/api/expensive').pipe(
  shareReplay(1)  // cache — no re-hace la petición HTTP para nuevos suscriptores
);
```
