export interface DocumentVM {
    pages: PageVM[];
}

export interface PageVM {
    id: string;
    header: PageHeaderVM;
    sections: SectionVM[];
}

export interface PageHeaderVM {
    title: string;
    subtitle?: string;
    pictos?: string;
}

export interface SectionVM {
    type: string;
    title?: string;
    subtitle?: string;

    lines?: LineVM[];
    sections?: SectionVM[];

    intro?: string;

    content?: string[];

    layout?: string;
    left?: any;
    right?: any;
    footer?: string;
}

export interface LineVM {
    label: string;

    value: string;

    unit?: string;

    children?: LineVM[];

    isImportant?: boolean;
}