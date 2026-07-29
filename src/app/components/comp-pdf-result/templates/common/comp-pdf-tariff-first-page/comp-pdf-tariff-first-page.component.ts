import { Component, inject, Input } from '@angular/core';
import { UtilsService } from '../../../../../services/utils.service';
import { TarifResponse } from '../../../../../models/tarifsresponse.interface';
import { BaseTarifs } from '../../../../../models/basetarifs.interface';
import { TarifsSpec } from '../../../../../models/tarifsspec.interface';

@Component({
  selector: 'comp-pdf-tariff-first-page',
  templateUrl: './comp-pdf-tariff-first-page.component.html',
  styleUrls: ['./comp-pdf-tariff-first-page.component.css']
})
export class CompPdfTariffFirstPageComponent {
  private readonly utils = inject(UtilsService);
  private defaultNumber: number = 0;
  @Input() data!: TarifResponse;

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

  round2(value?: number | null): string {
    return (value ?? this.defaultNumber).toFixed(2);
  }

}
