import { Component, inject, Input } from '@angular/core';
import { CompteData, ConventionData, InfosData, ProceduresData } from '../../../../../models/convention.interface';
import { UtilsService } from '../../../../../services/utils.service';

@Component({
  selector: 'comp-pdf-third-page',
  templateUrl: './comp-pdf-third-page.component.html',
  styleUrls: ['./comp-pdf-third-page.component.css']
})
export class CompPdfThirdPageComponent {
  private readonly utils = inject(UtilsService);

  @Input() data!: ConventionData;

  get compteData(): CompteData {
    return this.data?.compte ?? {} as CompteData;
  }
  get infosData(): InfosData {
    return this.data?.infos ?? {} as InfosData;
  }
  get proceduresData(): ProceduresData {
    return this.data?.procedures ?? {} as ProceduresData;
  }

  get facturationData() {
    return this.data?.facturation ?? {};
  }

  get u_bool_cartesFlotte() {
    // return this.utils.toOuiNon(this.facturationData.cartesFlotte)
    return
  }
  get u_bool_logoCartes() {
    // return this.utils.toOuiNon(this.facturationData.logoCartes)
    return
  }
  get u_bool_tva() {
    // return this.utils.toOuiNon(this.facturationData.tva)
    return
  }

  get u_bool_ttc() {
    // return this.utils.toOuiNon(this.facturationData.ttc)
    return
  }

  get u_bool_ht() {
    // return this.utils.toOuiNon(this.facturationData.ht)
    return
  }

  get u_bool_franchise() {
    // return this.utils.toOuiNon(this.facturationData.franchise)
    return
  }

  get u_bool_demat() {
    return this.utils.toOuiNon(this.facturationData.demat)
  }
  
  get u_format_mode_gest() {
    return this.utils.formatModeGest(this.facturationData.mode_gest);
  }

  get u_format_delaipaie(){
    return this.utils.format('delaipaie',this.facturationData.delaiPaiement);
  }

  get u_format_freq_envoi(){
    return this.utils.format('delaipaie',this.facturationData.freqTransmission);
  }
}