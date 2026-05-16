import { inject, Injectable } from '@angular/core';
import { queryOptions } from '@tanstack/angular-query-experimental';
import { DocenteDashboardApi } from './docente-dashboard.api';
import { docenteDashboardKeys } from './docente-dashboard.keys';

@Injectable({ providedIn: 'root' })
export class DocenteDashboardQueries {
  private readonly api = inject(DocenteDashboardApi);

  dashboard() {
    return queryOptions({
      queryKey: docenteDashboardKeys.dashboard(),
      queryFn: () => this.api.getDashboard(),
    });
  }
}
