import { Injectable } from '@angular/core';
import { MatrixValue } from './convention';

@Injectable({
  providedIn: 'root'
})
export class UtilsService {
  private maps: Record<string, Map<number, string>> = {};
  private lists: Record<string, MatrixValue[]> = {};

  private readonly MODE_TARIF_LABELS: Record<string, string> = {
    L: 'Liberté',
    SC: 'Sérénité C',
    SD: 'Sérénité D'
  };
  private readonly MODE_TARIF_PRICING_KEY: Record<string, string> = {
    L: 'LIBERTE',
    SC: 'SERENITEC',
    SD: 'SERENITED'
  };
  private readonly MODE_GEST_LABELS: Record<string, string> = {
    majmail: '0% centralisé - Envoi par mail par le centre',
    majpapier: '0% centralisé - Envoi papier par le centre',
    maj50: '50% centralisé - EDI pour la partie assurancielle (HT) + centre',
    maj5050: '100% centralisé - EDI pour la partie assurancielle (HT) + MAJNET',
    maj100: '100% centralisé - Un seul régleur pour la totalité de la facture'
  };

  readonly PROCESS_OPTIONS = {
    typePriseEnCharge: [
      { id: 1, label: 'Acceptation tacite' },
      { id: 2, label: 'Accord téléphonique' },
      { id: 3, label: 'Accord Mail' },
      { id: 4, label: 'Validation devis (Contact PEC obligatoire)' },
      { id: 5, label: 'Bon de commande (Contact PEC non obligatoire)' },
      { id: 6, label: 'Procédure assurancielle' },
      { id: 7, label: 'Procédure loueur' }
    ],

    auDepartConducteur: [
      { id: 1, label: 'Conducteur : Copie de la DSPC' },
      { id: 2, label: 'Conducteur : Copie de la facture' },
      { id: 3, label: 'Facture avec DSPC' },
      { id: 4, label: 'Accompagnée du bon de commande' },
      { id: 5, label: 'Accompagnée de la carte grise' },
      { id: 6, label: 'Accompagnée du mémo' }
    ],

    surFacture: [
      { id: 1, label: 'Nom de la personne ayant donné l\'accord' },
      { id: 2, label: 'Numéro du bon de commande' },
      { id: 3, label: 'Nom du conducteur' }
    ]
  };




  setMap(key: string, values: MatrixValue[]) {
    const clean = values.map(v => ({
      id_type: Number(v.id_type),
      libelle_type: v.libelle_type.trim()
    }));

    this.lists[key] = clean;

    this.maps[key] = new Map(
      clean.map(v => [v.id_type, v.libelle_type])
    );
  }



  format(key: string, value: string | null | undefined): string {
    const numValue = Number(value);

    return value != null && !isNaN(numValue)
      ? this.maps[key]?.get(numValue) ?? ''
      : '';
  }


  getList(key: string): MatrixValue[] {
    return this.lists[key] ?? [];
  }


  getLabels(key: keyof typeof this.PROCESS_OPTIONS, ids: number[]): string[] {
    return this.PROCESS_OPTIONS[key]
      .filter(opt => ids.includes(opt.id))
      .map(opt => opt.label);
  }


  toOuiNon(value: any): string {
    return Number(value) === 1 ? 'OUI' : 'NON';
  }

  formatTarif(value: string | null | undefined): string {
    return value ? this.MODE_TARIF_LABELS[value] ?? value : '';
  }
  formatTarifToPricingKey(value: string | null | undefined): string {
    return value ? this.MODE_TARIF_PRICING_KEY[value] ?? value : '';
  }
  formatModeGest(value: string | null | undefined): string {
    return value ? this.MODE_GEST_LABELS[value] ?? value : '';
  }

  safeValue(value: any, fallback: string = ''): string {
    if (value === null || value === undefined || value === '') {
      return fallback;
    }
    return String(value);
  }

  formatUppercase(value: string | null | undefined): string {
    return (value ?? '').toUpperCase();
  }

  number(value: any): number {
    return Number(value) || 0;
  }
}