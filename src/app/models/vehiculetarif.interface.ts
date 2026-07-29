import { Assur } from "./assur.interface";
import { Remise } from "./remise.interface";

// --- NOYAU VEHICULE ---
export interface VehiculeTarif {
    assur: Assur;

    // clé dynamique ("1", "2", etc.)
    remises: Record<string, Remise[]>;
}