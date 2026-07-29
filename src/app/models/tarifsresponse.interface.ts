import { BaseTarifs } from "./basetarifs.interface";
import { TarifsSpec } from "./tarifsspec.interface";

// --- MODEL GLOBAL ---
export interface TarifResponse {
    baseTarifs: BaseTarifs;
    tarifsSpec: TarifsSpec;
}