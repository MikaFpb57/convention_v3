import { Injectable } from '@angular/core';
import { HttpEvent, HttpHandler, HttpInterceptor, HttpRequest, HttpErrorResponse } from '@angular/common/http';
import { Observable, EMPTY, throwError } from 'rxjs';
import { catchError } from 'rxjs/operators';
import { AuthService } from '../services/auth.service';

@Injectable()
export class AuthInterceptor implements HttpInterceptor {
  constructor(private authService: AuthService) {}

  private parseErrorBody(payload: unknown): any {
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
  }

  private isAccountDisabledResponse(error: HttpErrorResponse): boolean {
    if (error.status !== 403) {
      return false;
    }

    const payload = this.parseErrorBody(error.error);

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
  }

  intercept(req: HttpRequest<any>, next: HttpHandler): Observable<HttpEvent<any>> {
    const token = this.authService.getToken();
    const authReq = token ? req.clone({ setHeaders: { Authorization: `Bearer ${token}` } }) : req;

    return next.handle(authReq).pipe(
      catchError((error: HttpErrorResponse) => {
        if (this.isAccountDisabledResponse(error)) {
          this.authService.logoutWithReason('account_disabled');
          return EMPTY;
        }

        if (error.status === 403 && !!token) {
          // Si le backend bloque un compte authentifié, on force la déconnexion.
          this.authService.logoutWithReason('account_disabled');
          return EMPTY;
        }

        if (error.status === 401) {
          if (token) {
            this.authService.logout();
            return EMPTY;
          }
          return throwError(() => error);
        }

        return throwError(() => error);
      })
    );
  }
}
