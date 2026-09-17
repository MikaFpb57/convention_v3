import { Component, inject, Input, OnInit } from '@angular/core';
import { CompteData, ConventionData, InfosData } from '../../../../../models/convention.interface';
import { UtilsService } from '../../../../../services/utils.service';

@Component({
  selector: 'comp-pdf-tariff-second-page',
  templateUrl: './comp-pdf-tariff-second-page.component.html',
  styleUrls: ['./comp-pdf-tariff-second-page.component.css']
})
export class CompPdfTariffSecondPageComponent {
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

  // catégories du parc automobile ayant au moins un véhicule
  get hasCa(): boolean {
    return (this.infosData.nb_ca ?? 0) > 0;
  }
  get hasAgri(): boolean {
    return (this.infosData.nb_agri ?? 0) > 0;
  }
  get hasBus(): boolean {
    return (this.infosData.nb_bus ?? 0) > 0;
  }

}
