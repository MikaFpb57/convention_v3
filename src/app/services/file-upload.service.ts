import { Injectable, inject } from '@angular/core';
import { HttpClient, HttpHeaders } from '@angular/common/http';
import { Observable } from 'rxjs';
import { API_CONFIG } from '../config/api.config';

export interface TempFileResponse {
  tempId: string;
  sessionId: string;
  originalName: string;
  fileSize: number;
  mimeType: string;
  expiresAt: string;
}

@Injectable({
  providedIn: 'root'
})
export class FileUploadService {
  private http = inject(HttpClient);
  private baseUrl = `${API_CONFIG.baseUrl}/files`;

  private generateSessionId(): string {
    return sessionStorage.getItem('convention_session_id') || this.createSessionId();
  }

  private createSessionId(): string {
    const sessionId = `session_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
    sessionStorage.setItem('convention_session_id', sessionId);
    return sessionId;
  }

  uploadTempFile(file: File): Observable<TempFileResponse> {
    const formData = new FormData();
    formData.append('file', file);
    formData.append('sessionId', this.generateSessionId());

    const headers = new HttpHeaders({
      'Authorization': `Bearer ${localStorage.getItem('token')}`
    });

    return this.http.post<TempFileResponse>(`${this.baseUrl}/upload-temp`, formData, { headers });
  }

  linkFilesToConvention(conventionId: string, tempIds: string[]): Observable<any> {
    const headers = new HttpHeaders({
      'Authorization': `Bearer ${localStorage.getItem('token')}`,
      'Content-Type': 'application/json'
    });

    return this.http.post(`${this.baseUrl}/conv/${conventionId}/files/link`, { tempIds }, { headers });
  }

  downloadTempFile(tempId: string): Observable<Blob> {
    const headers = new HttpHeaders({
      'Authorization': `Bearer ${localStorage.getItem('token')}`
    });

    return this.http.get(`${this.baseUrl}/temp/${tempId}`, { 
      headers,
      responseType: 'blob'
    });
  }

  cleanupTempFiles(): Observable<any> {
    const headers = new HttpHeaders({
      'Authorization': `Bearer ${localStorage.getItem('token')}`
    });

    return this.http.delete(`${this.baseUrl}/cleanup-temp`, { headers });
  }
}