import { RuleConfig } from "./rule-config.model";
import { ValueFormat } from "./shared.types";
import { SourceConfig } from "./source-config.model";


export interface LineConfig {
    label: string;

    // soit valeur fixe
    value?: string;

    // soit source dynamique
    source?: SourceConfig;

    // key simplifiée (fallback)
    key?: string;

    format?: ValueFormat;

    vehicle?: string;
    regionScope?: string;

    // règles de visibilité
    rules?: RuleConfig[];

    // lignes enfants (ex: rétro, déplacement)
    children?: LineConfig[];

    // options avancées
    decimal?: number;
    isImportant?: boolean;
}