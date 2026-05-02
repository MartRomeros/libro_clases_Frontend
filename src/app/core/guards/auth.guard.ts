import { inject } from '@angular/core';
import { Router, CanActivateFn } from '@angular/router';
import { AuthService } from '../services/auth.service';
import { injectQuery } from '@tanstack/angular-query-experimental';
import { toObservable } from '@angular/core/rxjs-interop';
import { filter, map, take } from 'rxjs';

export const authGuard: CanActivateFn = () => {
  const authService = inject(AuthService);
  const router = inject(Router);

  if (!authService.token()) {
    router.navigate(['/login']);
    return false;
  }

  const query = injectQuery(() => authService.validateTokenOptions());

  return toObservable(query.isLoading).pipe(
    filter(isLoading => !isLoading),
    take(1),
    map(() => {
      if (query.data()) return true;
      router.navigate(['/login']);
      return false;
    })
  );
};
