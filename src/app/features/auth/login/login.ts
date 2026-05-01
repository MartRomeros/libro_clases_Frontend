import { Component, signal, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ReactiveFormsModule, FormBuilder, FormGroup, Validators } from '@angular/forms';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
import { MatProgressSpinnerModule } from '@angular/material/progress-spinner';
import { MatSnackBar, MatSnackBarModule } from '@angular/material/snack-bar';
import { RouterModule, Router } from '@angular/router';
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
export class Login implements OnInit {
  loginForm: FormGroup;
  hidePassword = signal(true);
  isLoading = signal(false);
  errorMessage = signal<string | null>(null);

  constructor(
    private fb: FormBuilder,
    private authService: AuthService,
    private snackBar: MatSnackBar,
    private router: Router
  ) {
    this.loginForm = this.fb.group({
      email: ['', [Validators.required, Validators.email]],
      password: ['', [Validators.required, Validators.minLength(3)]]
    });
  }

  ngOnInit() {
    console.log('Login component initialized. Authenticated:', this.authService.isAuthenticated());
    if (this.authService.isAuthenticated()) {
      const user = this.authService.currentUser();
      console.log('User already authenticated:', user);
      if (user?.role) {
        this.redirectByRole(user.role);
      }
    }
  }

  togglePasswordVisibility() {
    this.hidePassword.set(!this.hidePassword());
  }

  onSubmit() {
    if (this.loginForm.valid) {
      this.isLoading.set(true);
      this.errorMessage.set(null);

      this.authService.login(this.loginForm.value).subscribe({
        next: (response: any) => {
          console.log(response)
          this.isLoading.set(false);
          this.snackBar.open('¡Bienvenido de nuevo!', 'Cerrar', {
            duration: 3000,
            horizontalPosition: 'center',
            verticalPosition: 'bottom',
            panelClass: ['success-snackbar']
          });

          // Extract role from response body or decode from JWT token
          let role = response.user?.role || response.role;
          
          let userId: number | undefined;

          if (!role && response.token) {
            try {
              const payloadBase64 = response.token.split('.')[1];
              const payloadJson = atob(payloadBase64);
              const payload = JSON.parse(payloadJson);
              console.log('Decoded token payload:', payload);
              role = payload.role || payload.rol || payload.user_role;
              userId = payload.id || payload.userId || payload.sub;
            } catch (e) {
              console.error('Error decoding token:', e);
            }
          }
          
          // Si tenemos el ID, vamos a BackGestion por el nombre real
          if (userId) {
            this.authService.fetchUserDetails(userId, role || '').subscribe(() => {
              this.redirectByRole(role);
            });
          } else {
            this.redirectByRole(role);
          }
        },
        error: (error) => {
          this.isLoading.set(false);
          this.errorMessage.set(error);
          this.snackBar.open(error, 'Cerrar', {
            duration: 5000,
            horizontalPosition: 'center',
            verticalPosition: 'bottom',
            panelClass: ['error-snackbar']
          });
        }
      });
    } else {
      this.loginForm.markAllAsTouched();
    }
  }

  private redirectByRole(role: string | undefined) {
    console.log('Role received for redirection:', role);
    const normalizedRole = role?.toLowerCase().trim();
    console.log('Normalized role for comparison:', normalizedRole);

    if (normalizedRole === 'administrador' || normalizedRole === 'admin') {
      this.router.navigate(['/admin']);
    } else if (normalizedRole === 'docente') {
      this.router.navigate(['/docente']);
    } else if (normalizedRole === 'estudiante') {
      this.router.navigate(['/estudiante']);
    } else {
      console.warn('Role not recognized, redirecting to home');
      this.snackBar.open(`Rol "${role}" no reconocido para redirección`, 'Cerrar', {
        duration: 5000,
        horizontalPosition: 'center',
        verticalPosition: 'bottom',
      });
      this.router.navigate(['/']);
    }
  }
}
