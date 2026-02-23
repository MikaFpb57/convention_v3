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
  adresseFacturation?: string;
  codePostalFacturation?: string;
  villeFacturation?: string;
  emailFacturation?: string;
  delaiPaiement?: string;
  modePaiement?: string;
}

export interface InfosData {
  effectif?: string;
  chiffreAffaires?: string;
  dateCreation?: string;
  formeJuridique?: string;
  capital?: string;
  rcs?: string;
}

export interface ProceduresData {
  procedureQualite?: boolean;
  certifications?: string;
  assurances?: string;
  documentUnique?: boolean;
}

export interface ConventionData {
  compte?: CompteData;
  contacts?: ContactsData;
  facturation?: FacturationData;
  infos?: InfosData;
  procedures?: ProceduresData;
}
