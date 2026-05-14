import { inject } from '@angular/core';
import { ActivatedRouteSnapshot, CanActivateFn, Router } from '@angular/router';
import { AuthStore } from '../../features/auth/data-access/auth.store';
import { getHomeRouteForRole, isRoleAllowed } from '../utils/access-control';
import { NavigationHistoryService } from '../services/navigation-history.service';
import { AuthQueries } from '../../features/auth/data-access/auth.queries';
import { QueryClient } from '@tanstack/angular-query-experimental';
import { User } from '../../features/auth/models/profile.response.model';

export const authGuard: CanActivateFn = async (route: ActivatedRouteSnapshot) => {
  const authStore = inject(AuthStore);
  const router = inject(Router);
  const authQuery = inject(AuthQueries)
  const queryClient = inject(QueryClient);
  const navigationHistory = inject(NavigationHistoryService);

  const token = authStore.accessToken();
  const previousUrl = navigationHistory.getLastSuccessfulUrl();

  if (!token) {
    authStore.clearSession();
    return router.createUrlTree(['/no-access'], {
      queryParams: {
        returnUrl: previousUrl || '/auth/login',
      },
    });
  }

  const allowedRoles = route.data['roles'] as readonly string[] | undefined;
  let user: User;

  try {
    user = await queryClient.ensureQueryData(authQuery.me());
  } catch {
    authStore.clearSession();
    return router.createUrlTree(['/auth/login']);
  }

  if (allowedRoles && !isRoleAllowed(user?.rol?.nombre, allowedRoles)) {
    return router.createUrlTree(['/no-access'], {
      queryParams: {
        returnUrl: previousUrl || getHomeRouteForRole(user?.rol?.nombre) || '/auth/login',
      },
    });
  }

  return true;

};
