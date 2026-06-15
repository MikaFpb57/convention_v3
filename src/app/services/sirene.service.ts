import { Injectable, inject } from '@angular/core';
import { HttpClient, HttpHeaders } from '@angular/common/http';
import { Observable, map, catchError, of } from 'rxjs';
import { API_CONFIG } from '../config/api.config';

@Injectable({
    providedIn: 'root'
})
export class SireneService {
    private http = inject(HttpClient);
    private apiUrl = `${API_CONFIG.baseUrl}/webservices/siret`;

    getEtablissement(siret: string): Observable<any> {
        // Clean Siret: keep only digits
        const cleanSiret = siret.replace(/\D/g, '');

        if (cleanSiret.length !== 14) {
            return of({ error: 'Siret invalide (longueur incorrecte)' });
        }

        const headers = new HttpHeaders({
            'Authorization': `Bearer ${localStorage.getItem('token')}`
        });

        return this.http.get<any>(this.apiUrl, { params: { siret: cleanSiret }, headers }).pipe(
            map(response => {
                if (!response || response.error || response.api_error) {
                    return { error: response.api_error || response.error || 'Aucune donnée trouvée' };
                }
                return this.mapResponse(response, cleanSiret);
            }),
            catchError(error => {
                console.error('Erreur API Webservice', error);
                return of({ error: 'Erreur lors de la récupération des données' });
            })
        );
    }

    private mapResponse(data: any, originalSiret: string): any {
        return {
            siret: originalSiret, 
            tvaIntra: data.tva,
            nomSociete: data.societe,
            adresse: data.adresse,
            codePostal: data.code_postal,
            ville: data.ville,
            codeNaf: data.activite_principale,
            activitePrincipale: data.libelle_activite
        };
    }
}
