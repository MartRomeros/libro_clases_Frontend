import { inject, Injectable } from "@angular/core";
import { AuthApi } from "./auth.api";
import { injectMutation } from "@tanstack/angular-query-experimental";
import { AuthStore } from "./auth.store";
import { Router } from "@angular/router";
import { LoginRequest } from "../models/login.request.model";

@Injectable({ providedIn: 'root' })
export class AuthMutations {

    private readonly authApi = inject(AuthApi)
    private readonly authStore = inject(AuthStore)
    private readonly router = inject(Router)

    login() {
        return injectMutation(() => ({
            mutationFn: (payload: LoginRequest) => this.authApi.login(payload),
            onSuccess: response => {
                this.authStore.setSession(response.token, response.profile)
                switch (response.profile.rol.nombre) {
                    case "Administrador":
                        this.router.navigate(["admin"])
                        break
                    case "Alumno":
                    case "Estudiante":
                        this.router.navigate(["estudiante"])
                        break
                    case "Docente":
                        this.router.navigate(["docente"])
                        break
                    default:
                        break
                }
            }

        }))
    }
}