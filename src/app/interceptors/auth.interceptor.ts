import { HttpErrorResponse, HttpHandlerFn, HttpRequest, HttpInterceptorFn, HttpEvent } from '@angular/common/http';
import { Observable, EMPTY, throwError } from 'rxjs';
import { catchError } from 'rxjs/operators';
import { inject } from '@angular/core';
import { AuthService } from '../services/auth.service';
import { Router } from '@angular/router';

export const authInterceptor: HttpInterceptorFn = (req: HttpRequest<unknown>, next: HttpHandlerFn): Observable<HttpEvent<unknown>> => {
  const authService = inject(AuthService);
  const router = inject(Router);

  const parseErrorBody = (payload: unknown): any => {
    if (!payload) {
      return null;
    }

    if (typeof payload === 'string') {
      try {
        return JSON.parse(payload);
      } catch {
        return payload;
      }
    }

    return payload;
  };

  const isAccountDisabledResponse = (error: HttpErrorResponse): boolean => {
    if (error.status !== 403) {
      return false;
    }

    const payload = parseErrorBody(error.error);

    if (!payload) {
      return false;
    }

    const code = typeof payload === 'string'
      ? payload
      : payload?.error || payload?.message || payload?.status;

    if (typeof code === 'string' && code.toLowerCase().includes('account_disabled')) {
      return true;
    }

    if (typeof code === 'string' && code.toLowerCase().includes('compte désactivé')) {
      return true;
    }

    return false;
  };

  const token = authService.getToken();
  const authReq = token ? req.clone({ setHeaders: { Authorization: `Bearer ${token}` } }) : req;

  return next(authReq).pipe(
    catchError((error: HttpErrorResponse) => {
      if (isAccountDisabledResponse(error)) {
        authService.logoutWithReason('account_disabled');
        return EMPTY;
      }

      if (error.status === 403 && !!token) {
        // Si le backend bloque un compte authentifié, on force la déconnexion.
        authService.logoutWithReason('account_disabled');
        return EMPTY;
      }

      if (error.status === 401) {
        if (token) {
          authService.logout();
          return EMPTY;
        }
        return throwError(() => error);
      }

      return throwError(() => error);
    })
  );
};
