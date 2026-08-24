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

  recupTva?: number;

  assureBdg?: number;

  nomAssurance?: string;

  nomCourtier?: string;

  nomLoueur?: string;

  tarifFpb?: string;

  nbVehiculesTotal?: number;

  nbVuVl?: number;

  nbPl?: number;

  nbTp?: number;

  nbAgri?: number;

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



export interface FilesData {

  files: any[];

}



export interface SignatureData {

  nom: string;

  prenom: string;

  fonction: string;

  emailSignataire: string;

  certifie: boolean;

  signatureImage?: string;

  mode?: 'remote-email-otp';

  statut?: 'draft' | 'pending_email' | 'verified';

  signatureRequestId?: string;

  requestSentAt?: string;

  expiresAt?: string;

  otpVerifiedAt?: string;

  signedAt?: string;

}



export interface ConventionData {

  compte?: CompteData;

  contacts?: ContactsData;

  facturation?: FacturationData;

  infos?: InfosData;

  procedures?: ProceduresData;

  files?: FilesData;

  signature?: SignatureData;

  notes?: NotesData;

  cartes?: CartesData;

}



export interface NotesData {

  note_fpb_html?: string;

  affichage_obs?: number;

}



export interface CartesData {

  cartes_flotte?: number;

  logo_cartes?: number;

  qte_cartes?: number;

  cartes_nom?: string;

  cartes_prenom?: string;

  cartes_adr?: string;

  cartes_cp?: string;

  cartes_ville?: string;

}

