/**
 * Interfaces y tipos compartidos para el flujo de pago WebPay.
 *
 * Requirements: 2.1, 2.2
 */

/** Datos del formulario de matrícula serializados en sessionStorage. */
export interface MatriculaFormData {
  nombreAlumno: string;
  apellidosAlumno: string;
  rutAlumno: string;
  curso: number; // cursoId
  nombreApoderado: string;
  rutApoderado: string;
}

/** Payload enviado al backend para registrar la matrícula tras el pago. */
export interface GrabarMatriculaPayload extends MatriculaFormData {
  token_ws: string;
}

/** Estados posibles del componente WebpayReturnComponent. */
export type ReturnState = 'loading' | 'success' | 'error' | 'cancelled';

/** Resumen de matrícula mostrado en el estado de éxito. */
export interface MatriculaResumen {
  nombreAlumno: string;
  apellidosAlumno: string;
  rutAlumno: string;
  cursoNombre: string;
}
