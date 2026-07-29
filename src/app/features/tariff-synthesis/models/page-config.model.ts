import { SectionConfig } from './section-config.model';

export interface PageConfig {
    id: string;
    header: PageHeaderConfig;
    sections: SectionConfig[];
}

export interface PageHeaderConfig {
    title: string;
    subtitleSource?: string;
    pictos?: string;
    variant?: 'main' | 'annexe';
}