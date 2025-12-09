import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { map } from 'rxjs/operators';

export interface Commune {
    nom: string;
    code: string;
    codeDepartement: string;
    codeRegion: string;
    codesPostaux: string[];
    population?: number;
}

export interface AddressSuggestion {
    label: string;
    name: string;
    type: string;
    postcode?: string;
    city?: string;
    context?: string;
    x?: number;
    y?: number;
}

@Injectable({
    providedIn: 'root'
})
export class GeoApiService {
    private readonly API_URL = 'https://geo.api.gouv.fr';
    private readonly API_ADRESSE_URL = 'https://api-adresse.data.gouv.fr';

    constructor(private http: HttpClient) { }

    /**
     * Récupère les communes par code postal
     * @param codePostal Code postal (5 caractères)
     * @returns Observable contenant la liste des communes
     */
    getCommunesByCodePostal(codePostal: string): Observable<Commune[]> {
        return this.http.get<Commune[]>(`${this.API_URL}/communes?codePostal=${codePostal}`);
    }

    /**
     * Recherche des communes par nom
     * @param nom Nom de la commune
     * @returns Observable contenant la liste des communes
     */
    searchCommunesByName(nom: string): Observable<Commune[]> {
        return this.http.get<Commune[]>(`${this.API_URL}/communes?nom=${nom}&limit=10`);
    }

    /**
     * Autocomplétion d'adresses via API Adresse (BAN)
     * @param query Chaîne tapée par l'utilisateur (ex: "17 rue Font")
     * @param opts Options facultatives (limite, filtre codePostal, filtre ville, type)
     * @returns Observable contenant une liste normalisée de suggestions
     * 
     * @example
     * // Recherche simple
     * getAddressSuggestions("17 rue de la fontaine")
     * 
     * @example
     * // Recherche avec filtres
     * getAddressSuggestions("rue fontaine", { 
     *   limit: 5, 
     *   postcode: "75016", 
     *   type: 'street' 
     * })
     */
    getAddressSuggestions(
        query: string,
        opts?: {
            limit?: number;
            postcode?: string;
            city?: string;
            type?: 'housenumber' | 'street' | 'locality' | 'municipality'
        }
    ): Observable<AddressSuggestion[]> {
        const params: Record<string, string> = {
            q: query,
            limit: String(opts?.limit ?? 8)
        };

        // Filtrage côté API
        if (opts?.postcode) params['postcode'] = opts.postcode;
        if (opts?.city) params['city'] = opts.city;
        if (opts?.type) params['type'] = opts.type;

        const qs = new URLSearchParams(params).toString();
        const url = `${this.API_ADRESSE_URL}/search/?${qs}`;

        return this.http.get<any>(url).pipe(
            map((res: any) => {
                const features = Array.isArray(res?.features) ? res.features : [];
                return features.map((f: any) => {
                    const p = f?.properties ?? {};
                    const coords = Array.isArray(f?.geometry?.coordinates) ? f.geometry.coordinates : [undefined, undefined];
                    const [x, y] = coords;

                    const suggestion: AddressSuggestion = {
                        label: p.label ?? p.name ?? query,
                        name: p.name ?? p.label ?? '',
                        type: p.type ?? 'street',
                        postcode: p.postcode,
                        city: p.city,
                        context: p.context,
                        x,
                        y
                    };
                    return suggestion;
                });
            })
        );
    }
}
