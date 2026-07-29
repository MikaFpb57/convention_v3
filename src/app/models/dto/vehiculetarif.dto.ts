import { AssurDto } from "./assur.dto";
import { RemiseDto } from "./remise.dto";

// --- NOYAU VEHICULE DTO ---
export interface VehiculeTarifDto {
    assur: AssurDto;

    remises: {
        [key: string]: RemiseDto[];
    };
}