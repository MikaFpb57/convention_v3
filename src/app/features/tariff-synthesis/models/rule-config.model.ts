import { RuleType } from './shared.types';

export interface RuleConfig {
  type: RuleType;

  field?: string;

  operator?: 'equal' | 'gt' | 'lt' | 'in';

  value?: any;
}