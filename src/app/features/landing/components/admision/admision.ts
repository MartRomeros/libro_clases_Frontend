import { Component, inject, signal } from '@angular/core';
import { FormBuilder, FormGroup, ReactiveFormsModule, Validators, } from '@angular/forms';
import { MatOptionModule } from '@angular/material/core';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';
import { MatSelectModule } from '@angular/material/select';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
import { MatProgressSpinnerModule } from '@angular/material/progress-spinner';
import { MatSnackBar, MatSnackBarModule } from '@angular/material/snack-bar';

@Component({
  selector: 'app-admision',
  imports: [ReactiveFormsModule, MatFormFieldModule, MatOptionModule, MatInputModule, MatSelectModule, MatButtonModule, MatIconModule, MatProgressSpinnerModule, MatSnackBarModule],
  templateUrl: './admision.html',
  styleUrl: './admision.css',
})
export class Admision {


  private fb = inject(FormBuilder)
  private snackBar = inject(MatSnackBar);
  
  admisionForm!: FormGroup;
  isLoading = signal(false);

  constructor() {

    this.admisionForm = this.fb.group({
      nombre: ['', [Validators.required]],
      email: ['', [Validators.required, Validators.email]],
      telefono: [''],
      nivel: ['', [Validators.required]]
    });

  }

  onAdmisionSubmit() {
    if (this.admisionForm.invalid) {
      this.admisionForm.markAllAsTouched();
      return;
    }
    this.isLoading.set(true);
    
    setTimeout(() => {
      this.isLoading.set(false);
      this.admisionForm.reset();
      this.snackBar.open('¡Solicitud enviada con éxito! Nos contactaremos pronto.', 'Cerrar', {
        duration: 5000,
        horizontalPosition: 'end',
        verticalPosition: 'bottom',
        panelClass: ['success-snackbar']
      });
    }, 2000);
  }



}
