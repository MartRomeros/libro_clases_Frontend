import { MatSnackBar, MatSnackBarConfig } from '@angular/material/snack-bar';
import { toAppError } from './error-normalizer';

/**
 * Muestra un snackbar con un error normalizado.
 * @param snackBar Instancia de MatSnackBar
 * @param error Error original (unknown)
 * @param options Opciones adicionales para MatSnackBar
 */
export function showErrorSnack(
  snackBar: MatSnackBar,
  error: unknown,
  options?: MatSnackBarConfig
): void {
  const appError = toAppError(error);
  
  const config: MatSnackBarConfig = {
    duration: 5000,
    horizontalPosition: 'end',
    verticalPosition: 'bottom',
    panelClass: ['error-snackbar'],
    ...options
  };

  snackBar.open(appError.message, 'Cerrar', config);
}
