import { VehiculeTarif } from "./vehiculetarif.interface";

// --- TARIFS SPEC MODEL ---
export interface TarifsSpec {
    // extensible
    [key: string]: VehiculeTarif | undefined;
}