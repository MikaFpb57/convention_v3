import { SectionType } from './shared.types';
import { LineConfig } from './line-config.model';

export interface SectionConfig {
  type: SectionType;

  title?: string;
  subtitle?: string;

  // contenu principal
  lines?: LineConfig[];

  // pour group
  blocks?: SectionConfig[];

  // pour texte
  content?: string[];

  // pour intro/outro
  intro?: string;
  outro?: string[];

  // pour shared (nota)
  ref?: string;

  // spécifique signature
  layout?: 'two-columns';
  left?: any;
  right?: any;
  footer?: string;
}