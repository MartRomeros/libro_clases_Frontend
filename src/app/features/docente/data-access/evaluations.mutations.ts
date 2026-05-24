import { inject, Injectable } from '@angular/core';
import { 
  mutationOptions, 
  injectQueryClient 
} from '@tanstack/angular-query-experimental';
import { EvaluationsApi } from './evaluations.api';
import { evaluationsKeys } from './evaluations.keys';
import { estudianteKeys } from '../../estudiante/data-access/estudiante.keys';
import { Evaluacion, NotaPost } from '../models/evaluations.model';

@Injectable({
  providedIn: 'root'
})
export class EvaluationsMutations {
  private readonly api = inject(EvaluationsApi);
  private readonly queryClient = injectQueryClient();

  crearEvaluacion() {
    return mutationOptions({
      mutationFn: (evaluacion: Evaluacion) => this.api.crearEvaluacion(evaluacion),
      onSuccess: (_, variables) => {
        // Invalidate specific evaluations for this CAD
        this.queryClient.invalidateQueries({ 
          queryKey: evaluationsKeys.evaluacionesByCad(variables.cadId) 
        });
        // Invalidate notes as they might change with new evaluations
        this.queryClient.invalidateQueries({ 
          queryKey: evaluationsKeys.notas() 
        });
      },
    });
  }

  guardarNotasBulk() {
    return mutationOptions({
      mutationFn: (notas: NotaPost[]) => this.api.guardarNotasBulk(notas),
      onSuccess: async (_, variables) => {
        const estudianteIds = Array.from(new Set(variables.map((nota) => nota.estudianteId)));

        // Invalidate notes queries to refresh the table
        await this.queryClient.invalidateQueries({ 
          queryKey: evaluationsKeys.notas() 
        });

        await Promise.all(
          estudianteIds.map((estudianteId) =>
            this.queryClient.invalidateQueries({
              queryKey: estudianteKeys.notas(estudianteId),
            }),
          ),
        );
      },
    });
  }
}
