import { Component, inject, Input } from '@angular/core';
import { UtilsService } from '../../../../../services/utils.service';
import { TarifResponse } from '../../../../../models/tarifsresponse.interface';
import { BaseTarifs } from '../../../../../models/basetarifs.interface';
import { TarifsSpec } from '../../../../../models/tarifsspec.interface';
import { PageVM } from '../../../../../features/tariff-synthesis/models/view-model.model';
import { PdfDynamicContentComponent } from '../../../../../features/tariff-synthesis/components/pdf-dynamic-content.component/pdf-dynamic-content.component';

@Component({
  selector: 'comp-pdf-tariff-page',
  templateUrl: './comp-pdf-tariff-page.component.html',
  styleUrls: ['./comp-pdf-tariff-page.component.css'],
  standalone:true,
  imports:[PdfDynamicContentComponent]
})
export class CompPdfTariffPageComponent {
  private readonly utils = inject(UtilsService);
  private readonly defaultNumber: number = 0;
  @Input() data!: TarifResponse;
  @Input() pageVM!: PageVM

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
