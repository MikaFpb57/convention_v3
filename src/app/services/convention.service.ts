import { Injectable, signal, effect } from '@angular/core';
import { ConventionData, CompteData, ContactsData, FacturationData, InfosData, ProceduresData } from '../models/convention.interface';

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

    updateContacts(data: ContactsData) {
        this.conventionSignal.update(current => ({
            ...current,
            contacts: data
        }));
    }

    getContacts(): ContactsData | undefined {
        return this.conventionSignal().contacts;
    }

    updateFacturation(data: FacturationData) {
        this.conventionSignal.update(current => ({
            ...current,
            facturation: data
        }));
    }

    getFacturation(): FacturationData | undefined {
        return this.conventionSignal().facturation;
    }

    updateInfos(data: InfosData) {
        this.conventionSignal.update(current => ({
            ...current,
            infos: data
        }));
    }

    getInfos(): InfosData | undefined {
        return this.conventionSignal().infos;
    }

    updateProcedures(data: ProceduresData) {
        this.conventionSignal.update(current => ({
            ...current,
            procedures: data
        }));
    }

    getProcedures(): ProceduresData | undefined {
        return this.conventionSignal().procedures;
    }
}
