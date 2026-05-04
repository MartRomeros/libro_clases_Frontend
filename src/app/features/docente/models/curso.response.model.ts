export interface Course {
    curso_id: number;
    nivel: string;
    letra: string;
    anio_academico: number;
    asignatura_id: number;
    asignatura_nombre: string;
    asignatura_siglas: string;
    cad_id: number;
}

export interface CoursesResponse {
    success: boolean;
    docente_id: number;
    data: Course[];
}