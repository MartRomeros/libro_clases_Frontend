export interface Usuario {
  usuarioId?: number;
  rolId: number;
  rut: string;
  nombre: string;
  apellidoPaterno: string;
  apellidoMaterno: string;
  email: string;
  password?: string;
  activo: boolean;
}

export interface Docente {
  docenteId: number;
  usuario?: Usuario;
}

export interface Estudiante {
  estudianteId: number;
  cursoId: number;
  usuario?: Usuario;
}

export interface Evaluacion {
  evaluacionId?: number;
  cadId: number;
  nombre: string;
  fechaEvaluacion: string;
}

export interface AttendanceByStudent {
  asignaturaNombre: string;
  clasesAsistidas: number;
  clasesAusentes: number;
}

export interface Curso {
  cursoId: number;
  nivel: string;
  letra: string;
  anioAcademico: number;
}

export interface Asignatura {
  asignaturaId: number;
  nombre: string;
}

export interface CAD {
  cadId: number;
  curso: string;
  asignaturaNombre: string;
  docente: string;
}
