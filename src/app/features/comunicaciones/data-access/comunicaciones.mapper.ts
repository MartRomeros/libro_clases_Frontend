import { Conversacion } from '../models/mensaje.model';
import { BackendMensaje } from './comunicaciones.api';

export function agruparEnConversaciones(
  mensajes: BackendMensaje[],
  miEmail: string,
  getDownloadUrl: (mensajeId: string) => string
): Conversacion[] {
  const grupos: Record<string, BackendMensaje[]> = {};

  mensajes.forEach((mensaje) => {
    const otroEmail = mensaje.quien_envia === miEmail ? mensaje.quien_recibe : mensaje.quien_envia;
    if (!grupos[otroEmail]) {
      grupos[otroEmail] = [];
    }
    grupos[otroEmail].push(mensaje);
  });

  return Object.keys(grupos)
    .map((email) => {
      const mensajesOrdenados = grupos[email].sort(
        (a, b) => new Date(a.fecha_hora).getTime() - new Date(b.fecha_hora).getTime()
      );
      const ultimo = mensajesOrdenados[mensajesOrdenados.length - 1];

      return {
        id: email,
        asunto: ultimo.asunto,
        ultimoMensaje: ultimo.cuerpo_mensaje,
        fechaUltimoMensaje: new Date(ultimo.fecha_hora),
        participantes: [{ id: email, nombre: email, rol: 'ADMIN' as any }],
        mensajes: mensajesOrdenados.map((m) => ({
          id: m.id,
          remitenteId: m.quien_envia,
          remitenteNombre: m.quien_envia,
          contenido: m.cuerpo_mensaje,
          fechaEnvio: new Date(m.fecha_hora),
          leido: m.leido,
          esMio: m.quien_envia === miEmail,
          adjuntos: m.id_archivo_adjunto
            ? [
                {
                  nombre: (m.id_archivo_adjunto.split(/[\\/]/).pop() || 'Archivo adjunto').replace(/^\d+-\d+-/, ''),
                  url: getDownloadUrl(m.id),
                  tipo: 'file',
                },
              ]
            : [],
        })),
        sinLeerCount: mensajesOrdenados.filter((m) => !m.leido && m.quien_recibe === miEmail).length,
        tieneAdjuntos: mensajesOrdenados.some((m) => m.id_archivo_adjunto !== null),
      };
    })
    .sort((a, b) => b.fechaUltimoMensaje.getTime() - a.fechaUltimoMensaje.getTime());
}
