import { inject, Injectable } from "@angular/core";
import { AuthApi } from "./auth.api";
import { injectQuery, queryOptions } from "@tanstack/angular-query-experimental";
import { authKeys } from "./auth.keys";

@Injectable({ providedIn: 'root' })
export class AuthQueries {

    private readonly authApi = inject(AuthApi)

    me() {
        return queryOptions({
            queryKey:authKeys.me(),
            queryFn:()=> this.authApi.me(),
            retry:false
        })
    }
}