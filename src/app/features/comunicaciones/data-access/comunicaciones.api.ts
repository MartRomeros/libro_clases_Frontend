import { HttpClient } from '@angular/common/http';
import { inject, Injectable } from '@angular/core';
import { firstValueFrom } from 'rxjs';
import { environment } from '../../../../environments/environment';

export interface BackendMensaje {
  id: string;
  quien_envia: string;
  quien_recibe: string;
  asunto: string;
  cuerpo_mensaje: string;
  id_archivo_adjunto: string | null;
  leido: boolean;
  fecha_hora: string;
}

@Injectable({
  providedIn: 'root'
})
export class ComunicacionesApi {
  private readonly http = inject(HttpClient);
  private readonly bffMensajesUrl = environment.msMensajeriaUrl;
  private readonly bffUrl = environment.backGestionUrl;

  getTodosLosUsuarios() {
    return firstValueFrom(this.http.get<any[]>(`${this.bffUrl}/usuarios`));
  }

  getRecibidos(email: string) {
    return firstValueFrom(
      this.http.get<{ ok: boolean; data: BackendMensaje[] }>(`${this.bffMensajesUrl}/recibidos/${email}`)
    );
  }

  getEnviados(email: string) {
    return firstValueFrom(
      this.http.get<{ ok: boolean; data: BackendMensaje[] }>(`${this.bffMensajesUrl}/enviados/${email}`)
    );
  }

  enviarMensaje(formData: FormData) {
    return firstValueFrom(this.http.post<{ ok: boolean; data: BackendMensaje; mensaje?: string }>(this.bffMensajesUrl, formData));
  }

  marcarComoLeido(mensajeId: string) {
    return firstValueFrom(this.http.patch(`${this.bffMensajesUrl}/leido/${mensajeId}`, {}));
  }

  getDownloadUrl(mensajeId: string) {
    return `${this.bffMensajesUrl}/descargar/${mensajeId}`;
  }
}
