export interface NotaEstudiante {
  asignaturaNombre: string;
  notaEv1?: number;
  notaEv2?: number;
  notaEv3?: number;
  promedio?: number;
}

export interface AttendanceItem {
  asignaturaNombre: string;
  clasesAsistidas: number;
  clasesAusentes: number;
}

export interface AttendanceResponse {
  success: boolean;
  data: AttendanceItem[];
}

export interface Recurso {
  id: number;
  asignatura: string;
  titulo: string;
  tipo: 'PDF' | 'DOCX' | 'PPTX' | 'VIDEO' | 'ENLACE';
  fechaSubida: string;
  tamano: string;
}
