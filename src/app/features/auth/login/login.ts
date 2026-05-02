import { Component, inject, effect, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ReactiveFormsModule, FormBuilder, FormGroup, Validators } from '@angular/forms';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
import { MatProgressSpinnerModule } from '@angular/material/progress-spinner';
import { MatSnackBar, MatSnackBarModule } from '@angular/material/snack-bar';
import { RouterModule, Router } from '@angular/router';
import { injectMutation } from '@tanstack/angular-query-experimental';
import { AuthService } from '../../../core/services/auth.service';

@Component({
  selector: 'app-login',
  standalone: true,
  imports: [
    CommonModule,
    ReactiveFormsModule,
    MatFormFieldModule,
    MatInputModule,
    MatButtonModule,
    MatIconModule,
    MatProgressSpinnerModule,
    MatSnackBarModule,
    RouterModule
  ],
  templateUrl: './login.html',
  styleUrl: './login.css'
})
export class Login {
  private fb = inject(FormBuilder);
  private authService = inject(AuthService);
  private snackBar = inject(MatSnackBar);
  private router = inject(Router);

  loginForm: FormGroup;
  hidePassword = signal(true);
  loginMutation = injectMutation(() => this.authService.loginOptions());

  constructor() {
    this.loginForm = this.fb.group({
      email: ['', [Validators.required, Validators.email]],
      password: ['', [Validators.required, Validators.minLength(3)]]
    });

    effect(() => {
      const data = this.loginMutation.data();
      if (data) {
        const role = data.user?.role ?? data.role ?? '';
        const roleLower = role.toLowerCase();
        if (roleLower.includes('admin')) {
          this.router.navigate(['/admin']);
        } else if (roleLower.includes('docente')) {
          this.router.navigate(['/docente']);
        } else if (roleLower.includes('estudiante')) {
          this.router.navigate(['/estudiante']);
        } else {
          this.router.navigate(['/']);
        }

        this.snackBar.open('¡Bienvenido de nuevo!', 'Cerrar', {
          duration: 3000,
          horizontalPosition: 'center',
          verticalPosition: 'bottom',
          panelClass: ['success-snackbar']
        });
      }
    });

    effect(() => {
      const error = this.loginMutation.error();
      if (error) {
        const message = typeof error === 'string' ? error : 'Ocurrió un error inesperado';
        this.snackBar.open(message, 'Cerrar', {
          duration: 5000,
          horizontalPosition: 'center',
          verticalPosition: 'bottom',
          panelClass: ['error-snackbar']
        });
      }
    });
  }

  togglePasswordVisibility() {
    this.hidePassword.set(!this.hidePassword());
  }

  onSubmit() {
    if (this.loginForm.valid && !this.loginMutation.isPending()) {
      this.loginMutation.mutate(this.loginForm.value);
    } else {
      this.loginForm.markAllAsTouched();
    }
  }
}
