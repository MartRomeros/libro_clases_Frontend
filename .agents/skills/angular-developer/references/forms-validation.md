# Forms y Validación — Reactive Forms en Angular

## Reactive Forms — La Forma Correcta

```typescript
import { Component, inject, OnInit } from '@angular/core';
import { FormBuilder, FormGroup, FormControl, FormArray,
         Validators, AbstractControl, ValidationErrors, ReactiveFormsModule } from '@angular/forms';
import { takeUntilDestroyed } from '@angular/core/rxjs-interop';

// Typed forms (Angular v14+) — SIEMPRE usar tipos explícitos
type UserForm = {
  name: FormControl<string>;
  email: FormControl<string>;
  role: FormControl<'admin' | 'user' | 'viewer'>;
  address: FormGroup<{
    street: FormControl<string>;
    city: FormControl<string>;
  }>;
  phones: FormArray<FormControl<string>>;
};

@Component({
  selector: 'app-user-form',
  standalone: true,
  imports: [ReactiveFormsModule],
  template: `
    <form [formGroup]="form" (ngSubmit)="onSubmit()">
      <div>
        <label for="name">Name</label>
        <input id="name" formControlName="name" />
        @if (nameControl.errors?.['required'] && nameControl.touched) {
          <span class="error">Name is required</span>
        }
        @if (nameControl.errors?.['minlength'] && nameControl.touched) {
          <span class="error">
            Min {{ nameControl.errors?.['minlength'].requiredLength }} characters
          </span>
        }
      </div>

      <div formGroupName="address">
        <input formControlName="street" placeholder="Street" />
        <input formControlName="city" placeholder="City" />
      </div>

      <div formArrayName="phones">
        @for (phone of phonesArray.controls; track $index) {
          <div>
            <input [formControlName]="$index" placeholder="Phone" />
            <button type="button" (click)="removePhone($index)">Remove</button>
          </div>
        }
        <button type="button" (click)="addPhone()">Add Phone</button>
      </div>

      <button type="submit" [disabled]="form.invalid || form.pristine">Save</button>
    </form>
  `
})
export class UserFormComponent implements OnInit {
  private fb = inject(FormBuilder);

  // Typed form — TypeScript conoce el tipo de cada control
  form = this.fb.group<UserForm>({
    name: this.fb.control('', {
      validators: [Validators.required, Validators.minLength(2), Validators.maxLength(50)],
      nonNullable: true,   // el reset() vuelve al valor inicial, no a null
    }),
    email: this.fb.nonNullable.control('', [Validators.required, Validators.email]),
    role: this.fb.nonNullable.control<'admin' | 'user' | 'viewer'>('user'),
    address: this.fb.group({
      street: this.fb.nonNullable.control('', Validators.required),
      city: this.fb.nonNullable.control('', Validators.required),
    }),
    phones: this.fb.array([this.fb.nonNullable.control('')]),
  });

  // Accessors tipados
  get nameControl() { return this.form.controls.name; }
  get phonesArray() { return this.form.controls.phones; }

  ngOnInit() {
    // Reaccionar a cambios de forma reactiva
    this.form.controls.role.valueChanges.pipe(
      takeUntilDestroyed()
    ).subscribe(role => {
      const addressCtrl = this.form.controls.address;
      if (role === 'admin') {
        addressCtrl.enable();
      } else {
        addressCtrl.disable();
      }
    });
  }

  addPhone() {
    this.phonesArray.push(this.fb.nonNullable.control('', Validators.required));
  }

  removePhone(index: number) {
    this.phonesArray.removeAt(index);
  }

  onSubmit() {
    if (this.form.invalid) {
      this.form.markAllAsTouched();  // mostrar todos los errores
      return;
    }
    // form.getRawValue() incluye controls deshabilitados
    // form.value solo incluye controls habilitados
    const data = this.form.getRawValue();
    console.log(data);
  }

  // Llenar el formulario con datos existentes
  patchForm(user: Partial<User>) {
    this.form.patchValue(user);      // actualiza solo los campos presentes
    // this.form.setValue(user);     // requiere TODOS los campos
  }

  resetForm() {
    this.form.reset();               // vuelve a los valores iniciales (nonNullable)
  }
}
```

---

## Validadores Custom

```typescript
// Validador sincrónico — función
import { AbstractControl, ValidationErrors, ValidatorFn } from '@angular/forms';

export function noWhitespace(): ValidatorFn {
  return (control: AbstractControl): ValidationErrors | null => {
    const hasWhitespace = /\s/.test(control.value);
    return hasWhitespace ? { noWhitespace: { value: control.value } } : null;
  };
}

export function minAge(minimumAge: number): ValidatorFn {
  return (control: AbstractControl): ValidationErrors | null => {
    if (!control.value) return null;
    const age = new Date().getFullYear() - new Date(control.value).getFullYear();
    return age < minimumAge
      ? { minAge: { required: minimumAge, actual: age } }
      : null;
  };
}

// Validador que compara dos campos (cross-field validation)
export function passwordsMatch(): ValidatorFn {
  return (group: AbstractControl): ValidationErrors | null => {
    const password = group.get('password')?.value;
    const confirm = group.get('confirmPassword')?.value;
    return password === confirm ? null : { passwordsMismatch: true };
  };
}

// Uso:
this.fb.group({
  username: ['', [Validators.required, noWhitespace()]],
  birthDate: ['', minAge(18)],
  password: ['', Validators.required],
  confirmPassword: [''],
}, { validators: passwordsMatch() });

// Validador asincrónico — para verificar disponibilidad en el servidor
export function usernameAvailable(userService: UserService): AsyncValidatorFn {
  return (control: AbstractControl): Observable<ValidationErrors | null> => {
    if (!control.value) return of(null);

    return timer(500).pipe(  // debounce de 500ms
      switchMap(() => userService.checkUsername(control.value)),
      map(available => available ? null : { usernameTaken: true }),
      catchError(() => of(null))  // ante error del servidor, no bloquear
    );
  };
}

// Uso de async validator:
username: ['', Validators.required, usernameAvailable(this.userService)]
```

---

## Template para Mostrar Errores — Helper Component

```typescript
// field-error.component.ts — reutilizable para todos los formularios
@Component({
  selector: 'app-field-error',
  standalone: true,
  template: `
    @if (shouldShow()) {
      <div class="field-errors" role="alert" aria-live="polite">
        @if (control().hasError('required')) {
          <span>This field is required</span>
        }
        @if (control().hasError('email')) {
          <span>Invalid email format</span>
        }
        @if (control().hasError('minlength'); as err) {
          <span>Minimum {{ err.requiredLength }} characters (current: {{ err.actualLength }})</span>
        }
        @if (control().hasError('maxlength'); as err) {
          <span>Maximum {{ err.requiredLength }} characters</span>
        }
        @if (control().hasError('min'); as err) {
          <span>Minimum value is {{ err.min }}</span>
        }
        @if (control().hasError('pattern')) {
          <span>{{ patternMessage() }}</span>
        }
        @if (control().hasError('usernameTaken')) {
          <span>Username is already taken</span>
        }
      </div>
    }
  `,
  styles: [`.field-errors { color: var(--error-color, red); font-size: 0.875rem; }`]
})
export class FieldErrorComponent {
  control = input.required<AbstractControl>();
  patternMessage = input('Invalid format');

  // Mostrar error solo si el campo fue tocado o el form fue submitted
  shouldShow = computed(() =>
    this.control().invalid && (this.control().dirty || this.control().touched)
  );
}

// Uso: <app-field-error [control]="form.controls.email" />
```

---

## Control Value Accessor — Componentes de Input Custom

```typescript
// Integrar componentes propios con el sistema de formularios de Angular
import { ControlValueAccessor, NG_VALUE_ACCESSOR } from '@angular/forms';

@Component({
  selector: 'app-star-rating',
  standalone: true,
  template: `
    @for (star of stars; track $index) {
      <button type="button"
        [class.filled]="($index + 1) <= value()"
        (click)="setValue($index + 1)"
        [disabled]="isDisabled()">
        ★
      </button>
    }
  `,
  providers: [{
    provide: NG_VALUE_ACCESSOR,
    useExisting: StarRatingComponent,
    multi: true,
  }]
})
export class StarRatingComponent implements ControlValueAccessor {
  stars = Array(5).fill(0);
  value = signal(0);
  isDisabled = signal(false);

  private onChange: (value: number) => void = () => {};
  private onTouched: () => void = () => {};

  setValue(rating: number) {
    this.value.set(rating);
    this.onChange(rating);
    this.onTouched();
  }

  // Implementar ControlValueAccessor
  writeValue(value: number): void {
    this.value.set(value ?? 0);
  }

  registerOnChange(fn: (value: number) => void): void {
    this.onChange = fn;
  }

  registerOnTouched(fn: () => void): void {
    this.onTouched = fn;
  }

  setDisabledState(isDisabled: boolean): void {
    this.isDisabled.set(isDisabled);
  }
}

// Uso como cualquier input de formulario:
// <app-star-rating formControlName="rating" />
// <app-star-rating [(ngModel)]="rating" />
```
