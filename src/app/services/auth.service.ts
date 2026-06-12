import { Injectable } from '@angular/core';
import { HttpClient, HttpHeaders } from '@angular/common/http';
import { Observable } from 'rxjs';
import { Router } from '@angular/router';
import { API_CONFIG } from '../config/api.config';

@Injectable({
  providedIn: 'root'
})
export class AuthService {

  private apiUrl = `${API_CONFIG.baseUrl}/login`;
  private userApiUrl = `${API_CONFIG.baseUrl}/users`;

  constructor(private http: HttpClient, private router: Router) { }

  login(username: string, password: string): Observable<any> {
    const headers = new HttpHeaders({ 'Content-Type': 'application/json' });
    return this.http.post(this.apiUrl, { username, password }, { headers });
  }

  changePassword(currentPassword: string, newPassword: string): Observable<any> {
    const headers = new HttpHeaders({ 'Content-Type': 'application/json' });
    return this.http.put(
      `${this.userApiUrl}/change-password`,
      { currentPassword, newPassword },
      { headers }
    );
  }

  // Méthode pour stocker le token et les infos utilisateur dans localStorage
  setToken(token: string, username: string, role?: string): void {
    localStorage.setItem('authToken', token);
    localStorage.setItem('username', username);
    if (role) {
      localStorage.setItem('userRole', role);
    }

    const payload = this.getTokenPayload(token);
    if (payload?.exp) {
      localStorage.setItem('authTokenExpiry', (payload.exp * 1000).toString());
    }
  }

  getTokenPayload(token: string): any | null {
    try {
      const payloadBase64 = token.split('.')[1];
      return JSON.parse(atob(payloadBase64));
    } catch {
      return null;
    }
  }

  getToken(): string | null {
    return localStorage.getItem('authToken');
  }

  getTokenExpiry(): number | null {
    const expiry = localStorage.getItem('authTokenExpiry');
    return expiry ? Number(expiry) : null;
  }

  getUsername(): string | null {
    return localStorage.getItem('username');
  }

  getUserRole(): string | null {
    return localStorage.getItem('userRole');
  }

  isTokenExpired(): boolean {
    const expiry = this.getTokenExpiry();
    return expiry !== null && Date.now() > expiry;
  }

  isLoggedIn(): boolean {
    const token = this.getToken();
    return !!token;
  }

  clearSession(): void {
    localStorage.removeItem('authToken');
    localStorage.removeItem('username');
    localStorage.removeItem('userRole');
    localStorage.removeItem('authTokenExpiry');
  }

  logout(): void {
    this.clearSession();
    this.router.navigate(['/login']);
  }

  logoutWithReason(reason: string): void {
    this.clearSession();
    this.router.navigate(['/login'], { queryParams: { reason } });
  }
}
