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
  traite: number;
}
