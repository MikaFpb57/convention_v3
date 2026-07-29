import { Injectable } from '@angular/core';
import { DocumentConfig } from '../models/document-config.model';
import { DocumentVM, PageVM, SectionVM, LineVM } from '../models/view-model.model';
import { TarifResponse } from '../../../models/tarifsresponse.interface';
import { TarificationContext } from '../models/context.model';
import { DataResolverService } from './data-resolver.service';
import { RuleEngineService } from './rule-engine.service';
import { FormatterService } from './formatter.service';

@Injectable({
    providedIn: 'root'
})
export class TarificationEngineService {


    constructor(
        private readonly dataResolver: DataResolverService,
        private readonly ruleEngine: RuleEngineService,
        private readonly formatter: FormatterService
    ) { }


    buildDocument(config: DocumentConfig, data: TarifResponse): DocumentVM {
        return {
            pages: config.pages.map(page => this.buildPage(page, data, config))
        };
    }

    private buildPage(pageConfig: any, data: TarifResponse, config: DocumentConfig): PageVM {
        return {
            id: pageConfig.id,
            header: {
                title: pageConfig.header.title,
                subtitle: this.resolveSubtitle(pageConfig.header, data),
                pictos: pageConfig.header.pictos
            },
            sections: pageConfig.sections.map((section: any) =>
                this.buildSection(section, data, config)
            )
        };
    }

    private buildSection(section: any, data: TarifResponse, config: DocumentConfig): SectionVM {

        // gestion shared (nota)
        if (section.type === 'shared') {
            const shared = config.meta.shared?.[section.ref];
            return this.buildSection(shared, data, config);
        }

        const vm: SectionVM = {
            type: section.type,
            title: section.title,
            subtitle: section.subtitle,
            content: section.content
        };

        // list simple
        if (section.lines) {
            vm.lines = section.lines.map((line: any) =>
                this.buildLine(line, data, {} as TarificationContext)
            );
        }

        // group (sous sections)
        if (section.blocks) {
            vm.sections = section.blocks.map((block: any) =>
                this.buildSection(block, data, config)
            );
        }

        // signature
        if (section.type === 'signature') {
            vm.layout = section.layout;
            vm.left = section.left;
            vm.right = section.right;
            vm.footer = section.footer;
        }

        return vm;
    }

    private buildLine(line: any, data: TarifResponse, context: TarificationContext): LineVM | null {

        // ✅ visibilité
        if (!this.ruleEngine.isVisible(line, context, data)) {
            return null;
        }

        // ✅ resolve
        const resolved = line.source
            ? this.dataResolver.resolve(line.source, data, context)
            : this.dataResolver.resolve({ type: 'tarif', key: line.key }, data, context);

        // ✅ format
        const value = this.formatter.format(resolved, line.format);

        // ✅ children
        let children;
        if (line.children) {
            children = line.children
                .map((child: any) => this.buildLine(child, data, context))
                .filter(Boolean);
        }

        return {
            label: line.label,
            value,
            children,
            isImportant: line.isImportant
        };
    }

    // ----------------------
    // HELPERS
    // ----------------------

    private resolveSubtitle(header: any, data: TarifResponse): string {
        if (header.subtitleSource === 'groupe') {
            return data.baseTarifs?.groupe ?? '';
        }
        return '';
    }

    private resolveTarif(key: string, data: TarifResponse, vehicle?: string): string {
        if (!vehicle) return '-';

        // const value = data.tarifsSpec?.[vehicle]?.assur?.[key];
        const value = null;

        if (value === undefined || value === null) return '-';

        return this.formatEuro(value);
    }

    private resolveSource(source: any, data: TarifResponse): string {
        const { type, key, vehicle } = source;

        if (type === 'tarif') {
            return this.resolveTarif(key, data, vehicle);
        }

        // TODO step avancé: remises, formulas
        return '-';
    }

    private formatEuro(value: number): string {
        return `${value.toFixed(2).replace('.', ',')} €`;
    }
}