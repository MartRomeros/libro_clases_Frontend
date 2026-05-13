export interface AnotacionPayload {
  estudiante_id: number;
  tipo: 'positiva' | 'negativa' | 'informativa';
  descripcion: string;
}

