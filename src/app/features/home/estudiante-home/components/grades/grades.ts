import { Component, inject, signal } from '@angular/core';
import { Navbar } from '../../../../../layout/navbar/navbar';
import { DocenteService } from '../../../../../core/services/docente.service';
import { AuthService } from '../../../../../core/services/auth.service';
import { Router } from '@angular/router';
import { MatTableDataSource, MatTableModule } from '@angular/material/table';
import { MatCardModule } from '@angular/material/card';
import { MatProgressSpinnerModule } from '@angular/material/progress-spinner';
import { MatDividerModule } from '@angular/material/divider';
import { MatIconModule } from '@angular/material/icon';

@Component({
  selector: 'app-grades',
  imports: [Navbar,
    MatCardModule,
    MatProgressSpinnerModule,
    MatDividerModule,
    MatIconModule,
    MatTableModule
   ],
  templateUrl: './grades.html',
  styleUrl: './grades.css',
})
export class Grades {

  private docenteService = inject(DocenteService);
  private authService = inject(AuthService);


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


}
