import { Injectable, signal, effect } from '@angular/core';
import { ConventionData, CompteData, ContactsData, FacturationData, InfosData, ProceduresData, SignatureData } from '../models/convention.interface';

@Injectable({
    providedIn: 'root'
})
export class ConventionService {
    private readonly STORAGE_KEY = 'convention_data';
    private conventionSignal = signal<ConventionData>({});

    readonly convention = this.conventionSignal.asReadonly();
    readonly isEditMode = signal<boolean>(false);
    readonly isReadOnly = signal<boolean>(false);
    readonly etape = signal<string | null>(null);
    readonly currentId = signal<string | null>(null);

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

        // Save to localStorage on change (only if not in edit mode)
        effect(() => {
            const data = this.conventionSignal();
            if (!this.isEditMode()) {
                localStorage.setItem(this.STORAGE_KEY, JSON.stringify(data));
            }
        });
    }

    startEditMode(id: string, preview?: ConventionData, etape?: string) {
        this.isEditMode.set(true);
        this.currentId.set(id);
        this.etape.set(etape ?? null);
        this.isReadOnly.set(this.isConsultationEtape(etape));
        this.conventionSignal.set(preview ?? {});
    }

    setEditMode(id: string, data: ConventionData, etape?: string) {
        this.isEditMode.set(true);
        this.currentId.set(id);
        this.etape.set(etape ?? null);
        this.isReadOnly.set(this.isConsultationEtape(etape));
        this.conventionSignal.set(data);
    }

    isConsultationEtape(etape?: string | null): boolean {
        return etape === 'Signé' || etape === 'En attente';
    }

    resetNewMode() {
        this.isEditMode.set(false);
        this.isReadOnly.set(false);
        this.etape.set(null);
        this.currentId.set(null);
        // Reload from localStorage
        const savedData = localStorage.getItem(this.STORAGE_KEY);
        if (savedData) {
            this.conventionSignal.set(JSON.parse(savedData));
        } else {
            this.conventionSignal.set({});
        }
    }

    private guardWrite(): boolean {
        return !this.isReadOnly();
    }

    updateCompte(data: CompteData) {
        if (!this.guardWrite()) return;
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
        if (!this.guardWrite()) return;
        this.conventionSignal.update(current => ({
            ...current,
            contacts: data
        }));
    }

    getContacts(): ContactsData | undefined {
        return this.conventionSignal().contacts;
    }

    updateFacturation(data: FacturationData) {
        if (!this.guardWrite()) return;
        this.conventionSignal.update(current => ({
            ...current,
            facturation: data
        }));
    }

    getFacturation(): FacturationData | undefined {
        return this.conventionSignal().facturation;
    }

    updateInfos(data: InfosData) {
        if (!this.guardWrite()) return;
        this.conventionSignal.update(current => ({
            ...current,
            infos: data
        }));
    }

    getInfos(): InfosData | undefined {
        return this.conventionSignal().infos;
    }

    updateProcedures(data: ProceduresData) {
        if (!this.guardWrite()) return;
        this.conventionSignal.update(current => ({
            ...current,
            procedures: data
        }));
    }

    getProcedures(): ProceduresData | undefined {
        return this.conventionSignal().procedures;
    }

    updateFiles(files: any[]) {
        if (!this.guardWrite()) return;
        this.conventionSignal.update(current => ({
            ...current,
            files: { files }
        }));
    }

    getFiles(): any[] | undefined {
        return this.conventionSignal().files?.files;
    }

    updateSignature(data: SignatureData) {
        if (!this.guardWrite()) return;
        this.conventionSignal.update(current => ({
            ...current,
            signature: data
        }));
    }

    getSignature(): SignatureData | undefined {
        return this.conventionSignal().signature;
    }

    markAsSigned() {
        this.etape.set('Signé');
        this.isReadOnly.set(true);
    }
}
