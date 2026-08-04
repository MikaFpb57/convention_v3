import { Injectable, signal, effect } from '@angular/core';
import { ConventionData, CompteData, ContactsData, FacturationData, InfosData, ProceduresData, SignatureData } from '../models/convention.interface';
import { ConventionService as ConventionApiService } from './convention';

@Injectable({
    providedIn: 'root'
})
export class ConventionService {
    private readonly STORAGE_KEY = 'convention_data';
    private readonly EDIT_CACHE_PREFIX = 'convention_edit_cache_';
    private conventionSignal = signal<ConventionData>({});
    private originalData = signal<ConventionData | null>(null);

    readonly convention = this.conventionSignal.asReadonly();
    readonly isEditMode = signal<boolean>(false);
    readonly isReadOnly = signal<boolean>(false);
    readonly etape = signal<string | null>(null);
    readonly currentId = signal<string | null>(null);
    readonly hasUnsavedChanges = signal<boolean>(false);

    constructor(private apiService: ConventionApiService) {
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

            // Check for unsaved changes
            this.checkForUnsavedChanges();
        });
    }

    // ✅ Edit Cache Methods
    private getEditCacheKey(id: string): string {
        return `${this.EDIT_CACHE_PREFIX}${id}`;
    }

    saveEditCache(id: string, data: ConventionData): void {
        const cacheKey = this.getEditCacheKey(id);
        localStorage.setItem(cacheKey, JSON.stringify(data));
    }

    getEditCache(id: string): ConventionData | null {
        const cacheKey = this.getEditCacheKey(id);
        const cached = localStorage.getItem(cacheKey);
        if (cached) {
            try {
                return JSON.parse(cached);
            } catch (e) {
                console.error('Error parsing edit cache', e);
                return null;
            }
        }
        return null;
    }

    clearEditCache(id: string): void {
        const cacheKey = this.getEditCacheKey(id);
        localStorage.removeItem(cacheKey);
    }

    private cloneData(data: ConventionData): ConventionData {
        return JSON.parse(JSON.stringify(data));
    }

    private persistEditCacheIfNeeded(data: ConventionData): void {
        if (!this.isEditMode()) return;
        const id = this.currentId();
        if (!id) return;
        this.saveEditCache(id, data);
    }

    private updateConventionState(producer: (current: ConventionData) => ConventionData): void {
        this.conventionSignal.update(current => {
            const next = producer(current);
            this.persistEditCacheIfNeeded(next);
            return next;
        });
    }

    // ✅ Save to Database
    saveToDatabase(id: string): Promise<void> {
        return new Promise((resolve, reject) => {
            const cachedData = this.getEditCache(id);
            const data = cachedData ?? this.conventionSignal();
            const payload = this.mapToApiFormat(data);

            console.log('[ConventionService] Envoi au backend - ID:', id);
            console.log('[ConventionService] Payload JSON:', JSON.stringify(payload, null, 2));

            this.apiService.updateConvention(id, payload).subscribe({
                next: () => {
                    console.log('[ConventionService] Sauvegarde réussie');
                    this.clearEditCache(id);
                    this.conventionSignal.set(this.cloneData(data));
                    this.originalData.set(this.cloneData(data));
                    this.hasUnsavedChanges.set(false);
                    resolve();
                },
                error: (err) => {
                    console.error('[ConventionService] Erreur sauvegarde:', err);
                    reject(err);
                }
            });
        });
    }

    private mapToApiFormat(data: ConventionData): any {
        const compte: Partial<CompteData> = data.compte ?? {};
        const infos: Partial<InfosData> = data.infos ?? {};
        const facturation: Partial<FacturationData> = data.facturation ?? {};

        // Keep current fiches payload for backward compatibility while sending a full snapshot.
        return {
            fiches: [{
                ID: this.currentId(),
                siret: compte.siret,
                tva: compte.tvaIntra,
                entite: compte.nomSociete,
                adresse: compte.adresse,
                code_postal: compte.codePostal,
                ville: compte.ville,
                activite_principale: compte.codeNaf,
                libelle_activite: compte.activitePrincipale,
                rayon_action: compte.rayonAction,
                filiales: Number(compte.filiales) || 0
            }],
            compte: {
                recup_tva: infos.recuperationTva,
                assure_bdg: infos.assureBdg,
                nom_assurance: infos.assurance,
                nom_courtier: infos.courtier,
                nom_loueur: infos.loueur,
                tarif_fpb: infos.tarif,
                nb_vehicules_total: infos.nb_total,
                nb_vu_vl: infos.nb_vu_vl,
                nb_pl: infos.nb_pl,
                nb_tp: infos.nb_tp,
                nb_agri: infos.nb_agri
            },
            contacts: data.contacts ?? null,
            facturation: {
                fac_demat: facturation.demat,
                email_demat: facturation.email_demat,
                email_demat_2: facturation.email_demat_2,
                mode_gest: facturation.mode_gest,
                lib_adresse_fac_1: facturation.adresseFacturation,
                adresse_fac_1: facturation.adresseFacturation,
                code_postal_fac_1: facturation.codePostalFacturation,
                ville_fac_1: facturation.villeFacturation,
                delai_reglement: facturation.delaiReglement,
                freq_transmission: facturation.freqTransmission
            },
            infos: data.infos ?? null,
            procedures: data.procedures ?? null,
            notes: data.notes ?? null,
            cartes: data.cartes ?? null,
            files: data.files?.files ?? [],
            signature: data.signature ?? null
        };
    }

    // ✅ Check for unsaved changes
    private checkForUnsavedChanges(): void {
        if (!this.isEditMode() || this.isReadOnly()) {
            this.hasUnsavedChanges.set(false);
            return;
        }

        const current = this.conventionSignal();
        const original = this.originalData();

        if (!original) {
            this.hasUnsavedChanges.set(false);
            return;
        }

        const hasChanges = JSON.stringify(current) !== JSON.stringify(original);
        this.hasUnsavedChanges.set(hasChanges);
    }

    startEditMode(id: string, preview?: ConventionData, etape?: string) {
        this.isEditMode.set(true);
        this.currentId.set(id);
        this.etape.set(etape ?? null);
        this.isReadOnly.set(this.isConsultationEtape(etape));

        // Try to load from edit cache first
        const cached = this.getEditCache(id);
        if (cached) {
            this.conventionSignal.set(cached);
            this.originalData.set(this.cloneData(preview ?? cached));
        } else {
            this.conventionSignal.set(preview ?? {});
            this.originalData.set(this.cloneData(preview ?? {}));
        }
        this.hasUnsavedChanges.set(false);
    }

    setEditMode(id: string, data: ConventionData, etape?: string) {
        this.isEditMode.set(true);
        this.currentId.set(id);
        this.etape.set(etape ?? null);
        this.isReadOnly.set(this.isConsultationEtape(etape));

        // Try to load from edit cache first
        const cached = this.getEditCache(id);
        if (cached) {
            this.conventionSignal.set(cached);
            this.originalData.set(this.cloneData(data));
        } else {
            this.conventionSignal.set(data);
            this.originalData.set(this.cloneData(data));
        }
        this.hasUnsavedChanges.set(false);
    }

    isConsultationEtape(etape?: string | null): boolean {
        return etape === 'Signé' || etape === 'En attente';
    }

    resetNewMode() {
        this.isEditMode.set(false);
        this.isReadOnly.set(false);
        this.etape.set(null);
        this.currentId.set(null);
        this.originalData.set(null);
        this.hasUnsavedChanges.set(false);
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
        this.updateConventionState(current => ({
            ...current,
            compte: data
        }));
    }

    clearData() {
        this.conventionSignal.set({});
        localStorage.removeItem(this.STORAGE_KEY);
        this.hasUnsavedChanges.set(false);
    }

    getCompte(): CompteData | undefined {
        return this.conventionSignal().compte;
    }

    updateContacts(data: ContactsData) {
        if (!this.guardWrite()) return;
        this.updateConventionState(current => ({
            ...current,
            contacts: data
        }));
    }

    getContacts(): ContactsData | undefined {
        return this.conventionSignal().contacts;
    }

    updateFacturation(data: FacturationData) {
        if (!this.guardWrite()) return;
        this.updateConventionState(current => ({
            ...current,
            facturation: data
        }));
    }

    getFacturation(): FacturationData | undefined {
        return this.conventionSignal().facturation;
    }

    updateInfos(data: InfosData) {
        if (!this.guardWrite()) return;
        this.updateConventionState(current => ({
            ...current,
            infos: data
        }));
    }

    getInfos(): InfosData | undefined {
        return this.conventionSignal().infos;
    }

    updateProcedures(data: ProceduresData) {
        if (!this.guardWrite()) return;
        this.updateConventionState(current => ({
            ...current,
            procedures: data
        }));
    }

    getProcedures(): ProceduresData | undefined {
        return this.conventionSignal().procedures;
    }

    updateFiles(files: any[]) {
        if (!this.guardWrite()) return;
        this.updateConventionState(current => ({
            ...current,
            files: { files }
        }));
    }

    getFiles(): any[] | undefined {
        return this.conventionSignal().files?.files;
    }

    updateSignature(data: SignatureData) {
        if (!this.guardWrite()) return;
        this.updateConventionState(current => ({
            ...current,
            signature: data
        }));
    }

    discardPendingChanges(): void {
        if (!this.isEditMode()) return;
        const original = this.originalData();
        if (original) {
            this.conventionSignal.set(this.cloneData(original));
        }
        const id = this.currentId();
        if (id) {
            this.clearEditCache(id);
        }
        this.hasUnsavedChanges.set(false);
    }

    getSignature(): SignatureData | undefined {
        return this.conventionSignal().signature;
    }

    markAsSigned() {
        this.etape.set('Signé');
        this.isReadOnly.set(true);
    }
}
