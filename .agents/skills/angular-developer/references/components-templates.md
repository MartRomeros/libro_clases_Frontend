# Componentes y Templates — Angular Moderno

## Anatomía de un Componente Standalone Moderno

```typescript
// user-card.component.ts — componente completo y bien estructurado
import { Component, input, output, computed, signal, inject, OnInit } from '@angular/core';
import { CommonModule, DatePipe } from '@angular/common';
import { RouterLink } from '@angular/router';
import { User } from '../../core/models/user.model';
import { UserService } from '../../core/services/user.service';

@Component({
  selector: 'app-user-card',
  standalone: true,
  imports: [CommonModule, RouterLink, DatePipe],
  changeDetection: ChangeDetectionStrategy.OnPush,  // siempre en componentes nuevos
  template: `
    <div class="card" [class.active]="isActive()">
      <h2>{{ user().name }}</h2>
      <p>{{ user().email }}</p>
      <p>{{ user().createdAt | date:'mediumDate' }}</p>

      @if (isAdmin()) {
        <span class="badge">Admin</span>
      }

      <button (click)="onSelect()">Select</button>
      <a [routerLink]="['/users', user().id]">View profile</a>
    </div>
  `,
  styles: [`
    .card { padding: 1rem; border: 1px solid #ddd; border-radius: 8px; }
    .card.active { border-color: var(--primary); }
    .badge { background: gold; padding: 2px 8px; border-radius: 4px; }
  `]
})
export class UserCardComponent {
  // Inputs con signal API (v17.1+) — tipado estricto, sin decoradores
  user = input.required<User>();
  isActive = input(false);          // con valor por defecto

  // Input con transformación (v16+)
  maxItems = input(10, { transform: numberAttribute });

  // Output
  selected = output<User>();
  deleted = output<string>();  // id del usuario

  // Computed desde inputs
  isAdmin = computed(() => this.user().role === 'admin');

  // DI moderno sin constructor
  private userService = inject(UserService);

  onSelect() {
    this.selected.emit(this.user());
  }
}
```

---

## Inputs — Evolución y Mejores Prácticas

```typescript
// Angular v16+ — Signal-based inputs (RECOMENDADO)
export class MyComponent {
  // Input requerido — TypeScript error si no se provee
  name = input.required<string>();

  // Input opcional con default
  count = input(0);

  // Input con alias
  label = input('', { alias: 'buttonLabel' });

  // Input con transformación integrada
  disabled = input(false, { transform: booleanAttribute });  // coerce string a boolean
  size = input(0, { transform: numberAttribute });           // coerce string a number

  // Computed derivado de input
  upperName = computed(() => this.name().toUpperCase());
}

// Angular v14 y anteriores — Decorator-based (aún válido)
export class OldComponent {
  @Input({ required: true }) name!: string;
  @Input() count = 0;
  @Input('buttonLabel') label = '';
}

// USO EN TEMPLATE:
// <app-my [name]="'Alice'" [count]="5" [disabled]="true" />
// <app-my name="Alice" [count]="5" disabled />  // disabled como attribute → booleanAttribute
```

---

## Ciclo de Vida — Cuándo Usar Cada Hook

```typescript
import { Component, OnInit, OnDestroy, AfterViewInit,
         OnChanges, SimpleChanges, viewChild, ElementRef } from '@angular/core';

@Component({ selector: 'app-lifecycle', standalone: true, template: `
  <div #container>...</div>
` })
export class LifecycleComponent implements OnInit, OnDestroy, AfterViewInit, OnChanges {

  // viewChild (signal-based, v17.3+) — reemplaza @ViewChild
  container = viewChild.required<ElementRef>('container');

  // OnChanges — para inputs basados en decoradores (NO signal inputs)
  ngOnChanges(changes: SimpleChanges) {
    if (changes['name'] && !changes['name'].firstChange) {
      console.log('name changed from', changes['name'].previousValue);
    }
  }

  // OnInit — inicialización que depende de inputs ya resueltos
  ngOnInit() {
    this.loadData();
    // Signal inputs: acceder aquí es seguro (ya tienen su valor)
  }

  // AfterViewInit — cuando el DOM está listo
  ngAfterViewInit() {
    // Acceder a viewChild aquí de forma segura
    const el = this.container().nativeElement;
    el.focus();
  }

  // OnDestroy — limpiar recursos
  ngOnDestroy() {
    // Con takeUntilDestroyed esto es automático para observables
    // Para otros recursos (timers, event listeners externos):
    clearInterval(this.intervalId);
    document.removeEventListener('click', this.handler);
  }

  // ORDEN DE EJECUCIÓN:
  // constructor → ngOnChanges → ngOnInit → ngDoCheck → ngAfterContentInit
  // → ngAfterContentChecked → ngAfterViewInit → ngAfterViewChecked
  // [cada update:] → ngOnChanges → ngDoCheck → ngAfterContentChecked → ngAfterViewChecked
  // [destroy:] → ngOnDestroy
}
```

---

## Change Detection — OnPush y Zoneless

```typescript
// Change Detection Strategy — SIEMPRE usar OnPush en nuevos componentes
@Component({
  selector: 'app-list',
  standalone: true,
  changeDetection: ChangeDetectionStrategy.OnPush,
  template: `
    @for (item of items(); track item.id) {
      <app-item [item]="item" />
    }
  `
})
export class ListComponent {
  items = input.required<Item[]>();

  // Con OnPush, el componente solo se re-renderiza cuando:
  // 1. Un @Input cambia su REFERENCIA (no el contenido del objeto)
  // 2. Un Event dentro del componente ocurre
  // 3. Un Observable conectado con async pipe emite
  // 4. Un Signal que se lee en el template cambia
  // 5. Se llama manualmente a markForCheck() o detectChanges()
}

// Zoneless (Angular v18+ experimental, estable en v19)
// bootstrapApplication(AppComponent, {
//   providers: [provideExperimentalZonelessChangeDetection()]
// });
// Con zoneless + signals: change detection solo cuando signals cambian
// Beneficio: sin Zone.js, bundle más pequeño y mejor rendimiento

// Forzar detección cuando es necesario
export class ManualDetectionComponent {
  private cdr = inject(ChangeDetectorRef);

  update() {
    this.data = newData;
    this.cdr.markForCheck();  // en componente OnPush
    // o this.cdr.detectChanges() para sincrónico
  }
}
```

---

## Pipes — Built-in y Custom

```typescript
// Pipe personalizado — puro (por defecto) es más eficiente
import { Pipe, PipeTransform } from '@angular/core';

@Pipe({
  name: 'truncate',
  standalone: true,
  pure: true,  // default — no se re-ejecuta si los args no cambian
})
export class TruncatePipe implements PipeTransform {
  transform(value: string, maxLength: number = 100, suffix: string = '...'): string {
    if (!value || value.length <= maxLength) return value;
    return value.substring(0, maxLength).trimEnd() + suffix;
  }
}

// Pipe impuro — se ejecuta en CADA detección de cambio (usar con cuidado)
@Pipe({ name: 'filter', standalone: true, pure: false })
export class FilterPipe implements PipeTransform {
  transform(items: any[], searchTerm: string): any[] {
    if (!searchTerm) return items;
    return items.filter(item => item.name.includes(searchTerm));
  }
}
// ⚠️ Un pipe impuro puede causar problemas de performance
// Preferir calcular el valor en el componente con computed()

// Built-in pipes esenciales:
// | date:'yyyy-MM-dd'          → formateo de fechas
// | currency:'USD'             → formateo de moneda
// | number:'1.2-2'             → formateo de números (1 entero, 2 decimales)
// | percent                    → porcentaje
// | json                       → para debugging
// | async                      → suscribirse a Observable/Promise en template
// | slice:0:5                  → slicear arrays/strings
// | uppercase / lowercase      → transformar texto
// | titlecase                  → Primera Letra En Mayúscula
// | keyvalue                   → iterar objetos
```

---

## Directivas — Structural y Attribute

```typescript
// Attribute Directive — modificar comportamiento o apariencia
import { Directive, ElementRef, HostListener, input, effect } from '@angular/core';

@Directive({
  selector: '[appHighlight]',
  standalone: true,
})
export class HighlightDirective {
  color = input('yellow', { alias: 'appHighlight' });
  private el = inject(ElementRef);

  constructor() {
    // Effect para reaccionar a cambios del input signal
    effect(() => {
      this.el.nativeElement.style.backgroundColor = this.color();
    });
  }

  @HostListener('mouseenter') onMouseEnter() {
    this.highlight(this.color());
  }

  @HostListener('mouseleave') onMouseLeave() {
    this.highlight('');
  }

  private highlight(color: string) {
    this.el.nativeElement.style.backgroundColor = color;
  }
}

// Uso: <p [appHighlight]="'lightblue'">Texto</p>
//      <p appHighlight>Texto (usa color por defecto: yellow)</p>

// Structural Directive (v17+ usa @if, @for — ya no necesitas crear *ngIf propios)
// Si necesitas una custom structural directive:
@Directive({
  selector: '[appUnless]',
  standalone: true,
})
export class UnlessDirective {
  condition = input.required<boolean>({ alias: 'appUnless' });
  private templateRef = inject(TemplateRef);
  private vcr = inject(ViewContainerRef);

  constructor() {
    effect(() => {
      if (!this.condition()) {
        this.vcr.createEmbeddedView(this.templateRef);
      } else {
        this.vcr.clear();
      }
    });
  }
}
// Uso: <div *appUnless="isLoading">Content</div>
```

---

## ViewChild y ContentChild — Signal API Moderna

```typescript
// Signal-based queries (v17.3+) — RECOMENDADO
export class ParentComponent {
  // viewChild — busca en el template propio
  searchInput = viewChild<ElementRef>('searchRef');          // opcional → Signal<T | undefined>
  searchInputRequired = viewChild.required<ElementRef>('searchRef'); // obligatorio → Signal<T>

  // viewChildren — todos los matches
  items = viewChildren(ItemComponent);  // Signal<readonly ItemComponent[]>

  // contentChild — busca en el contenido proyectado (ng-content)
  icon = contentChild(MatIcon);
  icons = contentChildren(MatIcon);

  ngAfterViewInit() {
    // Acceder al valor del signal
    const el = this.searchInputRequired().nativeElement;
    el.focus();

    // viewChildren es un signal — reactivo
    effect(() => {
      console.log('Items count:', this.items().length);
    });
  }
}

// Template:
// <input #searchRef type="text" />
// <app-item *ngFor="let i of data" />

// Decorator-based (aún compatible):
@ViewChild('searchRef') searchInput!: ElementRef;
@ViewChildren(ItemComponent) items!: QueryList<ItemComponent>;
```
