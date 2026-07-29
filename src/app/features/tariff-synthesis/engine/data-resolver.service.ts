import { Injectable } from '@angular/core';

import { SourceConfig } from '../models/source-config.model';
import { TarificationContext } from '../models/context.model';
import { TarifResponse } from '../../../models/tarifsresponse.interface';

@Injectable({
    providedIn: 'root'
})
export class DataResolverService {

    resolve(source: SourceConfig, data: TarifResponse, context: TarificationContext) {
        if (!source) return this.empty();

        switch (source.type) {

            case 'tarif':
                return this.resolveTarif(source.key!, data, context);

            case 'remise':
                return this.resolveRemise(source, data, context);

            case 'static':
                return {
                    value: source.fallback ?? null,
                    percent: null,
                    text: source.fallback ?? '-',
                    tmo: null
                };

            default:
                return this.empty();
        }
    }

    // -----------------------
    // TARIF SIMPLE
    // -----------------------

    private resolveTarif(key: string, data: TarifResponse, context: TarificationContext) {
        const vehicle = context.vehicle;

        // const value = data.tarifsSpec?.[vehicle]?.assur?.[key];
        const value = null;

        if (value === undefined || value === null) {
            return this.empty();
        }

        return {
            value,
            percent: null,
            text: '',
            tmo: null
        };
    }

    // -----------------------
    // REMISE (LOGIQUE TWIG)
    // -----------------------

    private resolveRemise(source: SourceConfig, data: TarifResponse, context: TarificationContext) {

        const vehicle = context.vehicle;

        const remises =
            data.tarifsSpec?.[vehicle ?? ""]?.remises?.[source.remType || ''] ?? [];

        const match = remises.find((r: any) => r.type_rem === source.key);

        if (!match) return this.empty();

        const percent = match.pourcentage ?? null;
        const price = match.prix ?? null;

        return {
            value: price,
            percent: percent,
            text: '',
            tmo: match.tempsMO ?? null
        };
    }

    private empty() {
        return {
            value: null,
            percent: null,
            text: '-',
            tmo: null
        };
    }
}