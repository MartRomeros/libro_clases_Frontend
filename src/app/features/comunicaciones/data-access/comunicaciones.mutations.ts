import { inject, Injectable } from '@angular/core';
import { injectQueryClient, mutationOptions } from '@tanstack/angular-query-experimental';
import { ComunicacionesApi } from './comunicaciones.api';
import { comunicacionesKeys } from './comunicaciones.keys';

interface EnviarMensajePayload {
  quienEnvia: string;
  quienRecibe: string;
  asunto: string;
  cuerpo: string;
  archivo?: File;
  enviarCopiaEmail?: boolean;
<<<<<<< HEAD
  enviarCopiaTelegram?: boolean;
=======
>>>>>>> 88751cb27e7e5b77bc17ac9e727630ae5435510f
}

@Injectable({
  providedIn: 'root'
})
export class ComunicacionesMutations {
  private readonly api = inject(ComunicacionesApi);
  private readonly queryClient = injectQueryClient();

  enviarMensaje() {
    return mutationOptions({
      mutationFn: async (payload: EnviarMensajePayload) => {
        const formData = new FormData();
        formData.append('quien_envia', payload.quienEnvia);
        formData.append('quien_recibe', payload.quienRecibe);
        formData.append('asunto', payload.asunto || 'Sin asunto');
        formData.append('cuerpo_mensaje', payload.cuerpo);
        formData.append('enviar_copia_email', String(!!payload.enviarCopiaEmail));
<<<<<<< HEAD
        formData.append('enviar_copia_telegram', String(!!payload.enviarCopiaTelegram));
=======
>>>>>>> 88751cb27e7e5b77bc17ac9e727630ae5435510f

        if (payload.archivo) {
          formData.append('archivo', payload.archivo);
        }

        return this.api.enviarMensaje(formData);
      },
      onSuccess: (_data, variables) => {
        this.queryClient.invalidateQueries({ queryKey: comunicacionesKeys.conversaciones(variables.quienEnvia) });
      },
    });
  }

  marcarComoLeido(miEmail: string) {
    return mutationOptions({
      mutationFn: (mensajeId: string) => this.api.marcarComoLeido(mensajeId),
      onSuccess: () => {
        this.queryClient.invalidateQueries({ queryKey: comunicacionesKeys.conversaciones(miEmail) });
      },
    });
  }
}
