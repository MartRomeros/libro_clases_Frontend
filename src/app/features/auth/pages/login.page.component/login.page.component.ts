import { Component, inject, signal } from '@angular/core';
import { AuthMutations } from '../../data-access/auth.mutations';
import { FormBuilder, FormGroup, ReactiveFormsModule, Validators } from '@angular/forms';
import { MatCardModule } from '@angular/material/card';
import { MatIconModule } from '@angular/material/icon';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatProgressSpinnerModule } from '@angular/material/progress-spinner';
import { MatButtonModule } from '@angular/material/button';
import { MatInputModule } from '@angular/material/input';
import { CommonModule } from '@angular/common';

@Component({
  selector: 'app-login.page.component',
  imports: [
    CommonModule,
    ReactiveFormsModule,
    MatCardModule,
    MatIconModule,
    MatFormFieldModule,
    MatProgressSpinnerModule,
    MatButtonModule,
    MatInputModule,
    
  ],
  templateUrl: './login.page.component.html',
  styleUrl: './login.page.component.css',
})
export class LoginPageComponent {


  private fb = inject(FormBuilder);
  loginForm: FormGroup;
  hidePassword = signal(true);

  private readonly authMutations = inject(AuthMutations)
  readonly loginMutation = this.authMutations.login()

  constructor() {
    this.loginForm = this.fb.group({
      email: ['', [Validators.required, Validators.email]],
      password: ['', [Validators.required, Validators.minLength(3)]]
    })
  }

  onSubmit() {
    if (this.loginForm.valid && !this.loginMutation.isPending()) {
      this.loginMutation.mutate(this.loginForm.value);
    } else {
      this.loginForm.markAllAsTouched();
    }
  }

  togglePasswordVisibility() {
    this.hidePassword.set(!this.hidePassword());
  }




}
