export type AppErrorKind =
  | 'network'
  | 'unauthorized'
  | 'forbidden'
  | 'not-found'
  | 'validation'
  | 'server'
  | 'unknown';

export interface AppError {
  kind: AppErrorKind;
  status?: number;
  title: string;
  message: string;
  detail?: string;
  raw?: unknown;
}
