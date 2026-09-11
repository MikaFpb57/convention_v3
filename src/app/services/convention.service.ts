import { Injectable, signal, effect } from '@angular/core';
import { ConventionData, CompteData, ContactsData, FacturationData, InfosData, ProceduresData, SignatureData } from '../models/convention.interface';
import { ConventionService as ConventionApiService } from './convention';
import { FileUploadService } from './file-upload.service';

@Injectable({
    providedIn: 'root'
})
export class ConventionService {
    private conventionSignal = signal<ConventionData>({});
    private originalData = signal<ConventionData | null>(null);

    readonly convention = this.conventionSignal.asReadonly();
    readonly isEditMode = signal<boolean>(false);
    readonly isReadOnly = signal<boolean>(false);
    readonly etape = signal<string | null>(null);
    readonly currentId = signal<string | null>(null);
    readonly hasUnsavedChanges = signal<boolean>(false);

    // Stockage temporaire des IDs de fichiers à lier
    private tempFileIds: string[] = [];

    constructor(private apiService: ConventionApiService, private fileUploadService: FileUploadService) {
        // Keep draft state in memory only for new conventions.
        effect(() => {
            this.conventionSignal();

            // Check for unsaved changes
            this.checkForUnsavedChanges();
        });
    }

    private cloneData(data: ConventionData): ConventionData {
        return JSON.parse(JSON.stringify(data));
    }

    private updateConventionState(producer: (current: ConventionData) => ConventionData): void {
        this.conventionSignal.update(current => {
            return producer(current);
        });
    }

    // ✅ Save to Database
    saveToDatabase(id: string): Promise<void> {
        return new Promise((resolve, reject) => {
            const data = this.conventionSignal();
            const payload = this.mapToApiFormat(data);

            console.log('[ConventionService] Envoi au backend - ID:', id);
            console.log('[ConventionService] Payload JSON:', JSON.stringify(payload, null, 2));

            // D'abord, lier les fichiers temporaires si présents
            this.linkTempFilesToConvention(id).then(() => {
                // Ensuite sauvegarder la convention
                this.apiService.updateConvention(id, payload).subscribe({
                    next: () => {
                        console.log('[ConventionService] Sauvegarde réussie');
                        this.conventionSignal.set(this.cloneData(data));
                        this.originalData.set(this.cloneData(data));
                        this.hasUnsavedChanges.set(false);
                        this.clearTempFileIds(); // Nettoyer les IDs temporaires après sauvegarde
                        resolve();
                    },
                    error: (err) => {
                        console.error('[ConventionService] Erreur sauvegarde:', err);
                        reject(err);
                    }
                });
            }).catch(err => {
                console.error('[ConventionService] Erreur liaison fichiers:', err);
                // Continuer la sauvegarde même si la liaison échoue
                this.apiService.updateConvention(id, payload).subscribe({
                    next: () => {
                        console.log('[ConventionService] Sauvegarde réussie (sans liaison fichiers)');
                        this.conventionSignal.set(this.cloneData(data));
                        this.originalData.set(this.cloneData(data));
                        this.hasUnsavedChanges.set(false);
                        this.clearTempFileIds();
                        resolve();
                    },
                    error: (err) => {
                        console.error('[ConventionService] Erreur sauvegarde:', err);
                        reject(err);
                    }
                });
            });
        });
    }

    // Lier les fichiers temporaires à la convention
    private linkTempFilesToConvention(id: string): Promise<void> {
        return new Promise((resolve, reject) => {
            if (this.tempFileIds.length === 0) {
                resolve();
                return;
            }

            console.log('[ConventionService] Liaison des fichiers temporaires:', this.tempFileIds);

            this.fileUploadService.linkFilesToConvention(id, this.tempFileIds).subscribe({
                next: (response) => {
                    console.log('[ConventionService] Fichiers liés avec succès:', response);
                    resolve();
                },
                error: (err) => {
                    console.error('[ConventionService] Erreur liaison fichiers:', err);
                    reject(err);
                }
            });
        });
    }

    private mapToApiFormat(data: ConventionData): any {
        const compte: Partial<CompteData> = data.compte ?? {};
        const infos: Partial<InfosData> = data.infos ?? {};
        const facturation: Partial<FacturationData> = data.facturation ?? {};
        const procedures: Partial<ProceduresData> = data.procedures ?? {};

        // Map procedures arrays to individual fields
        const typePriseEnCharge = procedures.typePriseEnCharge || [];
        const auDepartConducteur = procedures.auDepartConducteur || [];
        const surFacture = procedures.surFacture || [];

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
                filiales: Number(compte.filiales) || 0,
                logo: compte.logo
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
                freq_transmission: facturation.freqTransmission,
                factva: 0,
                facttc: 0,
                facht: 0,
                facfran: 0
            },
            infos: data.infos ?? null,
            procedures: {
                tacite: typePriseEnCharge.includes(1) ? 1 : 0,
                bddimat: typePriseEnCharge.includes(2) ? 1 : 0,
                accordtel: typePriseEnCharge.includes(3) ? 1 : 0,
                accordmail: typePriseEnCharge.includes(4) ? 1 : 0,
                valdevis_0: typePriseEnCharge.includes(5) ? 1 : 0,
                valdevis_12: typePriseEnCharge.includes(6) ? 1 : 0,
                valdevis_24: typePriseEnCharge.includes(7) ? 1 : 0,
                valdevis_48: typePriseEnCharge.includes(8) ? 1 : 0,
                bdc_0: typePriseEnCharge.includes(9) ? 1 : 0,
                bdc_1: typePriseEnCharge.includes(10) ? 1 : 0,
                procassu: typePriseEnCharge.includes(11) ? 1 : 0,
                procloueur: typePriseEnCharge.includes(12) ? 1 : 0,
                dspc: auDepartConducteur.includes(1) ? 1 : 0,
                fac_depart: auDepartConducteur.includes(2) ? 1 : 0,
                accdspc: auDepartConducteur.includes(3) ? 1 : 0,
                accbc: auDepartConducteur.includes(4) ? 1 : 0,
                acccv: auDepartConducteur.includes(5) ? 1 : 0,
                acccg: auDepartConducteur.includes(6) ? 1 : 0,
                accjv: auDepartConducteur.includes(7) ? 1 : 0,
                ifnadh: surFacture.includes(1) ? 1 : 0,
                ifnbdc: surFacture.includes(2) ? 1 : 0,
                ifnoco: surFacture.includes(3) ? 1 : 0
            },
            notes: {
                note_fpb_html: procedures.proceduresParticulieres ?? '',
                affichage_obs: procedures.visiblePartenaire ? 1 : 0
            },
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

        this.conventionSignal.set(preview ?? {});
        this.originalData.set(this.cloneData(preview ?? {}));
        this.hasUnsavedChanges.set(false);
    }

    setEditMode(id: string, data: ConventionData, etape?: string) {
        this.isEditMode.set(true);
        this.currentId.set(id);
        this.etape.set(etape ?? null);
        this.isReadOnly.set(this.isConsultationEtape(etape));

        this.conventionSignal.set(data);
        this.originalData.set(this.cloneData(data));
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
        this.conventionSignal.set({});
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

    // Gestion des fichiers temporaires
    addTempFileId(tempId: string) {
        this.tempFileIds.push(tempId);
    }

    removeTempFileId(tempId: string) {
        this.tempFileIds = this.tempFileIds.filter(id => id !== tempId);
    }

    getTempFileIds(): string[] {
        return this.tempFileIds;
    }

    clearTempFileIds() {
        this.tempFileIds = [];
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
