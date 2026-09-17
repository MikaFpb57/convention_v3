import { Component, inject, Input } from '@angular/core';
import { UtilsService } from '../../../../../services/utils.service';
import { TarifResponse } from '../../../../../models/tarifsresponse.interface';
import { BaseTarifs } from '../../../../../models/basetarifs.interface';
import { TarifsSpec } from '../../../../../models/tarifsspec.interface';
import { ConventionData, InfosData } from '../../../../../models/convention.interface';

@Component({
  selector: 'comp-pdf-tariff-first-page',
  templateUrl: './comp-pdf-tariff-first-page.component.html',
  styleUrls: ['./comp-pdf-tariff-first-page.component.css']
})
export class CompPdfTariffFirstPageComponent {
  private readonly utils = inject(UtilsService);
  private defaultNumber: number = 0;
  @Input() data!: TarifResponse;
  @Input() conventionData!: ConventionData;

  constructor(
    private readonly utilsService: UtilsService
  ) {
    console.warn(this.data)
  }

  get baseTarifs(): BaseTarifs {
    return this.data?.baseTarifs ?? {} as BaseTarifs;
  }
  get tarifsSpec(): TarifsSpec {
    return this.data?.tarifsSpec ?? {} as TarifsSpec;
  }
  get infosData(): InfosData {
    return this.conventionData?.infos ?? {} as InfosData;
  }

  // catégories du parc automobile ayant au moins un véhicule
  get hasVl(): boolean {
    return (this.infosData.nb_vu_vl ?? 0) > 0;
  }
  get hasPl(): boolean {
    return (this.infosData.nb_pl ?? 0) > 0;
  }
  get hasTp(): boolean {
    return (this.infosData.nb_tp ?? 0) > 0;
  }
  get hasAgri(): boolean {
    return (this.infosData.nb_agri ?? 0) > 0;
  }
  get hasBus(): boolean {
    return (this.infosData.nb_bus ?? 0) > 0;
  }
  get hasHeavy(): boolean {
    return this.hasPl || this.hasAgri || this.hasTp || this.hasBus;
  }

  round2(value?: number | null): string {
    return (value ?? this.defaultNumber).toFixed(2);
  }

}
