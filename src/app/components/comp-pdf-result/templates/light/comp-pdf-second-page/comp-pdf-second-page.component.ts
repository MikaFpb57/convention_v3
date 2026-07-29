import { Component, inject, Input } from '@angular/core';
import { CompteData, ContactData, ContactsData, ConventionData, InfosData, ProceduresData } from '../../../../../models/convention.interface';
import { UtilsService } from '../../../../../services/utils.service';

type ContactKey = keyof ContactsData;
@Component({
  selector: 'comp-pdf-second-page',
  templateUrl: './comp-pdf-second-page.component.html',
  styleUrls: ['./comp-pdf-second-page.component.css']
})
export class CompPdfSecondPageComponent {
  protected readonly utilsService = inject(UtilsService);

  @Input() data!: ConventionData;

  contactsConfig: { key: ContactKey; label: string }[] = [
    { key: 'commercial', label: 'Commercial' },
    { key: 'priseEnCharge', label: 'Prise en charge' },
    { key: 'comptabilite', label: 'Comptabilité' },
    { key: 'relance', label: 'Relances' },
    // { key: 'flotte', label: 'Cartes flotte' },
  ];

  get compteData(): CompteData {
    return this.data?.compte ?? {} as CompteData;
  }
  get infosData(): InfosData {
    return this.data?.infos ?? {} as InfosData;
  }

  get contactsData(): ContactsData {
    return this.data?.contacts ?? {} as ContactsData;
  }

  get proceduresData(): ProceduresData {
    return this.data?.procedures ?? {} as ProceduresData;
  }

  get typePriseEnChargeIds(): number[] {
    return this.proceduresData.typePriseEnCharge ?? [];
  }

  get auDepartConducteurIds(): number[] {
    return this.proceduresData.auDepartConducteur ?? [];
  }

  get surFactureIds(): number[] {
    return this.proceduresData.surFacture ?? [];
  }

  get u_bool_assureBdg() {
    return this.utilsService.toOuiNon(this.infosData.assureBdg);
  }
  get u_bool_recuperationTva() {
    return this.utilsService.toOuiNon(this.infosData.recuperationTva);
  }

}
