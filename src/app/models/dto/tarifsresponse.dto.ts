import { BaseTarifsDto } from "./basetarifs.dto";
import { TarifsSpecDto } from "./tarifsspec.dto";

// --- RESPONSE DTO GLOBAL ---
export interface TarifResponseDto {
    base_tarifs: BaseTarifsDto;
    tarifs_spec: TarifsSpecDto;
}