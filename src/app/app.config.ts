import {ApplicationConfig} from '@angular/core';

import {provideHttpClient, withInterceptors} from '@angular/common/http';
import {authTokenInterceptor} from "./_interceptors/auth-token.interceptor";

export const appConfig: ApplicationConfig = {
    providers: [
        provideHttpClient(withInterceptors([authTokenInterceptor]))
    ],
};
