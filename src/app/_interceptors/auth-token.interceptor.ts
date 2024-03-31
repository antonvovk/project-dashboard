import {HttpInterceptorFn} from '@angular/common/http';

export const authTokenInterceptor: HttpInterceptorFn = (req, next) => {
    const authToken = 'glpat-eNyp-eJMsZWPzfM9FZSy';
    const authReq = req.clone({
        setHeaders: {
            Authorization: `Bearer ${authToken}`
        }
    });
    return next(authReq);
};
