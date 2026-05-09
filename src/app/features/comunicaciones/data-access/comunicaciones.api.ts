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
  private readonly msMensajeriaUrl = environment.msMensajeriaUrl;
  private readonly backGestionUrl = environment.backGestionUrl;

  getTodosLosUsuarios() {
    return firstValueFrom(this.http.get<any[]>(`${this.backGestionUrl}/usuarios`));
  }

  getRecibidos(email: string) {
    return firstValueFrom(
      this.http.get<{ ok: boolean; data: BackendMensaje[] }>(`${this.msMensajeriaUrl}/recibidos/${email}`)
    );
  }

  getEnviados(email: string) {
    return firstValueFrom(
      this.http.get<{ ok: boolean; data: BackendMensaje[] }>(`${this.msMensajeriaUrl}/enviados/${email}`)
    );
  }

  enviarMensaje(formData: FormData) {
    return firstValueFrom(this.http.post<{ ok: boolean; data: BackendMensaje; mensaje?: string }>(this.msMensajeriaUrl, formData));
  }

  marcarComoLeido(mensajeId: string) {
    return firstValueFrom(this.http.patch(`${this.msMensajeriaUrl}/leido/${mensajeId}`, {}));
  }

  getDownloadUrl(mensajeId: string) {
    return `${this.msMensajeriaUrl}/descargar/${mensajeId}`;
  }
}
