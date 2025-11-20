import { Injectable } from '@angular/core';
import { HttpClient, HttpParams } from '@angular/common/http';
import { Observable } from 'rxjs';
import { ConventionData } from '../models/convention.model';

@Injectable({
  providedIn: 'root'
})
export class ConventionService {
  private readonly API_URL = 'https://extranet.franceparebrise.fr/assur_online/conv';
  private readonly CRYPTED_TOKEN = 'bFZkb0hDK0JtNWFMQ1pvL1k5OHNUZmFURVk2Y05BUXBYTldLdVJ0V0pCaDUxdlNueThtQXlERTJSMWg0VjZCdkFqMUZ4cGh3SXhSQ1U3dWhFVTBEMDRnSW5JQ1FoaURJNTMzUmdyT1IzY009';

  constructor(private http: HttpClient) { }

  /**
   * Récupère toutes les conventions
   */
  getAllConventions(): Observable<ConventionData> {
    const params = new HttpParams()
      .set('crypted', this.CRYPTED_TOKEN);

    return this.http.get<ConventionData>(`${this.API_URL}/all`, { params });
  }

  /**
   * Récupère une convention par son ID
   * @param id ID de la convention
   */
  getConventionById(id: string): Observable<ConventionData> {
    const params = new HttpParams()
      .set('crypted', this.CRYPTED_TOKEN)
      .set('id', id);

    return this.http.get<ConventionData>(`${this.API_URL}/get`, { params });
  }

  /**
   * Met à jour une convention
   * @param id ID de la convention
   * @param data Données à mettre à jour
   */
  updateConvention(id: string, data: Partial<ConventionData>): Observable<ConventionData> {
    const params = new HttpParams()
      .set('crypted', this.CRYPTED_TOKEN)
      .set('id', id);

    return this.http.put<ConventionData>(`${this.API_URL}/update`, data, { params });
  }

  /**
   * Supprime une convention
   * @param id ID de la convention à supprimer
   */
  deleteConvention(id: string): Observable<void> {
    const params = new HttpParams()
      .set('crypted', this.CRYPTED_TOKEN)
      .set('id', id);

    return this.http.delete<void>(`${this.API_URL}/delete`, { params });
  }
}
