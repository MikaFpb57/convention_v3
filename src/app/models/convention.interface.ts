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
}

export interface ConventionData {
  compte?: CompteData;
}
