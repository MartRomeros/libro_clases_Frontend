import { HttpClient } from "@angular/common/http";
import { inject, Injectable } from "@angular/core";
import { environment } from "../../../../environments/environment";
import { LoginRequest } from "../models/login.request.model";
import { LoginResponse } from "../models/login.response.model";
import { firstValueFrom } from "rxjs";
import { User } from "../models/profile.response.model";

@Injectable({ providedIn: "root" })
export class AuthApi {
  private readonly http = inject(HttpClient);
  private readonly url = environment.apiGw;

  login(payload: LoginRequest): Promise<LoginResponse> {
    return firstValueFrom(this.http.post<LoginResponse>(`${this.url}/api/auth/login`, payload));
  }

  me(): Promise<User> {
    return firstValueFrom(this.http.get<User>(`${this.url}/api/auth/profile`));
  }
}
