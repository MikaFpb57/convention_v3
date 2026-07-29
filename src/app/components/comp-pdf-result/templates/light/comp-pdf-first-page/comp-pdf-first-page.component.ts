import { Component, inject, Input } from '@angular/core';
import { CompteData, ConventionData, InfosData } from '../../../../../models/convention.interface';
import { UtilsService } from '../../../../../services/utils.service';

@Component({
  selector: 'comp-pdf-first-page',
  templateUrl: './comp-pdf-first-page.component.html',
  styleUrls: ['./comp-pdf-first-page.component.css']
})
export class CompPdfFirstPageComponent {
  private readonly utils = inject(UtilsService);
  
  @Input() data!: ConventionData;
  
  get compteData(): CompteData {
    return this.data?.compte ?? {} as CompteData;
  }
  get infosData(): InfosData {
    return this.data?.infos ?? {} as InfosData;
  }

  get u_bool_assureBdg() {
    return this.utils.toOuiNon(this.infosData.assureBdg);
  }
  get u_bool_recuperationTva() {
    return this.utils.toOuiNon(this.infosData.recuperationTva);
  }
  get u_tr_tarif() {
    return this.utils.formatTarif(this.infosData.tarif);
  }
}