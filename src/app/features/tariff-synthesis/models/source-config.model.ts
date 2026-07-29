import { SourceType } from "./shared.types";

export interface SourceConfig {
    type: SourceType;

    // clé principale
    key?: string;

    // pour remises
    remType?: string;

    // véhicule ciblé
    vehicle?: string;

    // fallback ou override
    fallback?: any;

    // formule custom
    formula?: string;
}