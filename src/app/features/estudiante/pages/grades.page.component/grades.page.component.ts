import { Component, inject, computed } from '@angular/core';
import { CommonModule } from '@angular/common';
import { MatIconModule } from '@angular/material/icon';
import { Router } from '@angular/router';
import { injectQuery } from '@tanstack/angular-query-experimental';

import { NavbarComponent } from '../../sections/navbar.component/navbar.component';
import { AuthQueries } from '../../../auth/data-access/auth.queries';
import { EstudianteQueries } from '../../data-access/estudiante.queries';
import { LoadingStateComponent } from '../../../../shared/components/loading-state/loading-state.component';
import { ErrorStateComponent } from '../../../../shared/components/error-state/error-state.component';
import { EmptyStateComponent } from '../../../../shared/components/empty-state/empty-state.component';

@Component({
  selector: 'app-grades-page',
  standalone: true,
  imports: [
    CommonModule,
    NavbarComponent,
    MatIconModule,
    LoadingStateComponent,
    ErrorStateComponent,
    EmptyStateComponent
   ],
  templateUrl: './grades.page.component.html',
  styleUrl: './grades.page.component.css',
})
export class GradesPageComponent {
  private readonly authQueries = inject(AuthQueries);
  private readonly estudianteQueries = inject(EstudianteQueries);
  private readonly router = inject(Router);

  profileQuery = injectQuery(() => this.authQueries.me());
  profile = computed(() => this.profileQuery.data());
  estudianteId = computed(() => this.profile()?.usuario_id ?? 0);
  nombreEstudiante = computed(() => {
    const profile = this.profile() as Record<string, unknown> | undefined;
    if (!profile) return 'Estudiante';

    const nombre = typeof profile['nombre'] === 'string' ? profile['nombre'] : '';
    const apellidoPaterno =
      typeof profile['apellido_paterno'] === 'string' ? profile['apellido_paterno'] : '';
    const apellidoMaterno =
      typeof profile['apellido_materno'] === 'string' ? profile['apellido_materno'] : '';

    const fullName = [nombre, apellidoPaterno, apellidoMaterno].filter(Boolean).join(' ').trim();
    if (fullName) return fullName;

    const username = typeof profile['username'] === 'string' ? profile['username'] : '';
    const email = typeof profile['email'] === 'string' ? profile['email'] : '';
    return username || email || 'Estudiante';
  });

  notasQuery = injectQuery(() => 
    this.estudianteQueries.notas(this.estudianteId())
  );

  isLoading = computed(() => 
    this.profileQuery.isPending() || 
    (!!this.estudianteId() && this.notasQuery.isPending())
  );

  isError = computed(() => this.profileQuery.isError() || this.notasQuery.isError());
  error = computed(() => this.profileQuery.error() || this.notasQuery.error());

  tablaData = computed(() => {
    const notas = this.notasQuery.data() ?? [];
    return notas.map(n => {
      const evaluaciones = [n.notaEv1, n.notaEv2, n.notaEv3]
        .filter((valor): valor is number => typeof valor === 'number');
      
      let suma = 0;
      let cont = 0;
      for (const valor of evaluaciones) {
        suma += valor;
        cont++;
      }

      const promedioCalculado = cont > 0 ? Number((suma / cont).toFixed(1)) : null;

      return {
        asignatura: n.asignaturaNombre,
        docente: 'Sin informacion disponible',
        evaluaciones,
        promedio: promedioCalculado,
      };
    });
  });

  promedioGeneral = computed(() => {
    const promedios = this.tablaData()
      .map((fila) => fila.promedio)
      .filter((valor): valor is number => typeof valor === 'number');

    if (!promedios.length) return 'Sin informacion disponible';

    const total = promedios.reduce((acc, curr) => acc + curr, 0);
    return (total / promedios.length).toFixed(1);
  });

  materiasAprobadas = computed(() =>
    this.tablaData().filter((fila) => typeof fila.promedio === 'number' && fila.promedio >= 4).length,
  );

  materiasInsuficientes = computed(() =>
    this.tablaData().filter((fila) => typeof fila.promedio === 'number' && fila.promedio < 4).length,
  );

  asistenciaResumen = computed(() => 'Sin informacion disponible');
  tareasResumen = computed(() => 'Sin informacion disponible');
  cursoResumen = computed(() => 'Sin informacion disponible');
  rankingResumen = computed(() => 'Sin informacion disponible');

  volver(): void {
    this.router.navigate(['/estudiante']);
  }

  esNotaBaja(valor: number): boolean {
    return valor < 4;
  }
}
