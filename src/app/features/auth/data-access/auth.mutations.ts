import { inject, Injectable } from "@angular/core";
import { AuthApi } from "./auth.api";
import { injectMutation } from "@tanstack/angular-query-experimental";
import { AuthStore } from "./auth.store";
import { Router } from "@angular/router";
import { LoginRequest } from "../models/login.request.model";
import { MatSnackBar } from "@angular/material/snack-bar";
import { getHomeRouteForRole } from "../../../core/utils/access-control";
import { QueryClient } from "@tanstack/angular-query-experimental";
import { authKeys } from "./auth.keys";
import { showErrorSnack } from "../../../shared/http/error-snackbar";

@Injectable({ providedIn: 'root' })
export class AuthMutations {

    private readonly authApi = inject(AuthApi)
    private readonly authStore = inject(AuthStore)
    private readonly queryClient = inject(QueryClient)
    private readonly router = inject(Router)
    private readonly snackbar = inject(MatSnackBar)

    login() {
        return injectMutation(() => ({
            mutationFn: (payload: LoginRequest) => this.authApi.login(payload),
            onSuccess: response => {
                this.snackbar.open("Bienvenido ", "Cerrar", { duration: 3000 })
                this.authStore.setSession(response.token)
                this.queryClient.setQueryData(authKeys.me(), response.profile)
                this.router.navigateByUrl(getHomeRouteForRole(response.profile.rol.nombre))
            },
            onError: (error) => {
                showErrorSnack(this.snackbar, error);
            },

        }))
    }
}
