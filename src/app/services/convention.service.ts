import { Injectable, signal, effect } from '@angular/core';
import { ConventionData, CompteData } from '../models/convention.interface';

@Injectable({
    providedIn: 'root'
})
export class ConventionService {
    private readonly STORAGE_KEY = 'convention_data';
    private conventionSignal = signal<ConventionData>({});

    readonly convention = this.conventionSignal.asReadonly();

    constructor() {
        // Load from localStorage on init
        const savedData = localStorage.getItem(this.STORAGE_KEY);
        if (savedData) {
            try {
                this.conventionSignal.set(JSON.parse(savedData));
            } catch (e) {
                console.error('Error parsing saved convention data', e);
            }
        }

        // Save to localStorage on change
        effect(() => {
            const data = this.conventionSignal();
            localStorage.setItem(this.STORAGE_KEY, JSON.stringify(data));
        });
    }

    updateCompte(data: CompteData) {
        this.conventionSignal.update(current => ({
            ...current,
            compte: data
        }));
    }

    clearData() {
        this.conventionSignal.set({});
        localStorage.removeItem(this.STORAGE_KEY);
    }

    getCompte(): CompteData | undefined {
        return this.conventionSignal().compte;
    }
}
