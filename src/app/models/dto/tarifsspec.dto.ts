import { VehiculeTarifDto } from "./vehiculetarif.dto";

// --- TARIFS SPEC DTO (VL / PL optionnels) ---
export interface TarifsSpecDto {
    [key: string]: VehiculeTarifDto | undefined;
}