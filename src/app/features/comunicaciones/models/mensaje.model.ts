export interface Participante {
  id: string;
  nombre: string;
  rol: 'DOCENTE' | 'ESTUDIANTE' | 'APODERADO' | 'ADMIN';
  avatarUrl?: string;
}

export interface Mensaje {
  id: string;
  remitenteId: string;
  remitenteNombre: string;
  contenido: string;
  fechaEnvio: Date;
  leido: boolean;
  esMio: boolean;
  adjuntos?: { nombre: string, url: string, tipo: string }[];
}

export interface Conversacion {
  id: string;
  asunto: string;
  ultimoMensaje?: string;
  fechaUltimoMensaje: Date;
  participantes: Participante[];
  mensajes: Mensaje[];
  sinLeerCount: number;
  tieneAdjuntos?: boolean;
}
