import { Component, inject, OnInit, signal, Output, EventEmitter, ChangeDetectorRef } from '@angular/core';
import { FormBuilder, FormGroup, Validators, ReactiveFormsModule, FormControl } from '@angular/forms';
import { Router } from '@angular/router';
import { debounceTime } from 'rxjs/operators';
import { ConventionService } from '../../../../services/convention.service';
import { SireneService } from '../../../../services/sirene.service';
import { LoggerService } from '../../../../services/logger.service';
import { CommonModule } from '@angular/common';
import { UIComponents } from '../../../../components/ui-components';
import { FileItem } from '../../../../models/file-item.model';

@Component({
  selector: 'app-compte',
  standalone: true,
  imports: [ReactiveFormsModule, CommonModule, UIComponents],
  templateUrl: './compte.html',
  styleUrl: './compte.css',
})
export class Compte implements OnInit {
  private fb = inject(FormBuilder);
  private router = inject(Router);
  private conventionService = inject(ConventionService);
  private sireneService = inject(SireneService);
  private logger = inject(LoggerService);
  private cdr = inject(ChangeDetectorRef);

  isLoading = signal(false);
  errorMessage = signal<string | null>(null);

  rayonActionOptions = [
    { value: 'departement', label: 'Départemental' },
    { value: 'region', label: 'Régional' },
    { value: 'france', label: 'National' }
  ];

  compteForm: FormGroup = this.fb.group({
    siret: ['', Validators.required],
    tvaIntra: [''],
    nomSociete: ['', Validators.required],
    adresse: ['', Validators.required],
    codePostal: ['', Validators.required],
    ville: ['', Validators.required],
    codeNaf: [''],
    activitePrincipale: [''],
    rayonAction: ['', Validators.required],
    filiales: [''],
    logo: ['']
  });

  onLogoChange(event: Event) {
    const input = event.target as HTMLInputElement;
    if (input.files && input.files[0]) {
      const file = input.files[0];
      const reader = new FileReader();
      reader.onload = () => {
        const base64 = reader.result as string;
        this.compteForm.patchValue({ logo: base64 });
        this.cdr.detectChanges();
      };
      reader.readAsDataURL(file);
    }
  }

  removeLogo() {
    this.compteForm.patchValue({ logo: '' });
  }

  ngOnInit() {
    const data = this.conventionService.getCompte();
    if (data) {
      this.compteForm.patchValue(data);
    }

    // Save changes to service (and thus localStorage) automatically
    this.compteForm.valueChanges.pipe(
      debounceTime(300)
    ).subscribe(value => {
      this.conventionService.updateCompte(value);
    });
  }

  onSiretBlur() {
    const siretControl = this.compteForm.get('siret');
    this.errorMessage.set(null); // Reset error on new attempt

    if (siretControl && siretControl.value) {
      const rawSiret = siretControl.value;
      const cleanSiret = rawSiret.replace(/\D/g, '');
      siretControl.setValue(cleanSiret, { emitEvent: false });

      if (cleanSiret.length === 14) {
        this.isLoading.set(true);
        this.compteForm.disable();

        this.sireneService.getEtablissement(cleanSiret).subscribe({
          next: (data) => {
            if (data && !data.error) {
              this.compteForm.patchValue(data);
            } else {
              this.errorMessage.set("Impossible de récupérer les informations pour ce SIRET. Veuillez vérifier le numéro ou saisir les informations manuellement.");
              this.logger.logWebApiError('Sirene API returned logic error', data.error);

              // Hide error after 3 seconds
              setTimeout(() => {
                this.errorMessage.set(null);
              }, 3000);
            }
            this.isLoading.set(false);
            this.compteForm.enable();
          },
          error: (err) => {
            this.errorMessage.set("Une erreur technique est survenue lors de la recherche du SIRET.");
            this.logger.logWebApiError('Sirene API HTTP Error', err);
            this.isLoading.set(false);
            this.compteForm.enable();
          }
        });
      }
    }
  }

  getControl(fieldName: string): FormControl {
    const control = this.compteForm.get(fieldName);
    if (!control) {
      throw new Error(`Le champ ${fieldName} n'existe pas dans le FormGroup.`);
    }
    if (!(control instanceof FormControl)) {
      throw new Error(`Le champ ${fieldName} n'est pas un FormControl.`);
    }
    return control;
  }

  @Output() next = new EventEmitter<void>();

  onSubmit() {
    if (this.compteForm.valid) {
      this.conventionService.updateCompte(this.compteForm.value);
      this.next.emit();
    } else {
      this.compteForm.markAllAsTouched();
    }
  }

  onClear() {
    this.conventionService.clearData();
    this.compteForm.reset();
  }
  files: FileItem[] = [
    {
      id: '1',
      url: 'https://extranet.franceparebrise.fr/Convention/upload/dossiers_partenaires/30167096400073/2024-03-13 Extrait KBIS - OMNI CAEN.pdf',
      type: 'application/pdf',
      size: 679970, // bytes
      name: '2024-03-13 Extrait KBIS - OMNI CAEN.pdf',
    },
    {
      id: '2',
      url: 'https://extranet.franceparebrise.fr/Convention/upload/dossiers_partenaires/30167096400073/CG _ CV OMNIPESAGE.pdf',
      type: 'application/pdf',
      size: 562610,
      name: 'CG _ CV OMNIPESAGE.pdf',
    },
    {
      id: '3',
      url: 'https://extranet.franceparebrise.fr/Convention/upload/dossiers_partenaires/30167096400073/Convention_partenaire_30167096400073.pdf',
      type: 'application/pdf',
      size: 1220000,
      name: 'Convention_partenaire_30167096400073.pdf',
    },
    {
      id: '4',
      url: 'https://extranet.franceparebrise.fr/Convention/upload/dossiers_partenaires/30167096400073/Fiche client.docx',
      type: 'application/vnd.openxmlformats-officedocument.wordprocessingml.document',
      size: 129770,
      name: 'Fiche client.docx',
    },
    {
      id: '5',
      url: 'https://extranet.franceparebrise.fr/Convention/upload/dossiers_partenaires/30167096400073/Liste et coordonnées AGENCES_OMNIPESAGE_ind1.0.pdf',
      type: 'application/pdf',
      size: 329190,
      name: 'Liste et coordonnées AGENCES_OMNIPESAGE_ind1.0.pdf',
    },
    {
      id: '6',
      url: 'https://extranet.franceparebrise.fr/Convention/upload/dossiers_partenaires/30167096400073/RIB OMNIPESAGE.pdf',
      type: 'application/pdf',
      size: 285440,
      name: 'RIB OMNIPESAGE.pdf',
    },
    {
      id: '7',
      url: 'https://extranet.franceparebrise.fr/Convention/upload/dossiers_partenaires/30167096400073/convention simplifiée omnipesage.pdf',
      type: 'application/pdf',
      size: 869220,
      name: 'convention simplifiée omnipesage.pdf',
    },
    {
      id: '8',
      url: 'https://extranet.franceparebrise.fr/Convention/upload/dossiers_partenaires/30167096400073/coordonnées agences.xlsx',
      type: 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet',
      size: 17030,
      name: 'coordonnées agences.xlsx',
    },
    {
      id: '9',
      url: 'https://extranet.franceparebrise.fr/Convention/upload/dossiers_partenaires/30167096400073/doc06532820240430112040.pdf',
      type: 'application/pdf',
      size: 242470,
      name: 'doc06532820240430112040.pdf',
    },
  ];
  ;

  onFilesAdded(items: FileItem[]) {
    this.files.push(...items);
  }

  onRemove(item: FileItem) {
    this.files = this.files.filter(f => f.id !== item.id);
  }
}
