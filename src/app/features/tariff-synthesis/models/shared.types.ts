export type ValueFormat = '€' | '%' | 'h' | 'text';

export type SectionType =
    | 'list'
    | 'group'
    | 'text'
    | 'note'
    | 'signature'
    | 'shared';

export type SourceType =
    | 'static'
    | 'tarif'
    | 'remise'
    | 'formula';

export type RuleType =
    | 'vehicle'
    | 'region'
    | 'condition';