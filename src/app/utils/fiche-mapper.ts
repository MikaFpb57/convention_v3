import { ConventionData, CompteData, ContactsData, ContactData, FacturationData } from '../models/convention.interface';
import { Fiche, ConventionInfo } from '../models/convention.model';

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
        delaiPaiement: pick(f, 'delai_paie', 'delai_paiement', 'delaiPaiement'),
        modePaiement: pick(f, 'mode_paie', 'mode_paiement', 'modePaiement'),
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
        demat: info.fac_demat === '1' ? 1 : 0,
        mode_gest: info.mode_gest,
        email_demat: info.email_demat,
        email_demat_2: info.email_demat_2,
        adresseFacturation: info.adresse_fac_1,
        codePostalFacturation: info.code_postal_fac_1,
        villeFacturation: info.ville_fac_1,
        emailFacturation: info.email_demat,
        delaiPaiement: info.delai_reglement?.toString(),
        modePaiement: '',
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
        assureBdg: info.assure_bdg === '1' ? 1 : 0,
        recuperationTva: info.recup_tva === '1' ? 1 : 0,
        nb_vu_vl: info.nb_vu_vl ?? 0,
        nb_pl: info.nb_pl ?? 0,
        nb_bus: 0,
        nb_tp: info.nb_tp ?? 0,
        nb_agri: info.nb_agri ?? 0,
        nb_ca: 0
    };

    const procedures = {
        typePriseEnCharge: [],
        auDepartConducteur: [],
        surFacture: [],
        proceduresParticulieres: '',
        visiblePartenaire: true
    };

    const contacts: ContactsData = {
        commercial: {
            primary: {
                nom: info.commercial_nom ?? '',
                prenom: info.commercial_prenom ?? '',
                fonction: '',
                email: info.commercial_mail ?? '',
                telephone: info.commercial_tel ?? '',
                adresse: '',
                codePostal: '',
                ville: ''
            },
            backup: {
                nom: '',
                prenom: '',
                fonction: '',
                email: info.commercial_mail_2 ?? '',
                telephone: info.commercial_port ?? '',
                adresse: '',
                codePostal: '',
                ville: ''
            }
        },
        relance: {
            primary: {
                nom: info.relance_nom ?? '',
                prenom: info.relance_prenom ?? '',
                fonction: '',
                email: info.relance_mail ?? '',
                telephone: info.relance_tel ?? '',
                adresse: '',
                codePostal: '',
                ville: ''
            },
            backup: {
                nom: '',
                prenom: '',
                fonction: '',
                email: info.relance_mail_2 ?? '',
                telephone: info.relance_port ?? '',
                adresse: '',
                codePostal: '',
                ville: ''
            }
        },
        priseEnCharge: {
            primary: {
                nom: info.pec_nom ?? '',
                prenom: info.pec_prenom ?? '',
                fonction: '',
                email: info.pec_mail ?? '',
                telephone: info.pec_tel ?? '',
                adresse: '',
                codePostal: '',
                ville: ''
            },
            backup: {
                nom: '',
                prenom: '',
                fonction: '',
                email: info.pec_mail_2 ?? '',
                telephone: info.pec_port ?? '',
                adresse: '',
                codePostal: '',
                ville: ''
            }
        },
        comptabilite: {
            primary: {
                nom: info.compta_nom ?? '',
                prenom: info.compta_prenom ?? '',
                fonction: '',
                email: info.compta_mail ?? '',
                telephone: info.compta_tel ?? '',
                adresse: '',
                codePostal: '',
                ville: ''
            },
            backup: {
                nom: '',
                prenom: '',
                fonction: '',
                email: info.compta_mail_2 ?? '',
                telephone: info.compta_port ?? '',
                adresse: '',
                codePostal: '',
                ville: ''
            }
        }
    };

    return { compte, facturation, infos, procedures, contacts };
}
