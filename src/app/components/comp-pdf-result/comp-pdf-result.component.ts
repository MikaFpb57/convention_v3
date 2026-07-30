import {
  Component,
  Inject,
  Input,
  OnChanges,
  SimpleChanges
} from '@angular/core';

import { CommonModule } from '@angular/common';
import { PdfPage } from '../../models/pdf-page.model';

import { CompPdfViewerComponent } from './pdf/comp-pdf-viewer/comp-pdf-viewer.component';
import { CompPdfFirstPageComponent } from '../comp-pdf-result/templates/light/comp-pdf-first-page/comp-pdf-first-page.component';
import { CompPdfSecondPageComponent } from '../comp-pdf-result/templates/light/comp-pdf-second-page/comp-pdf-second-page.component';
import { CompPdfThirdPageComponent } from '../comp-pdf-result/templates/light/comp-pdf-third-page/comp-pdf-third-page.component';
import { CompPdfImgPageComponent } from '../comp-pdf-result/pdf/comp-pdf-img-page/comp-pdf-img-page.component';
import { CompPdfTariffFirstPageComponent } from './templates/common/comp-pdf-tariff-first-page/comp-pdf-tariff-first-page.component';
import { CompPdfTariffSecondPageComponent } from './templates/common/comp-pdf-tariff-second-page/comp-pdf-tariff-second-page.component';
import { CompPdfTariffThirdPageComponent } from './templates/common/comp-pdf-tariff-third-page/comp-pdf-tariff-third-page.component';
import { mapTarifResponse } from '../../utils/fiche-mapper';
import { ConventionData } from '../../models/convention.interface';
import { TarifResponse } from '../../models/tarifsresponse.interface';
import { AssurService } from '../../services/assur.service';
import { UtilsService } from '../../services/utils.service';

@Component({
  selector: 'comp-pdf-result',
  standalone: true,
  imports: [CommonModule, CompPdfViewerComponent],
  template: `
    <comp-pdf-viewer [pages]="pages"></comp-pdf-viewer>
  `
})
export class CompPdfResultComponent implements OnChanges {

  @Input({ required: true }) conventionData!: ConventionData;
  private tariff?: TarifResponse;
  private lastTarifKey?: string

  pages: PdfPage[] = [];

  title = 'Convention simplifiée pour ouverture de compte client';

  // ✅ CGV image unique
  private readonly cgv: string[] = [
    "./assets/img/cgv_unique.jpg",
  ];
  constructor(
    private readonly assurService: AssurService,
    private readonly utilsService: UtilsService
  ) {

  }

  ngOnChanges(changes: SimpleChanges): void {

    if (changes['conventionData']) {
      const currentTarif = this.conventionData?.infos?.tarif;
      const newTarifKey = this.utilsService.formatTarifToPricingKey(currentTarif);
      console.warn("new tarif", newTarifKey)
      console.warn("old tarif", this.lastTarifKey)
      // ✅ comparer avec le précédent
      if (newTarifKey && newTarifKey !== this.lastTarifKey) {

        this.lastTarifKey = newTarifKey;

        this.assurService.getTarifs(newTarifKey).subscribe(dto => {
          this.tariff = mapTarifResponse(dto);

          // ✅ build pages uniquement après récupération
          this.buildPages(this.conventionData, this.tariff);
        });

      } else if (this.tariff) {
        // ✅ tarif pas changé → rebuild uniquement
        this.buildPages(this.conventionData, this.tariff);
      }
    }

  }

  private buildPages(data: ConventionData, tariff: TarifResponse | undefined) {
    console.warn("new build", tariff)
    const pages: PdfPage[] = [];

    // ✅ Page 1
    pages.push({
      component: CompPdfFirstPageComponent,
      inputs: {
        id: 'page-0',
        position: 0,
        data
      },
      type: 'text',
      title: this.title
    });

    // ✅ CGV images
    this.cgv.forEach((src, index) => {
      pages.push({
        component: CompPdfImgPageComponent,
        inputs: {
          src,
          id: `page-${index + 1}`,
          position: index + 1
        },
        type: 'image',
        title: this.title
      });
    });

    // ✅ Page 2
    pages.push({
      component: CompPdfSecondPageComponent,
      inputs: {
        id: 'page-6',
        position: 6,
        data
      },
      type: 'text',
      title: this.title
    });

    // ✅ Page 3
    pages.push({
      component: CompPdfThirdPageComponent,
      inputs: {
        id: 'page-7',
        position: 7,
        data
      },
      type: 'text',
      title: this.title
    });


    pages.push({
      component: CompPdfTariffFirstPageComponent,
      inputs: {
        id: 'page-7',
        position: 8,
        data: tariff
      },
      type: 'text',
      title: 'GRILLE DE TARIFICATION',
      backgroundImage: "./assets/img/tariff_background.png"
    });

    pages.push({
      component: CompPdfTariffSecondPageComponent,
      inputs: {
        id: 'page-8',
        position: 9,
        data: tariff
      },
      type: 'text',
      title: 'GRILLE DE TARIFICATION',
      backgroundImage: "./assets/img/tariff_background.png"
    });

    pages.push({
      component: CompPdfTariffThirdPageComponent,
      inputs: {
        id: 'page-9',
        position: 10,
        data: tariff
      },
      type: 'text',
      title: 'GRILLE DE TARIFICATION',
      backgroundImage: "./assets/img/tariff_background.png"
    });

    
    // documentVM.pages.forEach((pageVM, index) => {
    //   pages.push({
    //     component: CompPdfTariffPageComponent, // ✅ UN SEUL composant
    //     inputs: {
    //       pageVM: pageVM, // ✅ dynamique
    //       index: index
    //     },
    //     type: 'text',
    //     title: 'GRILLE DE TARIFICATION'
    //   });
    // });


    this.pages = pages;
  }
}