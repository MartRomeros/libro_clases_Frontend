import { Component, OnInit, inject, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { MatCardModule } from '@angular/material/card';
import { MatTableModule, MatTableDataSource } from '@angular/material/table';
import { MatIconModule } from '@angular/material/icon';
import { MatButtonModule } from '@angular/material/button';
import { MatToolbarModule } from '@angular/material/toolbar';
import { MatProgressSpinnerModule } from '@angular/material/progress-spinner';
import { MatDividerModule } from '@angular/material/divider';
import { Router } from '@angular/router';
import { DocenteService } from '../../core/services/docente.service';
import { AuthService } from '../../core/services/auth.service';

@Component({
  selector: 'app-student-grades',
  standalone: true,
  imports: [
    CommonModule,
    MatCardModule,
    MatTableModule,
    MatIconModule,
    MatButtonModule,
    MatToolbarModule,
    MatProgressSpinnerModule,
    MatDividerModule
  ],
  templateUrl: './student-grades.html',
  styleUrl: './student-grades.css'
})
export class StudentGrades implements OnInit {
  private docenteService = inject(DocenteService);
  private authService = inject(AuthService);
  private router = inject(Router);

  isLoading = signal<boolean>(true);
  dataSource = new MatTableDataSource<any>([]);
  displayedColumns: string[] = ['asignatura', 'nota1', 'nota2', 'nota3', 'promedio'];

  ngOnInit(): void {
    this.cargarNotas();
  }

  cargarNotas(): void {
    const user = this.authService.currentUser();
    const estudianteId = user?.id ? Number(user.id) : null; 
    
    if (!estudianteId) {
      console.error('No se encontró ID de estudiante en la sesión');
      this.isLoading.set(false);
      return;
    }

    console.log('Solicitando notas para el estudiante ID:', estudianteId);

    this.docenteService.getNotasEstudiante(estudianteId).subscribe({
      next: (notas) => {
        console.log('Notas recibidas del backend:', notas);
        
        const tabla = notas.map(n => {
          const v1 = n.notaEv1 || null;
          const v2 = n.notaEv2 || null;
          const v3 = n.notaEv3 || null;
          
          let suma = 0;
          let cont = 0;
          if (v1) { suma += v1; cont++; }
          if (v2) { suma += v2; cont++; }
          if (v3) { suma += v3; cont++; }

          return {
            asignatura: n.asignaturaNombre,
            nota1: v1 || '-',
            nota2: v2 || '-',
            nota3: v3 || '-',
            promedio: cont > 0 ? (suma / cont).toFixed(1) : '-'
          };
        });
        this.dataSource.data = tabla;
        this.isLoading.set(false);
      },
      error: (err) => {
        console.error('Error cargando notas:', err);
        this.isLoading.set(false);
      }
    });
  }

  volverAlHome(): void {
    this.router.navigate(['/estudiante']);
  }

  get userProfile(): string {
    const user = this.authService.currentUser();
    const nombre = user?.name || 'Usuario';
    const role = user?.role ? user.role.charAt(0).toUpperCase() + user.role.slice(1).toLowerCase() : 'Estudiante';
    return `${nombre} | ${role}`;
  }

  cerrarSesion(): void {
    this.authService.logout();
    this.router.navigate(['/login']);
  }
}
