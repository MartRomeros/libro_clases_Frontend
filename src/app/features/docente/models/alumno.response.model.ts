export interface Alumno {
  estudiante_id: number;
  rut: string;
  nombre: string;
  apellido_paterno: string;
  apellido_materno: string;
  email: string;
  estadoAsistencia?: string | null; // Added for UI state
}

export interface AlumnosResponse {
  success: boolean;
  curso_id: number;
  data: Alumno[];
}