import { inject, Injectable } from '@angular/core';
import { 
  mutationOptions, 
  injectQueryClient 
} from '@tanstack/angular-query-experimental';
import { EvaluationsApi } from './evaluations.api';
import { evaluationsKeys } from './evaluations.keys';
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
      onSuccess: () => {
        // Invalidate notes queries to refresh the table
        this.queryClient.invalidateQueries({ 
          queryKey: evaluationsKeys.notas() 
        });
      },
    });
  }

  actualizarEvaluacion() {
    return mutationOptions({
      mutationFn: ({ id, evaluacion }: { id: number, evaluacion: Partial<Evaluacion> }) => 
        this.api.actualizarEvaluacion(id, evaluacion),
      onSuccess: () => {
        this.queryClient.invalidateQueries({ queryKey: evaluationsKeys.evaluaciones() });
        this.queryClient.invalidateQueries({ queryKey: evaluationsKeys.notas() });
      },
    });
  }

  eliminarEvaluacion() {
    return mutationOptions({
      mutationFn: (id: number) => this.api.eliminarEvaluacion(id),
      onSuccess: () => {
        this.queryClient.invalidateQueries({ queryKey: evaluationsKeys.evaluaciones() });
        this.queryClient.invalidateQueries({ queryKey: evaluationsKeys.notas() });
      },
    });
  }
}
