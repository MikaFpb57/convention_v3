import { Injectable } from '@angular/core';
import { HttpClient, HttpParams } from '@angular/common/http';
import { Observable } from 'rxjs';
import { ConventionData } from '../models/convention.model';

export type TypeCompte = 'Flotte' | 'Assurance' | 'Courtier' | 'Apporteur d\'affaire' | 'Loueur';

export interface Entite {
  as_num: string;
  as_nom: string;
  groupe: string;
}

export interface EntitesResponse {
  type_cpt: TypeCompte;
  total: number;
  entites: Entite[];
}

export type TypeMatrix = 'delaipaie' | 'freq_envoi' | 'gestion_fa' | 'lieu_paie' | 'mode_pec' | 'type_relance' | 'mode_paie';

export interface MatrixValue {
  id_type: number;
  libelle_type: string;
}

export interface MatrixResponse {
  type: TypeMatrix;
  total: number;
  values: MatrixValue[];
}

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

  /**
   * Récupère les entités par type de compte
   * @param typeCpt Type de compte (Flotte, Assurance, Courtier, Apporteur d'affaire, Loueur)
   * @returns Observable contenant la liste des entités du type demandé
   */
  getListeByType(typeCpt: TypeCompte): Observable<EntitesResponse> {
    const params = new HttpParams()
      .set('crypted', this.CRYPTED_TOKEN)
      .set('type_cpt', typeCpt);

    return this.http.get<EntitesResponse>(`${this.API_URL}/tools/entites_types`, { params });
  }

  /**
   * Récupère les listes de valeurs typées (matrix)
   * @param type Type de liste (delaipaie, freq_envoi, gestion_fa, lieu_paie, mode_pec, type_relance, mode_paie)
   * @returns Observable contenant la liste des valeurs du type demandé
   * 
   * @example
   * // Récupérer les modes de paiement
   * getListeMatrix('mode_paie').subscribe(response => {
   *   console.log(response.values);
   *   // [{ id_type: 1, libelle_type: "Virement" }, ...]
   * });
   */
  getListeMatrix(type: TypeMatrix): Observable<MatrixResponse> {
    const params = new HttpParams()
      .set('crypted', this.CRYPTED_TOKEN)
      .set('type', type);

    return this.http.get<MatrixResponse>(`${this.API_URL}/tools/types_matrix`, { params });
  }
}
