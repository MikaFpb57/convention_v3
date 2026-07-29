import { HttpClient } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { Observable } from 'rxjs';
import { TarifResponseDto } from '../models/dto/tarifsresponse.dto';
import { API_CONFIG } from '../config/api.config';

@Injectable({
    providedIn: 'root'
})
export class AssurService {

    private readonly API_URL = `${API_CONFIG.baseUrl}/assur`;
    private readonly regionId = 1;

    constructor(private readonly http: HttpClient) { }

    getTarifs(groupe: string | undefined): Observable<TarifResponseDto> {
        if (!groupe) return {} as Observable<TarifResponseDto>;
        return this.http.get<TarifResponseDto>(`${this.API_URL}/assur_data/${groupe}/${this.regionId}`);
    }
}