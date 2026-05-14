import { inject, Injectable } from '@angular/core';
import { queryOptions } from '@tanstack/angular-query-experimental';
import { ComunicacionesApi } from './comunicaciones.api';
import { comunicacionesKeys } from './comunicaciones.keys';
import { agruparEnConversaciones } from './comunicaciones.mapper';

@Injectable({
  providedIn: 'root'
})
export class ComunicacionesQueries {
  private readonly api = inject(ComunicacionesApi);

  conversaciones(email: string | undefined) {
    return queryOptions({
      queryKey: comunicacionesKeys.conversaciones(email || ''),
      enabled: !!email,
      queryFn: async () => {
        if (!email) {
          return [];
        }

        const [recibidos, enviados] = await Promise.all([
          this.api.getRecibidos(email),
          this.api.getEnviados(email),
        ]);

        return agruparEnConversaciones(
          [...recibidos.data, ...enviados.data],
          email,
          (mensajeId) => this.api.getDownloadUrl(mensajeId)
        );
      },
    });
  }

  usuarios() {
    return queryOptions({
      queryKey: comunicacionesKeys.usuarios(),
      queryFn: () => this.api.getTodosLosUsuarios(),
    });
  }
}
