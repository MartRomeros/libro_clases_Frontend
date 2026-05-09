import { Injectable, signal, inject } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Conversacion, Mensaje, Participante } from '../models/mensaje.model';
import { environment } from '../../../../environments/environment';
import { AuthStore } from '../../auth/data-access/auth.store';
import { map, forkJoin, tap, of, Observable } from 'rxjs';

interface BackendMensaje {
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
export class ComunicacionesService {
  private http = inject(HttpClient);
  private authStore = inject(AuthStore);
  private apiUrl = environment.msMensajeriaUrl;
  private backGestionUrl = environment.backGestionUrl;

  getTodosLosUsuarios(): Observable<any[]> {
    return this.http.get<any[]>(`${this.backGestionUrl}/usuarios`);
  }

  private conversaciones = signal<Conversacion[]>([]);
  private loading = signal<boolean>(false);

  getConversaciones() {
    return this.conversaciones.asReadonly();
  }

  getIsLoading() {
    return this.loading.asReadonly();
  }

  cargarMensajes() {
    const user = this.authStore.currentUser();
    if (!user || !user.email) return;

    this.loading.set(true);

    forkJoin({
      recibidos: this.http.get<{ ok: boolean, data: BackendMensaje[] }>(`${this.apiUrl}/recibidos/${user.email}`),
      enviados: this.http.get<{ ok: boolean, data: BackendMensaje[] }>(`${this.apiUrl}/enviados/${user.email}`)
    }).pipe(
      map(resp => {
        const todos = [...resp.recibidos.data, ...resp.enviados.data];
        return this.agruparEnConversaciones(todos, user.email);
      }),
      tap(convs => {
        this.conversaciones.set(convs);
        this.loading.set(false);
      })
    ).subscribe();
  }

  private agruparEnConversaciones(mensajes: BackendMensaje[], miEmail: string): Conversacion[] {
    const grupos: { [key: string]: BackendMensaje[] } = {};

    mensajes.forEach(m => {
      const otroEmail = m.quien_envia === miEmail ? m.quien_recibe : m.quien_envia;
      if (!grupos[otroEmail]) grupos[otroEmail] = [];
      grupos[otroEmail].push(m);
    });

    return Object.keys(grupos).map(email => {
      const msgs = grupos[email].sort((a, b) => new Date(a.fecha_hora).getTime() - new Date(b.fecha_hora).getTime());
      const ultimo = msgs[msgs.length - 1];

      return {
        id: email, // Usamos el email como ID de conversación para simplificar
        asunto: ultimo.asunto,
        ultimoMensaje: ultimo.cuerpo_mensaje,
        fechaUltimoMensaje: new Date(ultimo.fecha_hora),
        participantes: [{ id: email, nombre: email, rol: 'ADMIN' as any }], // Cast to avoid literal type mismatch
        mensajes: msgs.map(m => ({
          id: m.id,
          remitenteId: m.quien_envia,
          remitenteNombre: m.quien_envia,
          contenido: m.cuerpo_mensaje,
          fechaEnvio: new Date(m.fecha_hora),
          leido: m.leido,
          esMio: m.quien_envia === miEmail,
          adjuntos: m.id_archivo_adjunto ? [
            { 
              nombre: (m.id_archivo_adjunto.split(/[\\/]/).pop() || 'Archivo adjunto').replace(/^\d+-\d+-/, ''), 
              url: `${this.apiUrl}/descargar/${m.id}`, 
              tipo: 'file' 
            }
          ] : []
        })),
        sinLeerCount: msgs.filter(m => !m.leido && m.quien_recibe === miEmail).length,
        tieneAdjuntos: msgs.some(m => m.id_archivo_adjunto !== null)
      };
    }).sort((a, b) => b.fechaUltimoMensaje.getTime() - a.fechaUltimoMensaje.getTime());
  }

  getConversacionById(id: string) {
    return this.conversaciones().find(c => c.id === id);
  }

  enviarMensaje(quien_recibe: string, cuerpo: string, asunto: string = 'Sin asunto', archivo?: File, enviarCopiaEmail: boolean = false): Observable<any> {
    const user = this.authStore.currentUser();
    if (!user || !user.email) throw new Error('Usuario no autenticado');

    const formData = new FormData();
    formData.append('quien_envia', user.email);
    formData.append('quien_recibe', quien_recibe);
    formData.append('asunto', asunto);
    formData.append('cuerpo_mensaje', cuerpo);
    formData.append('enviar_copia_email', enviarCopiaEmail.toString());
    
    if (archivo) {
      formData.append('archivo', archivo);
    }

    return this.http.post<{ ok: boolean, data: BackendMensaje }>(this.apiUrl, formData).pipe(
      tap(() => this.cargarMensajes())
    );
  }

  marcarComoLeido(mensajeId: string) {
    return this.http.patch(`${this.apiUrl}/leido/${mensajeId}`, {}).pipe(
      tap(() => {
        // Actualizar estado localmente para evitar recarga completa
        this.conversaciones.update(current => {
          return current.map(c => ({
            ...c,
            mensajes: c.mensajes.map(m => m.id === mensajeId ? { ...m, leido: true } : m),
            sinLeerCount: c.sinLeerCount > 0 ? c.sinLeerCount - 1 : 0
          }));
        });
      })
    ).subscribe();
  }
}
