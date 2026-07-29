import { Injectable } from '@angular/core';
import { RuleConfig } from '../models/rule-config.model';
import { TarificationContext } from '../models/context.model';

@Injectable({
    providedIn: 'root'
})
export class RuleEngineService {

    isVisible(line: any, context: TarificationContext, data: any): boolean {

        // ✅ VEHICLE
        if (line.vehicle && line.vehicle !== context.vehicle) {
            return false;
        }

        // ✅ REGION
        if (line.regionScope && line.regionScope !== context.region) {
            return false;
        }

        // ✅ RULES ARRAY
        if (line.rules?.length) {
            return line.rules.every((rule: RuleConfig) =>
                this.evaluateRule(rule, context, data)
            );
        }

        return true;
    }

    private evaluateRule(rule: RuleConfig, context: TarificationContext, data: any): boolean {

        const value = this.getFieldValue(rule.field!, context, data);

        switch (rule.operator) {

            case 'equal':
                return value === rule.value;

            case 'gt':
                return value > rule.value;

            case 'lt':
                return value < rule.value;

            case 'in':
                return rule.value?.includes(value);

            default:
                return false;
        }
    }

    private getFieldValue(field: string, context: TarificationContext, data: any) {

        if (field === 'vehicle') return context.vehicle;
        if (field === 'region') return context.region;
        if (field === 'groupe') return context.groupe;

        return data?.[field];
    }
}