import { HttpErrorResponse } from '@angular/common/http';
import { AppError, AppErrorKind } from './app-error.model';

/**
 * Normaliza cualquier error a un objeto AppError consistente.
 */
export function toAppError(error: unknown): AppError {
  // 1. Si ya es un AppError, lo devolvemos tal cual
  if (isAppError(error)) {
    return error;
  }

  let kind: AppErrorKind = 'unknown';
  let status: number | undefined;
  let title = 'Error inesperado';
  let message = 'Ocurrió un error inesperado.';
  let detail: string | undefined;

  // 2. Si es HttpErrorResponse
  if (error instanceof HttpErrorResponse) {
    status = error.status;
    kind = mapStatusToKind(error.status);
    title = mapKindToTitle(kind);
    message = mapStatusToMessage(error.status);
    
    // Intentar extraer mensaje del backend
    const backendMessage = extractBackendMessage(error);
    if (backendMessage) {
      message = backendMessage;
    }

    detail = error.message;
  } 
  // 3. Si es un Error estándar
  else if (error instanceof Error) {
    message = error.message;
    detail = error.stack;
  }
  // 4. Si es un string
  else if (typeof error === 'string') {
    message = error;
  }
  // 5. Si es un objeto con propiedad message o error
  else if (error && typeof error === 'object') {
    const obj = error as any;
    message = obj.message || obj.error || message;
    
    if (obj.error && typeof obj.error === 'object') {
      message = obj.error.message || message;
    }
  }

  return {
    kind,
    status,
    title,
    message,
    detail,
    raw: error
  };
}

function isAppError(error: any): error is AppError {
  return error && typeof error === 'object' && 'kind' in error && 'title' in error && 'message' in error;
}

function mapStatusToKind(status: number): AppErrorKind {
  if (status === 0) return 'network';
  if (status === 401) return 'unauthorized';
  if (status === 403) return 'forbidden';
  if (status === 404) return 'not-found';
  if (status === 422) return 'validation';
  if (status >= 500) return 'server';
  return 'unknown';
}

function mapKindToTitle(kind: AppErrorKind): string {
  switch (kind) {
    case 'network': return 'Error de conexión';
    case 'unauthorized': return 'Sesión expirada';
    case 'forbidden': return 'Acceso denegado';
    case 'not-found': return 'No encontrado';
    case 'validation': return 'Datos inválidos';
    case 'server': return 'Error del servidor';
    default: return 'Error';
  }
}

function mapStatusToMessage(status: number): string {
  if (status === 0) return 'No se pudo conectar con el servidor.';
  if (status === 400) return 'La solicitud no es válida.';
  if (status === 401) return 'Tu sesión expiró. Vuelve a iniciar sesión.';
  if (status === 403) return 'No tienes permisos para realizar esta acción.';
  if (status === 404) return 'No se encontró la información solicitada.';
  if (status === 422) return 'Hay datos inválidos. Revisa el formulario.';
  if (status >= 500) return 'Ocurrió un error en el servidor. Intenta nuevamente.';
  return 'Ocurrió un error inesperado.';
}

function extractBackendMessage(error: HttpErrorResponse): string | null {
  if (!error.error) return null;

  if (typeof error.error === 'string') return error.error;
  
  if (typeof error.error === 'object') {
    if (error.error.message && typeof error.error.message === 'string') {
      return error.error.message;
    }
    if (error.error.error && typeof error.error.error === 'string') {
      return error.error.error;
    }
  }

  return null;
}
