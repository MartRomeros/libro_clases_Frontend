export interface EstudiantePerfil {
  tipo: 'estudiante';
  curso?: CursoPerfil;
}

export interface DocentePerfil {
  tipo: 'docente';
  especialidad?: string;
}

interface ApoderadoPerfil {
  tipo: 'apoderado';
}

interface CursoPerfil {
  curso_id: number;
  nivel: string;
  letra: string;
  anio_academico: number;
}

interface Rol {
    rol_id: number,
    nombre: "Administrador" | "Alumno" | "Docente" | "Estudiante"
}

export interface User {
    usuario_id: number,
    rut: string,
    nombre: string,
    apellido_paterno: string,
    apellido_materno: string,
    email: string,
    activo: boolean,
    rol: Rol,
    datosEspecificos?: EstudiantePerfil | DocentePerfil | ApoderadoPerfil;
}