export interface DocenteCurso {
  docente: string;
  asignaturaNombre: string;
  curso: string;
  anioAcademico: number;
  cursoId: number;
  asignaturaId: number;
  cadId: number;
}

export interface EstudianteCurso {
  cursoNombre: string;
  anioAcademico: number;
  asignatura: string;
  rut: string;
  estudianteFullName: string;
  docenteACargo: string;
  estudianteId: number;
  ev1?: string;
  ev1Id?: number;
  nota1?: number;
  nota1Id?: number;
  ev2?: string;
  ev2Id?: number;
  nota2?: number;
  nota2Id?: number;
  ev3?: string;
  ev3Id?: number;
  nota3?: number;
  nota3Id?: number;
  promedio?: number;
}

export interface NotaRespuesta {
  estudianteId: number;
  ev1?: string;
  ev1Id?: number;
  notaEv1?: number;
  nota1Id?: number;
  ev2?: string;
  ev2Id?: number;
  notaEv2?: number;
  nota2Id?: number;
  ev3?: string;
  ev3Id?: number;
  notaEv3?: number;
  nota3Id?: number;
  promedio?: number;
}

export interface NotaPost {
  notaId?: number;
  evaluacionId: number;
  estudianteId: number;
  valor: number;
}

export interface Evaluacion {
  evaluacionId?: number;
  cadId: number;
  nombre: string;
  fechaEvaluacion: string;
}
