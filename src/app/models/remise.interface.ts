// --- REMISE MODEL ---
export interface Remise {
    type: string;
    id: string;
    libelle: string;
    pourcentage: number;
    tarif?: number | null;
    tempsMO: number;
    libelleMO: string;
    prix: number;
    dateMaj: Date;
    dateMep: Date;
}