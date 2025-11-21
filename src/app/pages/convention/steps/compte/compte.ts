import { Component, inject, OnInit, signal } from '@angular/core';
import { FormBuilder, FormGroup, Validators, ReactiveFormsModule, FormControl } from '@angular/forms';
import { Router } from '@angular/router';
import { debounceTime } from 'rxjs/operators';
import { ConventionService } from '../../../../services/convention.service';
import { SireneService } from '../../../../services/sirene.service';
import { LoggerService } from '../../../../services/logger.service';
import { CommonModule } from '@angular/common';
import { UIComponents } from '../../../../components/ui-components';

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

  isLoading = signal(false);
  errorMessage = signal<string | null>(null);

  compteForm: FormGroup = this.fb.group({
    siret: ['', Validators.required],
    tvaIntra: [''],
    nomSociete: ['', Validators.required],
    adresse: ['', Validators.required],
    codePostal: ['', Validators.required],
    ville: ['', Validators.required],
    codeNaf: [''],
    activitePrincipale: [''],
    rayonAction: [''],
    filiales: ['']
  });

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

  onSubmit() {
    if (this.compteForm.valid) {
      this.conventionService.updateCompte(this.compteForm.value);
      this.router.navigate(['/convention/contacts']);
    } else {
      this.compteForm.markAllAsTouched();
    }
  }

  onClear() {
    this.conventionService.clearData();
    this.compteForm.reset();
  }
}
