import { inject } from '@angular/core';
import { Router, CanActivateFn } from '@angular/router';
import { AuthService } from '../services/auth.service';
import { map, take } from 'rxjs';

export const authGuard: CanActivateFn = () => {
  const authService = inject(AuthService);
  const router = inject(Router);

  if (authService.isAuthenticated()) {
    return true;
  }

  return authService.validateToken().pipe(
    take(1),
    map(isValid => {
      if (isValid) return true;
      router.navigate(['/login']);
      return false;
    })
  );
};
