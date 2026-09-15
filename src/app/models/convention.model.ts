export interface ConventionApiResponse {
  utilisateur: string;
  siege: boolean;
  total: number;
  fiches: Fiche[];
}

export interface Fiche {
  [key: string]: unknown;
  ID: string;
  entite: string;
  adresse: string;
  code_postal: string;
  ville: string;
  code_commune: string;
  code_departement: string;
  code_region: string;
  departement: string;
  region: string;
  siret: string;
  tva: string;
  siret_verif: string;
  statut_etb: string;
  activite_principale: string;
  libelle_activite: string;
  rayon_action: string;
  filiales: number;
  date_creation: string;
  date_update: string;
  createur: string;
  etape: string;
  libelle_etape: string;
  traite: number;
  signature_status?: 'draft' | 'pending_email' | 'verified' | 'expired';
  signature_sent_at?: string;
  signature_expires_at?: string;
}

export interface ConventionDetail {
  Informations: ConventionInfo[];
}

export interface ContactRow {
  convention_id: string;
  convention_nom: string;
  type: string;
  role: string;
  nom: string;
  prenom: string;
  fonction: string;
  telephone: string;
  email: string;
}

export interface ContactsApiResponse {
  utilisateur: string;
  siege: boolean;
  total: number;
  contacts: ContactRow[];
}

export interface ConventionDocumentsSummary {
  id: string;
  nom: string;
  count: number;
}

export interface DocumentsApiResponse {
  utilisateur: string;
  siege: boolean;
  total: number;
  documents: ConventionDocumentsSummary[];
}

export interface ConventionFile {
  name: string;
  size: number;
  updatedAt: string;
  url: string;
}

export interface ConventionInfo {
  siret: string;
  entite: string;
  adresse: string;
  code_postal: string;
  ville: string;
  tva: string;
  siret_verif: string;
  statut_etb: string;
  activite_principale: string;
  libelle_activite: string;
  rayon_action: string;
  filiales: number;
  date_creation: string;
  date_update: string;
  createur: string;
  etape: string;
  libelle_etape: string;
  traite: number;
  recup_tva: string;
  assure_bdg: string;
  nom_assurance: string;
  nom_courtier: string;
  nom_loueur: string;
  tarif_fpb: number;
  nb_vehicules_total: number;
  nb_vu_vl: number;
  nb_pl: number;
  nb_tp: number;
  nb_agri: number;
  fac_demat: string;
  email_demat: string;
  email_demat_2: string;
  mode_gest: string;
  lib_adresse_fac_1: string;
  adresse_fac_1: string;
  code_postal_fac_1: string;
  ville_fac_1: string;
  lib_adresse_fac_2: string;
  adresse_fac_2: string;
  code_postal_fac_2: string;
  ville_fac_2: string;
  delai_reglement: string;
  freq_transmission: string;
  factva: string;
  facttc: string;
  facht: string;
  facfran: string;
  tacite: string;
  bddimat: string;
  accordtel: string;
  accordmail: string;
  valdevis_0: string;
  valdevis_12: string;
  valdevis_24: string;
  valdevis_48: string;
  bdc_0: string;
  bdc_1: string;
  procassu: string;
  procloueur: string;
  dspc: string;
  fac_depart: string;
  accdspc: string;
  accbc: string;
  acccv: string;
  acccg: string;
  accjv: string;
  ifnadh: string;
  ifnbdc: string;
  ifnoco: string;
  note_fpb_html: string;
  affichage_obs: string;
  commercial_nom: string;
  commercial_prenom: string;
  commercial_fonction: string;
  commercial_tel: string;
  commercial_mail: string;
  commercial_adresse: string;
  commercial_code_postal: string;
  commercial_ville: string;
  commercial_bkp_nom: string;
  commercial_bkp_prenom: string;
  commercial_bkp_fonction: string;
  commercial_bkp_tel: string;
  commercial_bkp_mail: string;
  commercial_bkp_adresse: string;
  commercial_bkp_code_postal: string;
  commercial_bkp_ville: string;
  relance_nom: string;
  relance_prenom: string;
  relance_fonction: string;
  relance_tel: string;
  relance_mail: string;
  relance_adresse: string;
  relance_code_postal: string;
  relance_ville: string;
  relance_bkp_nom: string;
  relance_bkp_prenom: string;
  relance_bkp_fonction: string;
  relance_bkp_tel: string;
  relance_bkp_mail: string;
  relance_bkp_adresse: string;
  relance_bkp_code_postal: string;
  relance_bkp_ville: string;
  pec_nom: string;
  pec_prenom: string;
  pec_fonction: string;
  pec_tel: string;
  pec_mail: string;
  pec_adresse: string;
  pec_code_postal: string;
  pec_ville: string;
  pec_bkp_nom: string;
  pec_bkp_prenom: string;
  pec_bkp_fonction: string;
  pec_bkp_tel: string;
  pec_bkp_mail: string;
  pec_bkp_adresse: string;
  pec_bkp_code_postal: string;
  pec_bkp_ville: string;
  compta_nom: string;
  compta_prenom: string;
  compta_fonction: string;
  compta_tel: string;
  compta_mail: string;
  compta_adresse: string;
  compta_code_postal: string;
  compta_ville: string;
  compta_bkp_nom: string;
  compta_bkp_prenom: string;
  compta_bkp_fonction: string;
  compta_bkp_tel: string;
  compta_bkp_mail: string;
  compta_bkp_adresse: string;
  compta_bkp_code_postal: string;
  compta_bkp_ville: string;
  cartes_flotte: string;
  logo_cartes: string;
  qte_cartes: number;
  cartes_nom: string;
  cartes_prenom: string;
  cartes_adr: string;
  cartes_cp: string;
  cartes_ville: string;
  signtaure_partenaire?: string;
  signature_partenaire?: string;
  sign_partenaire_nom?: string;
  sign_partenaire_prenom?: string;
  sign_partenaire_fonction?: string;
  date_sign_part?: string;
  sign_fpb_nom?: string;
  sign_fpb_prenom?: string;
  sign_fpb_fonction?: string;
  date_sign_fpb?: string;
  request_sent_at?: string;
  request_expires_at?: string;
  request_verified_at?: string;
  request_status?: string;
}
