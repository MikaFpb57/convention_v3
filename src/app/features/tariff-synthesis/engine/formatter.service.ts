import { Injectable } from '@angular/core';

@Injectable({
    providedIn: 'root'
})
export class FormatterService {

    format(resolved: any, format?: string): string {

        if (!resolved || (resolved.value === null && resolved.percent === null)) {
            return '-';
        }

        // ✅ CAS MIXTE (% + €)
        if (resolved.percent && resolved.value) {
            return `${this.formatPercent(resolved.percent)} / ${this.formatEuro(resolved.value)}`;
        }

        // ✅ POURCENTAGE SEUL
        if (resolved.percent) {
            return this.formatPercent(resolved.percent);
        }

        // ✅ EURO SEUL
        if (resolved.value !== null) {
            if (format === 'h') return this.formatHour(resolved.value);
            if (format === '%') return this.formatPercent(resolved.value);
            return this.formatEuro(resolved.value);
        }

        return '-';
    }

    formatEuro(value: number): string {
        return `${value.toFixed(2).replace('.', ',')} €`;
    }

    formatPercent(value: number): string {
        return `${value.toFixed(2).replace('.', ',')} %`;
    }

    formatHour(value: number): string {
        return `${value.toFixed(2).replace('.', ',')} h`;
    }
}