import { Injectable } from '@angular/core';
import { HttpClient, HttpParams } from '@angular/common/http';
import { Observable } from 'rxjs';
import { ConventionApiResponse, ConventionDetail } from '../models/convention.model';
import { API_CONFIG } from '../config/api.config';

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
  private readonly API_URL = `${API_CONFIG.baseUrl}/conv`;

  constructor(private http: HttpClient) { }

  /**
   * Récupère toutes les conventions
   */
  getAllConventions(): Observable<ConventionApiResponse> {
    return this.http.get<ConventionApiResponse>(`${this.API_URL}/all`);
  }

  /**
   * Récupère une convention par son ID
   * @param id ID de la convention
   */
  getConventionById(id: string): Observable<ConventionDetail> {
    return this.http.get<ConventionDetail>(`${this.API_URL}/${id}`);
  }

  /**
   * Met à jour une convention
   * @param id ID de la convention
   * @param data Données à mettre à jour
   */
  updateConvention(id: string, data: any): Observable<ConventionApiResponse> {
    const params = new HttpParams().set('id', id);
    return this.http.put<ConventionApiResponse>(`${this.API_URL}/update`, data, { params });
  }

  /**
   * Supprime une convention
   * @param id ID de la convention à supprimer
   */
  deleteConvention(id: string): Observable<void> {
    const params = new HttpParams().set('id', id);
    return this.http.delete<void>(`${this.API_URL}/delete`, { params });
  }

  /**
   * Récupère les entités par type de compte
   * @param typeCpt Type de compte (Flotte, Assurance, Courtier, Apporteur d'affaire, Loueur)
   * @returns Observable contenant la liste des entités du type demandé
   */
  getListeByType(typeCpt: TypeCompte): Observable<EntitesResponse> {
    const params = new HttpParams().set('type_cpt', typeCpt);
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
    const params = new HttpParams().set('type', type);
    return this.http.get<MatrixResponse>(`${this.API_URL}/tools/types_matrix`, { params });
  }

  /**
   * Récupère les fichiers d'une convention
   * @param id ID de la convention
   */
  getConventionFiles(id: string): Observable<any> {
    return this.http.get(`${this.API_URL}/${id}/files`);
  }

  /**
   * Récupère l'URL d'un fichier spécifique
   * @param id ID de la convention
   * @param filename Nom du fichier
   */
  getFileUrl(id: string, filename: string): string {
    return `${this.API_URL}/${id}/files/${filename}`;
  }

  /**
   * Télécharge un fichier via HTTP et retourne un Blob
   * @param id ID de la convention
   * @param filename Nom du fichier
   */
  downloadFile(id: string, filename: string): Observable<Blob> {
    return this.http.get(`${this.API_URL}/${id}/files/${filename}`, {
      responseType: 'blob'
    });
  }
}
