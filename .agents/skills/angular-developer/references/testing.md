# Testing en Angular — Jest, Testing Library y E2E

## Configuración de Testing

### Jest (recomendado sobre Karma)
```bash
# Instalar Jest para Angular
ng add jest-preset-angular

# O manual:
npm install -D jest jest-preset-angular @types/jest
```

```javascript
// jest.config.js
module.exports = {
  preset: 'jest-preset-angular',
  setupFilesAfterFramework: ['<rootDir>/setup-jest.ts'],
  globalSetup: 'jest-preset-angular/global-setup',
  testPathPattern: ['src/.*\\.spec\\.ts$'],
  collectCoverageFrom: ['src/**/*.ts', '!src/**/*.spec.ts', '!src/main.ts'],
  coverageThreshold: {
    global: { branches: 80, functions: 80, lines: 80, statements: 80 }
  },
};

// setup-jest.ts
import 'jest-preset-angular/setup-jest';
```

### Angular Testing Library (recomendado para component tests)
```bash
npm install -D @testing-library/angular @testing-library/user-event @testing-library/jest-dom
```

---

## Testing de Componentes con Angular Testing Library

```typescript
// user-card.component.spec.ts — usando Testing Library
import { render, screen, fireEvent } from '@testing-library/angular';
import userEvent from '@testing-library/user-event';
import { UserCardComponent } from './user-card.component';
import { User } from '../../core/models/user.model';

const mockUser: User = {
  id: '1',
  name: 'Alice Johnson',
  email: 'alice@example.com',
  role: 'admin',
  active: true,
  createdAt: new Date('2024-01-15'),
};

describe('UserCardComponent', () => {
  it('renders user name and email', async () => {
    await render(UserCardComponent, {
      inputs: { user: mockUser },
    });

    expect(screen.getByText('Alice Johnson')).toBeInTheDocument();
    expect(screen.getByText('alice@example.com')).toBeInTheDocument();
  });

  it('shows admin badge for admin users', async () => {
    await render(UserCardComponent, {
      inputs: { user: { ...mockUser, role: 'admin' } },
    });

    expect(screen.getByText('Admin')).toBeInTheDocument();
  });

  it('hides admin badge for non-admin users', async () => {
    await render(UserCardComponent, {
      inputs: { user: { ...mockUser, role: 'user' } },
    });

    expect(screen.queryByText('Admin')).not.toBeInTheDocument();
  });

  it('emits selected event when Select button is clicked', async () => {
    const user = userEvent.setup();
    const selectedSpy = jest.fn();

    await render(UserCardComponent, {
      inputs: { user: mockUser },
      on: { selected: selectedSpy },
    });

    await user.click(screen.getByRole('button', { name: /select/i }));

    expect(selectedSpy).toHaveBeenCalledWith(mockUser);
  });
});
```

---

## Testing con TestBed (para casos más complejos)

```typescript
// user-list.component.spec.ts
import { ComponentFixture, TestBed, fakeAsync, tick } from '@angular/core/testing';
import { signal } from '@angular/core';
import { UserListComponent } from './user-list.component';
import { UserService } from '../../core/services/user.service';
import { of, throwError } from 'rxjs';

describe('UserListComponent', () => {
  let component: UserListComponent;
  let fixture: ComponentFixture<UserListComponent>;
  let mockUserService: jest.Mocked<UserService>;

  beforeEach(async () => {
    mockUserService = {
      getUsers: jest.fn(),
      deleteUser: jest.fn(),
    } as any;

    await TestBed.configureTestingModule({
      imports: [UserListComponent],
      providers: [
        { provide: UserService, useValue: mockUserService }
      ],
    }).compileComponents();

    fixture = TestBed.createComponent(UserListComponent);
    component = fixture.componentInstance;
  });

  it('should load users on init', fakeAsync(() => {
    const mockUsers = [
      { id: '1', name: 'Alice' },
      { id: '2', name: 'Bob' },
    ];
    mockUserService.getUsers.mockReturnValue(of(mockUsers));

    fixture.detectChanges();  // triggers ngOnInit
    tick();                   // resolves async operations
    fixture.detectChanges();  // re-render with data

    const items = fixture.nativeElement.querySelectorAll('[data-testid="user-item"]');
    expect(items).toHaveLength(2);
    expect(items[0].textContent).toContain('Alice');
  }));

  it('should show error message when loading fails', fakeAsync(() => {
    mockUserService.getUsers.mockReturnValue(throwError(() => new Error('Network error')));

    fixture.detectChanges();
    tick();
    fixture.detectChanges();

    const error = fixture.nativeElement.querySelector('[data-testid="error-message"]');
    expect(error).toBeTruthy();
    expect(error.textContent).toContain('Failed to load');
  }));
});
```

---

## Testing de Servicios

```typescript
// auth.service.spec.ts
import { TestBed, fakeAsync, tick } from '@angular/core/testing';
import { HttpTestingController, provideHttpClientTesting } from '@angular/common/http/testing';
import { provideHttpClient } from '@angular/common/http';
import { AuthService } from './auth.service';

describe('AuthService', () => {
  let service: AuthService;
  let httpMock: HttpTestingController;

  beforeEach(() => {
    TestBed.configureTestingModule({
      providers: [
        AuthService,
        provideHttpClient(),
        provideHttpClientTesting(),
      ],
    });

    service = TestBed.inject(AuthService);
    httpMock = TestBed.inject(HttpTestingController);
  });

  afterEach(() => {
    httpMock.verify();  // verifica que no haya peticiones pendientes
  });

  it('should login successfully', fakeAsync(() => {
    const credentials = { email: 'alice@example.com', password: 'password123' };
    const mockResponse = { token: 'jwt-token', user: { id: '1', name: 'Alice' } };

    let result: any;
    service.login(credentials).subscribe(res => result = res);

    const req = httpMock.expectOne('/api/auth/login');
    expect(req.request.method).toBe('POST');
    expect(req.request.body).toEqual(credentials);

    req.flush(mockResponse);
    tick();

    expect(result).toEqual(mockResponse);
    expect(service.isAuthenticated()).toBe(true);
  }));

  it('should handle login error', fakeAsync(() => {
    const credentials = { email: 'wrong@example.com', password: 'wrong' };

    let error: any;
    service.login(credentials).subscribe({
      error: err => error = err
    });

    httpMock.expectOne('/api/auth/login').error(new ErrorEvent('401'), { status: 401 });
    tick();

    expect(error.status).toBe(401);
    expect(service.isAuthenticated()).toBe(false);
  }));
});
```

---

## Testing de Signals

```typescript
// counter.component.spec.ts — signals en tests
import { TestBed } from '@angular/core/testing';
import { CounterComponent } from './counter.component';

describe('CounterComponent with Signals', () => {
  it('should increment count', () => {
    TestBed.configureTestingModule({
      imports: [CounterComponent]
    });

    const fixture = TestBed.createComponent(CounterComponent);
    const component = fixture.componentInstance;

    // Acceder al signal directamente en tests
    expect(component.count()).toBe(0);

    component.increment();
    expect(component.count()).toBe(1);

    // Los computed también son señales
    expect(component.doubled()).toBe(2);
  });

  it('should reflect signal changes in template', () => {
    const fixture = TestBed.createComponent(CounterComponent);
    fixture.detectChanges();

    const component = fixture.componentInstance;
    component.count.set(5);
    fixture.detectChanges();

    const countEl = fixture.nativeElement.querySelector('[data-testid="count"]');
    expect(countEl.textContent).toContain('5');
  });
});
```

---

## E2E Testing con Cypress

```typescript
// cypress/e2e/login.cy.ts
describe('Login Flow', () => {
  beforeEach(() => {
    cy.intercept('POST', '/api/auth/login', {
      statusCode: 200,
      body: { token: 'fake-jwt', user: { id: '1', name: 'Alice' } }
    }).as('login');
  });

  it('should login successfully with valid credentials', () => {
    cy.visit('/login');

    cy.findByLabelText(/email/i).type('alice@example.com');
    cy.findByLabelText(/password/i).type('password123');
    cy.findByRole('button', { name: /sign in/i }).click();

    cy.wait('@login').its('request.body').should('deep.equal', {
      email: 'alice@example.com',
      password: 'password123',
    });

    cy.url().should('include', '/dashboard');
    cy.findByText('Welcome, Alice').should('be.visible');
  });

  it('should show error on invalid credentials', () => {
    cy.intercept('POST', '/api/auth/login', { statusCode: 401 }).as('loginFail');

    cy.visit('/login');
    cy.findByLabelText(/email/i).type('wrong@example.com');
    cy.findByLabelText(/password/i).type('wrongpass');
    cy.findByRole('button', { name: /sign in/i }).click();

    cy.wait('@loginFail');
    cy.findByRole('alert').should('contain.text', 'Invalid credentials');
    cy.url().should('include', '/login');
  });
});
```
