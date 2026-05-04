export interface AsistenciaDetalle {
    estudiante_id: number;
    estado: string;
    tipo_asistencia: string;
}

export interface AsistenciaPayload {
    cad_id: number;
    fecha: string;
    asistencias: AsistenciaDetalle[];
}