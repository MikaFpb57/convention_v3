import { PageConfig } from './page-config.model';

export interface DocumentConfig {
    meta: DocumentMeta;
    pages: PageConfig[];
}

export interface DocumentMeta {
    documentType: string;
    version: string;
    shared?: Record<string, any>;
}