import { Injectable, inject } from '@angular/core';
import { HttpClient, HttpHeaders, HttpErrorResponse } from '@angular/common/http';
import { Observable, map, catchError, throwError } from 'rxjs';
import { CompteData } from '../models/convention.interface';

export interface EntrepriseSuggestion {
    siret: string;
    siren: string;
    label: string;
    subtitle: string;
    etablissement: EtablissementGov;
    nomEntreprise: string;
}

interface EtablissementGov {
    siret?: string;
    siren?: string;
    adresse?: string;
    geo_adresse?: string;
    code_postal?: string;
    libelle_commune?: string;
    commune?: string;
    activite_principale?: string;
    libelle_activite_principale?: string;
}

interface RechercheEntreprisesResponse {
    results?: RechercheEntrepriseResult[];
}

interface RechercheEntrepriseResult {
    siren?: string;
    nom_complet?: string;
    nom_raison_sociale?: string;
    siege?: EtablissementGov;
    matching_etablissements?: EtablissementGov[];
}

@Injectable({
    providedIn: 'root'
})
export class EntrepriseApiService {
    private http = inject(HttpClient);
    private readonly apiUrl = 'https://recherche-entreprises.api.gouv.fr/search';

    formatQuery(raw: string): string {
        return raw
            .replace(/[\x00-\x1F\x7F]/g, '')
            .trim()
            .replace(/\s+/g, ' ');
    }

    searchByName(query: string, codePostal?: string): Observable<EntrepriseSuggestion[]> {
        const formatted = this.formatQuery(query);
        if (formatted.length < 3) {
            return throwError(() => ({ type: 'validation', message: 'Saisissez au moins 3 caractères.' }));
        }

        const params: Record<string, string> = {
            q: formatted,
            per_page: '8',
            etat_administratif: 'A',
            limite_matching_etablissements: '10'
        };

        if (codePostal && /^\d{5}$/.test(codePostal)) {
            params['code_postal'] = codePostal;
        }

        const qs = new URLSearchParams(params).toString();
        const headers = new HttpHeaders({
            'User-Agent': 'ConventionV3/1.0 (France Pare-Brise; contact@franceparebrise.fr)'
        });

        return this.http.get<RechercheEntreprisesResponse>(`${this.apiUrl}?${qs}`, { headers }).pipe(
            map(response => this.mapResultsToSuggestions(response)),
            catchError((err: HttpErrorResponse) => {
                if (err.status === 429) {
                    return throwError(() => ({
                        type: 'rate_limit',
                        message: 'Trop de requêtes. Veuillez réessayer dans quelques instants.'
                    }));
                }
                return throwError(() => ({
                    type: 'http',
                    message: 'Erreur lors de la recherche d\'entreprises.'
                }));
            })
        );
    }

    mapEtablissementToCompte(etablissement: EtablissementGov, nomEntreprise: string): Partial<CompteData> {
        const siret = etablissement.siret ?? '';
        const siren = siret.substring(0, 9) || etablissement.siren || '';

        return {
            siret,
            nomSociete: nomEntreprise,
            adresse: etablissement.geo_adresse || etablissement.adresse || '',
            codePostal: etablissement.code_postal || '',
            ville: etablissement.libelle_commune || '',
            codeNaf: etablissement.activite_principale || '',
            activitePrincipale: etablissement.libelle_activite_principale || '',
            tvaIntra: siren ? this.computeTvaFromSiren(siren) : ''
        };
    }

    computeTvaFromSiren(siren: string): string {
        const sirenNum = parseInt(siren.replace(/\D/g, '').substring(0, 9), 10);
        if (isNaN(sirenNum) || String(sirenNum).length !== 9) {
            return '';
        }
        const key = (12 + 3 * (sirenNum % 97)) % 97;
        return `FR${String(key).padStart(2, '0')}${String(sirenNum).padStart(9, '0')}`;
    }

    private mapResultsToSuggestions(response: RechercheEntreprisesResponse): EntrepriseSuggestion[] {
        const results = response?.results ?? [];
        const suggestions: EntrepriseSuggestion[] = [];

        for (const result of results) {
            const nomEntreprise = result.nom_complet || result.nom_raison_sociale || '';
            const etablissements = this.getEtablissementsFromResult(result);

            for (const etab of etablissements) {
                if (!etab.siret) continue;

                const cp = etab.code_postal || '';
                const ville = etab.libelle_commune || '';
                const subtitleParts = [etab.siret];
                if (cp || ville) {
                    subtitleParts.push([cp, ville].filter(Boolean).join(' '));
                }

                suggestions.push({
                    siret: etab.siret,
                    siren: result.siren || etab.siret.substring(0, 9),
                    label: nomEntreprise,
                    subtitle: subtitleParts.join(' · '),
                    etablissement: etab,
                    nomEntreprise
                });
            }
        }

        return suggestions;
    }

    private getEtablissementsFromResult(result: RechercheEntrepriseResult): EtablissementGov[] {
        const matching = result.matching_etablissements?.filter(e => e.siret) ?? [];
        if (matching.length > 0) {
            return matching;
        }
        if (result.siege?.siret) {
            return [result.siege];
        }
        return [];
    }
}
