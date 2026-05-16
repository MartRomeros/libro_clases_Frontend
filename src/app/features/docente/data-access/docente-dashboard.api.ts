import { inject, Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { firstValueFrom } from 'rxjs';
import { environment } from '../../../../environments/environment';
import { DocenteDashboardResponse } from '../models/docente-dashboard.model';

@Injectable({ providedIn: 'root' })
export class DocenteDashboardApi {
  private readonly http = inject(HttpClient);
  private readonly apiUrl = environment.backGestionUrl;

  getDashboard() {
    return firstValueFrom(
      this.http.get<DocenteDashboardResponse>(`${this.apiUrl}/teachers/me/dashboard`)
    );
  }
}
