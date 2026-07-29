import { Component, inject, Input, OnInit } from '@angular/core';
import { CompteData, ConventionData, InfosData } from '../../../../../models/convention.interface';
import { UtilsService } from '../../../../../services/utils.service';

@Component({
  selector: 'comp-pdf-tariff-third-page',
  templateUrl: './comp-pdf-tariff-third-page.component.html',
  styleUrls: ['./comp-pdf-tariff-third-page.component.css']
})
export class CompPdfTariffThirdPageComponent {
  private readonly utils = inject(UtilsService);

  @Input() data!: ConventionData;

  get compteData(): CompteData {
    return this.data?.compte ?? {} as CompteData;
  }
  get infosData(): InfosData {
    return this.data?.infos ?? {} as InfosData;
  }
  get u_tr_tarif() {
    return this.utils.formatTarif(this.infosData.tarif);
  }

}
