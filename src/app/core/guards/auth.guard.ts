import { inject, computed } from '@angular/core';
import { Router, CanActivateFn } from '@angular/router';
import { AuthService } from '../services/auth.service';
import { toObservable } from '@angular/core/rxjs-interop';
import { filter, map, take } from 'rxjs';

export const authGuard: CanActivateFn = () => {
  const authService = inject(AuthService);
  const router = inject(Router);

  // If no token, go to login
  if (!authService.token()) {
    router.navigate(['/login']);
    return false;
  }

  // Use the validateTokenQuery status
  const query = authService.validateTokenQuery;

  return toObservable(computed(() => ({
    isLoading: query.isLoading(),
    isValid: query.data()
  }))).pipe(
    filter(state => !state.isLoading),
    take(1),
    map(state => {
      if (state.isValid) return true;
      router.navigate(['/login']);
      return false;
    })
  );
};
