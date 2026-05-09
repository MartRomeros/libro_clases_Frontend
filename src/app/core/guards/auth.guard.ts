import { inject } from '@angular/core';
import { Router, CanActivateFn } from '@angular/router';
import { AuthStore } from '../../features/auth/data-access/auth.store';

export const authGuard: CanActivateFn = () => {
  
  const authStore = inject(AuthStore)
  const router = inject(Router);

  if (!authStore.accessToken()) {
    authStore.clearSession()
    router.navigate(['/login']);
    return false;
  }

  return true

};
