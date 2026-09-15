import { ConventionData, CompteData, ContactsData, ContactData, FacturationData } from '../models/convention.interface';
import { Fiche, ConventionInfo } from '../models/convention.model';
import { AssurDto } from '../models/dto/assur.dto';
import { RemiseDto } from '../models/dto/remise.dto';
import { TarifResponseDto } from '../models/dto/tarifsresponse.dto';
import { TarifsSpecDto } from '../models/dto/tarifsspec.dto';
import { VehiculeTarifDto } from '../models/dto/vehiculetarif.dto';
import { Assur } from '../models/assur.interface';
import { Remise } from '../models/remise.interface';
import { TarifResponse } from '../models/tarifsresponse.interface';
import { TarifsSpec } from '../models/tarifsspec.interface';
import { VehiculeTarif } from '../models/vehiculetarif.interface';

type FicheRecord = Fiche & Record<string, unknown>;

function pick<T>(fiche: FicheRecord, ...keys: string[]): T | undefined {
    for (const key of keys) {
        const val = fiche[key];
        if (val !== undefined && val !== null && val !== '') {
            return val as T;
        }
    }
    return undefined;
}

function pickNumber(fiche: FicheRecord, ...keys: string[]): number | undefined {
    const val = pick<string | number>(fiche, ...keys);
    if (val === undefined) return undefined;
    const n = Number(val);
    return isNaN(n) ? undefined : n;
}

function parseIdArray(val: unknown): number[] {
    if (Array.isArray(val)) {
        return val.map(v => Number(v)).filter(n => !isNaN(n));
    }
    if (typeof val === 'string' && val.trim()) {
        try {
            const parsed = JSON.parse(val);
            if (Array.isArray(parsed)) {
                return parsed.map(v => Number(v)).filter(n => !isNaN(n));
            }
        } catch {
            return val.split(/[,;]/).map(s => Number(s.trim())).filter(n => !isNaN(n));
        }
    }
    return [];
}

function toFlag(val: unknown): 0 | 1 {
    if (val === null || val === undefined) return 0;
    if (typeof val === 'boolean') return val ? 1 : 0;
    if (typeof val === 'number') return val === 1 ? 1 : 0;
    if (typeof val === 'string') {
        const normalized = val.trim().toLowerCase();
        if (normalized === '1' || normalized === 'true' || normalized === 'oui') return 1;
        return 0;
    }
    return 0;
}

function idsFromFlagMap(flagMap: Array<[number, unknown]>): number[] {
    return flagMap.filter(([, value]) => toFlag(value) === 1).map(([id]) => id);
}

function mapContact(fiche: FicheRecord, prefix: string): ContactData {
    return {
        nom: pick(fiche, `${prefix}_nom`, `${prefix}nom`) ?? '',
        prenom: pick(fiche, `${prefix}_prenom`, `${prefix}prenom`) ?? '',
        fonction: pick(fiche, `${prefix}_fonction`, `${prefix}fonction`) ?? '',
        email: pick(fiche, `${prefix}_email`, `${prefix}email`) ?? '',
        telephone: pick(fiche, `${prefix}_tel`, `${prefix}_telephone`, `${prefix}tel`) ?? '',
        adresse: pick(fiche, `${prefix}_adresse`, `${prefix}adresse`) ?? '',
        codePostal: pick(fiche, `${prefix}_cp`, `${prefix}_code_postal`, `${prefix}cp`) ?? '',
        ville: pick(fiche, `${prefix}_ville`, `${prefix}ville`) ?? ''
    };
}

function mapContactPair(fiche: FicheRecord, prefix: string, backupPrefix?: string): { primary: ContactData; backup: ContactData } {
    const bkp = backupPrefix ?? `${prefix}_bkp`;
    return {
        primary: mapContact(fiche, prefix),
        backup: mapContact(fiche, bkp)
    };
}

export function isConsultationOnly(etape?: string | null): boolean {
    return etape === 'Signé' || etape === 'En attente';
}

export function mapFicheToConventionData(fiche: Fiche): ConventionData {
    const f = fiche as FicheRecord;

    const compte: CompteData = {
        siret: fiche.siret ?? '',
        tvaIntra: fiche.tva,
        nomSociete: fiche.entite,
        adresse: fiche.adresse,
        codePostal: fiche.code_postal,
        ville: fiche.ville,
        codeNaf: fiche.activite_principale,
        activitePrincipale: fiche.libelle_activite,
        rayonAction: fiche.rayon_action,
        filiales: fiche.filiales?.toString(),
        logo: pick(f, 'logo', 'logo_base64')
    };

    const facturation: FacturationData = {
        demat: pickNumber(f, 'demat') ?? 0,
        mode_gest: pick(f, 'mode_gest', 'mode_gestion'),
        email_demat: pick(f, 'email_demat', 'email_demat_1'),
        email_demat_2: pick(f, 'email_demat_2'),
        adresseFacturation: pick(f, 'adresse_facturation', 'adresse_fact'),
        codePostalFacturation: pick(f, 'code_postal_facturation', 'cp_facturation'),
        villeFacturation: pick(f, 'ville_facturation'),
        emailFacturation: pick(f, 'email_facturation', 'email_fact'),
        delaiReglement: pick(f, 'delai_reglement', 'delaiReglement'),
        freqTransmission: pick(f, 'freq_envoi', 'freq_transmission', 'freqTransmission')
    };

    const infos = {
        assurance: pick<string>(f, 'assurance', 'assurance_nom'),
        courtier: pick<string>(f, 'courtier', 'courtier_nom'),
        loueur: pick<string>(f, 'loueur', 'loueur_nom'),
        tarif: pick<string>(f, 'tarif', 'type_tarif'),
        capital: pick<string>(f, 'capital'),
        rcs: pick<string>(f, 'rcs'),
        assureBdg: pickNumber(f, 'assure_bdg', 'assureBdg') ?? 0,
        recuperationTva: pickNumber(f, 'recuperation_tva', 'recuperationTva') ?? 0,
        nb_vu_vl: pickNumber(f, 'nb_vu_vl') ?? 0,
        nb_pl: pickNumber(f, 'nb_pl') ?? 0,
        nb_bus: pickNumber(f, 'nb_bus') ?? 0,
        nb_tp: pickNumber(f, 'nb_tp') ?? 0,
        nb_agri: pickNumber(f, 'nb_agri') ?? 0,
        nb_ca: pickNumber(f, 'nb_ca') ?? 0
    };

    const procedures = {
        typePriseEnCharge: parseIdArray(pick(f, 'type_pec', 'type_prise_en_charge', 'typePriseEnCharge')),
        auDepartConducteur: parseIdArray(pick(f, 'au_depart_conducteur', 'auDepartConducteur')),
        surFacture: parseIdArray(pick(f, 'sur_facture', 'surFacture')),
        proceduresParticulieres: pick<string>(f, 'procedures_particulieres', 'proceduresParticulieres') ?? '',
        visiblePartenaire: Boolean(pick(f, 'visible_partenaire', 'visiblePartenaire'))
    };

    const contacts: ContactsData = {
        commercial: mapContactPair(f, 'cial', 'cial_bkp'),
        relance: mapContactPair(f, 'rel', 'rel_bkp'),
        priseEnCharge: mapContactPair(f, 'pec', 'pec_bkp'),
        comptabilite: mapContactPair(f, 'compta', 'compta_bkp')
    };

    return { compte, facturation, infos, procedures, contacts };
}

export function mapConventionInfoToConventionData(info: ConventionInfo): ConventionData {
    const compte: CompteData = {
        siret: info.siret ?? '',
        tvaIntra: info.tva,
        nomSociete: info.entite,
        adresse: info.adresse,
        codePostal: info.code_postal,
        ville: info.ville,
        codeNaf: info.activite_principale,
        activitePrincipale: info.libelle_activite,
        rayonAction: info.rayon_action,
        filiales: info.filiales?.toString(),
        logo: ''
    };

    const facturation: FacturationData = {
        demat: toFlag(info.fac_demat),
        mode_gest: info.mode_gest,
        email_demat: info.email_demat,
        email_demat_2: info.email_demat_2,
        adresseFacturation: info.adresse_fac_1,
        codePostalFacturation: info.code_postal_fac_1,
        villeFacturation: info.ville_fac_1,
        emailFacturation: info.email_demat,
        delaiReglement: info.delai_reglement?.toString(),
        freqTransmission: info.freq_transmission
    };

    const infos = {
        assurance: info.nom_assurance,
        courtier: info.nom_courtier,
        loueur: info.nom_loueur,
        tarif: info.tarif_fpb?.toString(),
        capital: '',
        rcs: '',
        assureBdg: toFlag(info.assure_bdg),
        recuperationTva: toFlag(info.recup_tva),
        nb_vu_vl: info.nb_vu_vl ?? 0,
        nb_pl: info.nb_pl ?? 0,
        nb_bus: 0,
        nb_tp: info.nb_tp ?? 0,
        nb_agri: info.nb_agri ?? 0,
        nb_ca: 0
    };

    const procedures = {
        typePriseEnCharge: idsFromFlagMap([
            [1, info.tacite],
            [2, info.bddimat],
            [3, info.accordtel],
            [4, info.accordmail],
            [5, info.valdevis_0],
            [6, info.valdevis_12],
            [7, info.valdevis_24]
        ]),
        auDepartConducteur: idsFromFlagMap([
            [1, info.dspc],
            [2, info.fac_depart],
            [3, info.accdspc],
            [4, info.accbc],
            [5, info.acccv],
            [6, info.acccg]
        ]),
        surFacture: idsFromFlagMap([
            [1, info.ifnadh],
            [2, info.ifnbdc],
            [3, info.ifnoco]
        ]),
        proceduresParticulieres: info.note_fpb_html ?? '',
        visiblePartenaire: toFlag(info.affichage_obs) === 1
    };

    const contacts: ContactsData = {
        commercial: {
            primary: {
                nom: info.commercial_nom ?? '',
                prenom: info.commercial_prenom ?? '',
                fonction: info.commercial_fonction ?? '',
                email: info.commercial_mail ?? '',
                telephone: info.commercial_tel ?? '',
                adresse: info.commercial_adresse ?? '',
                codePostal: info.commercial_code_postal ?? '',
                ville: info.commercial_ville ?? ''
            },
            backup: {
                nom: info.commercial_bkp_nom ?? '',
                prenom: info.commercial_bkp_prenom ?? '',
                fonction: info.commercial_bkp_fonction ?? '',
                email: info.commercial_bkp_mail ?? '',
                telephone: info.commercial_bkp_tel ?? '',
                adresse: info.commercial_bkp_adresse ?? '',
                codePostal: info.commercial_bkp_code_postal ?? '',
                ville: info.commercial_bkp_ville ?? ''
            }
        },
        relance: {
            primary: {
                nom: info.relance_nom ?? '',
                prenom: info.relance_prenom ?? '',
                fonction: info.relance_fonction ?? '',
                email: info.relance_mail ?? '',
                telephone: info.relance_tel ?? '',
                adresse: info.relance_adresse ?? '',
                codePostal: info.relance_code_postal ?? '',
                ville: info.relance_ville ?? ''
            },
            backup: {
                nom: info.relance_bkp_nom ?? '',
                prenom: info.relance_bkp_prenom ?? '',
                fonction: info.relance_bkp_fonction ?? '',
                email: info.relance_bkp_mail ?? '',
                telephone: info.relance_bkp_tel ?? '',
                adresse: info.relance_bkp_adresse ?? '',
                codePostal: info.relance_bkp_code_postal ?? '',
                ville: info.relance_bkp_ville ?? ''
            }
        },
        priseEnCharge: {
            primary: {
                nom: info.pec_nom ?? '',
                prenom: info.pec_prenom ?? '',
                fonction: info.pec_fonction ?? '',
                email: info.pec_mail ?? '',
                telephone: info.pec_tel ?? '',
                adresse: info.pec_adresse ?? '',
                codePostal: info.pec_code_postal ?? '',
                ville: info.pec_ville ?? ''
            },
            backup: {
                nom: info.pec_bkp_nom ?? '',
                prenom: info.pec_bkp_prenom ?? '',
                fonction: info.pec_bkp_fonction ?? '',
                email: info.pec_bkp_mail ?? '',
                telephone: info.pec_bkp_tel ?? '',
                adresse: info.pec_bkp_adresse ?? '',
                codePostal: info.pec_bkp_code_postal ?? '',
                ville: info.pec_bkp_ville ?? ''
            }
        },
        comptabilite: {
            primary: {
                nom: info.compta_nom ?? '',
                prenom: info.compta_prenom ?? '',
                fonction: info.compta_fonction ?? '',
                email: info.compta_mail ?? '',
                telephone: info.compta_tel ?? '',
                adresse: info.compta_adresse ?? '',
                codePostal: info.compta_code_postal ?? '',
                ville: info.compta_ville ?? ''
            },
            backup: {
                nom: info.compta_bkp_nom ?? '',
                prenom: info.compta_bkp_prenom ?? '',
                fonction: info.compta_bkp_fonction ?? '',
                email: info.compta_bkp_mail ?? '',
                telephone: info.compta_bkp_tel ?? '',
                adresse: info.compta_bkp_adresse ?? '',
                codePostal: info.compta_bkp_code_postal ?? '',
                ville: info.compta_bkp_ville ?? ''
            }
        }
    };

    const signatureImage = info.signtaure_partenaire ?? info.signature_partenaire ?? '';
    const signedAt = info.date_sign_part ?? '';
    const statut: 'draft' | 'pending_email' | 'verified' = signedAt
        ? 'verified'
        : (info.request_status === 'pending_email' ? 'pending_email' : 'draft');
    const signature = {
        nom: info.sign_partenaire_nom ?? '',
        prenom: info.sign_partenaire_prenom ?? '',
        fonction: info.sign_partenaire_fonction ?? '',
        emailSignataire: '',
        certifie: Boolean(signatureImage) || Boolean(signedAt),
        signatureImage,
        statut,
        requestSentAt: info.request_sent_at ?? '',
        expiresAt: info.request_expires_at ?? '',
        otpVerifiedAt: info.request_verified_at ?? '',
        signedAt
    };

    return { compte, facturation, infos, procedures, contacts, signature };
}

function mapAssur(dto: AssurDto): Assur {
    return {
        fongi: dto.fongi,
        recy: dto.recy,
        t1: dto.t1,
        t2: dto.t2,
        t3: dto.t3,
        dateMep: new Date(dto.date_mep)
    };
}

function mapRemise(dto: RemiseDto): Remise {
    return {
        type: dto.type_rem,
        id: dto.id_rem,
        libelle: dto.rm_libelle,
        pourcentage: dto.rm_rem,
        tarif: dto.rm_tar,
        tempsMO: dto.rm_tmo,
        libelleMO: dto.rm_tmo_lib,
        prix: dto.rm_prix,
        dateMaj: new Date(dto.date_maj),
        dateMep: new Date(dto.date_mep)
    };
}

function mapRemises(dto: { [key: string]: RemiseDto[] }): Record<string, Remise[]> {
    const result: Record<string, Remise[]> = {};

    Object.keys(dto).forEach((key) => {
        result[key] = dto[key].map(r => mapRemise(r));
    });

    return result;
}

function mapVehiculeTarif(dto: VehiculeTarifDto): VehiculeTarif {
    return {
        assur: mapAssur(dto.assur),
        remises: mapRemises(dto.remises)
    };
}

function mapTarifsSpec(dto: TarifsSpecDto): TarifsSpec {
    const result: TarifsSpec = {};

    Object.keys(dto).forEach((key) => {
        const vehiculeDto = dto[key];
        if (!vehiculeDto) {
            return;
        }
        result[key] = mapVehiculeTarif(vehiculeDto);
    });

    return result;
}

export function mapTarifResponse(dto: TarifResponseDto): TarifResponse {
    return {
        baseTarifs: {
            groupe: dto.base_tarifs.groupe,
            regionId: dto.base_tarifs.region_id,
            dateMaj: new Date(dto.base_tarifs.date_maj),
            dateMep: new Date(dto.base_tarifs.date_mep)
        },
        tarifsSpec: mapTarifsSpec(dto.tarifs_spec)
    };
}

