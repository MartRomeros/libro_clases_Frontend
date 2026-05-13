export interface AnotacionItemResponse {
  anotacion_id?: number;
  estudiante_id?: number;
  estudiante_nombre?: string;
  nombre_estudiante?: string;
  tipo: string;
  descripcion: string;
  fecha?: string;
  created_at?: string;
}

export interface AnotacionesResponse {
  success: boolean;
  message?: string;
  data: AnotacionItemResponse[];
}

