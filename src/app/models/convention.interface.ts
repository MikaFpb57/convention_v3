export interface CompteData {
  siret: string;
  tvaIntra?: string;
  nomSociete: string;
  adresse: string;
  codePostal: string;
  ville: string;
  codeNaf?: string;
  activitePrincipale?: string;
  rayonAction?: string;
  filiales?: string;
  logo?: string;
}

export interface ContactData {
  nom: string;
  prenom: string;
  fonction: string;
  email: string;
  telephone: string;
  adresse: string;
  codePostal: string;
  ville: string;
}

export interface ContactPair {
  primary: ContactData;
  backup: ContactData;
}

export interface ContactsData {
  commercial: ContactPair;
  relance: ContactPair;
  priseEnCharge: ContactPair;
  comptabilite: ContactPair;
}

export interface FacturationData {
  demat?: number;
  mode_gest?: string;
  email_demat?: string;
  email_demat_2?: string;
  adresseFacturation?: string;
  codePostalFacturation?: string;
  villeFacturation?: string;
  emailFacturation?: string;
  delaiPaiement?: string;
  modePaiement?: string;
  delaiReglement?: string;
  freqTransmission?: string;
}

export interface InfosData {
  assurance?: string;
  courtier?: string;
  loueur?: string;
  tarif?: string;
  capital?: string;
  rcs?: string;
  assureBdg?: number;
  recuperationTva?: number;
  nb_vu_vl?: number;
  nb_pl?: number;
  nb_bus?: number;
  nb_tp?: number;
  nb_agri?: number;
  nb_ca?: number;
  nb_total?: number;
}

export interface ProceduresData {
  typePriseEnCharge?: number[];
  auDepartConducteur?: number[];
  surFacture?: number[];
  proceduresParticulieres?: string;
  visiblePartenaire?: boolean;
}

export interface ConventionData {
  compte?: CompteData;
  contacts?: ContactsData;
  facturation?: FacturationData;
  infos?: InfosData;
  procedures?: ProceduresData;
}
