import { Component, inject, OnInit, signal, Output, EventEmitter, ChangeDetectorRef, effect, HostListener, ElementRef } from '@angular/core';
import { FormBuilder, FormGroup, Validators, ReactiveFormsModule, FormControl } from '@angular/forms';
import { debounceTime, distinctUntilChanged } from 'rxjs/operators';
import { ConventionService as ConventionApiService } from '../../../../services/convention';
import { ConventionService as ConventionStateService } from '../../../../services/convention.service';
import { SireneService } from '../../../../services/sirene.service';
import { EntrepriseApiService, EntrepriseSuggestion } from '../../../../services/entreprise-api.service';
import { GeoApiService, AddressSuggestion, Commune } from '../../../../services/geo-api.service';
import { LoggerService } from '../../../../services/logger.service';
import { CommonModule } from '@angular/common';
import { UIComponents } from '../../../../components/ui-components';
import { AutocompleteOption } from '../../../../components/comp-autocomplete/comp-autocomplete.component';
import { CompteData } from '../../../../models/convention.interface';
import { bindReadOnlyForm } from '../../../../utils/form-readonly';

@Component({
  selector: 'app-compte',
  standalone: true,
  imports: [ReactiveFormsModule, CommonModule, UIComponents],
  templateUrl: './compte.html',
  styleUrl: './compte.css',
})
export class Compte implements OnInit {
  private fb = inject(FormBuilder);
  private stateService = inject(ConventionStateService);
  private apiService = inject(ConventionApiService);
  private sireneService = inject(SireneService);
  private entrepriseApiService = inject(EntrepriseApiService);
  private geoApiService = inject(GeoApiService);
  private logger = inject(LoggerService);
  private cdr = inject(ChangeDetectorRef);
  private elementRef = inject(ElementRef);

  constructor() {
    effect(() => {
      const data = this.stateService.getCompte();
      if (data) {
        this.compteForm.patchValue(data, { emitEvent: false });
        if (!this.skipEffectFetch && data.codePostal && /^\d{5}$/.test(data.codePostal)) {
          this.fetchVillesByCodePostal(data.codePostal, data.ville);
        }
      } else {
        this.compteForm.reset({}, { emitEvent: false });
        this.villesDisponibles.set([]);
        this.villeOptions.set([]);
      }
    });

    bindReadOnlyForm(this.compteForm, () => this.stateService.isReadOnly(), {
      keepDisabledWhen: () => this.isLoading()
    });
  }

  isEditMode = this.stateService.isEditMode;
  isReadOnly = this.stateService.isReadOnly;

  isLoading = signal(false);
  errorMessage = signal<string | null>(null);

  societeSuggestions = signal<EntrepriseSuggestion[]>([]);
  isLoadingSociete = signal(false);
  showSocieteResults = signal(false);
  societeSearchError = signal<string | null>(null);
  societeSelectedIndex = signal(-1);

  adresseOptions = signal<AutocompleteOption[]>([]);
  currentAddressSuggestions = signal<AddressSuggestion[]>([]);
  isLoadingAdresse = signal(false);

  villesDisponibles = signal<Commune[]>([]);
  villeOptions = signal<AutocompleteOption[]>([]);
  isLoadingVilles = signal(false);
  private skipCpVilleReset = false;
  private skipEffectFetch = false;

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

  @HostListener('document:keydown.escape')
  onEscapeKey() {
    this.closeSocieteResults();
  }

  @HostListener('document:click', ['$event'])
  onDocumentClick(event: MouseEvent) {
    if (!this.elementRef.nativeElement.contains(event.target)) {
      this.closeSocieteResults();
    }
  }

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
    this.compteForm.valueChanges.pipe(
      debounceTime(300)
    ).subscribe(value => {
      this.stateService.updateCompte(value);
    });

    this.compteForm.get('codePostal')?.valueChanges.pipe(
      debounceTime(300),
      distinctUntilChanged()
    ).subscribe(codePostal => {
      if (this.skipCpVilleReset) {
        return;
      }

      if (codePostal && codePostal.length === 5 && /^\d{5}$/.test(codePostal)) {
        this.fetchVillesByCodePostal(codePostal);
      } else {
        this.villesDisponibles.set([]);
        this.villeOptions.set([]);
        this.compteForm.patchValue({ ville: '' }, { emitEvent: false });
      }
    });
  }

  private patchCompteFields(data: Partial<CompteData>) {
    this.compteForm.patchValue(data, { emitEvent: false });
    this.stateService.updateCompte(this.compteForm.value);
  }

  onSiretBlur() {
    if (this.isReadOnly()) return;
    const siretControl = this.compteForm.get('siret');
    this.errorMessage.set(null);

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
              this.patchCompteFields(data);
            } else {
              this.errorMessage.set("Impossible de récupérer les informations pour ce SIRET. Veuillez vérifier le numéro ou saisir les informations manuellement.");
              this.logger.logWebApiError('Sirene API returned logic error', data.error);

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

  onSearchSocieteClick() {
    if (this.isReadOnly()) return;
    this.societeSearchError.set(null);
    this.societeSelectedIndex.set(-1);

    const rawNom = this.compteForm.get('nomSociete')?.value ?? '';
    const formatted = this.entrepriseApiService.formatQuery(rawNom);

    if (formatted.length < 3) {
      this.societeSearchError.set('Saisissez au moins 3 caractères.');
      this.showSocieteResults.set(false);
      return;
    }

    const codePostal = this.compteForm.get('codePostal')?.value ?? '';
    const cpFilter = /^\d{5}$/.test(codePostal) ? codePostal : undefined;

    this.isLoadingSociete.set(true);
    this.showSocieteResults.set(true);

    this.entrepriseApiService.searchByName(formatted, cpFilter).subscribe({
      next: (suggestions) => {
        this.societeSuggestions.set(suggestions);
        this.isLoadingSociete.set(false);
        if (suggestions.length === 0) {
          this.societeSearchError.set('Aucune entreprise trouvée.');
        }
      },
      error: (err) => {
        this.societeSuggestions.set([]);
        this.isLoadingSociete.set(false);
        this.societeSearchError.set(err?.message ?? 'Erreur lors de la recherche d\'entreprises.');
      }
    });
  }

  onSocieteSelected(suggestion: EntrepriseSuggestion) {
    const data = this.entrepriseApiService.mapEtablissementToCompte(
      suggestion.etablissement,
      suggestion.nomEntreprise
    );
    this.patchCompteFields(data);
    this.closeSocieteResults();
  }

  onSocieteKeyDown(event: KeyboardEvent) {
    const suggestions = this.societeSuggestions();
    if (!this.showSocieteResults() || suggestions.length === 0) {
      return;
    }

    switch (event.key) {
      case 'ArrowDown':
        event.preventDefault();
        this.societeSelectedIndex.update(i =>
          i < suggestions.length - 1 ? i + 1 : i
        );
        break;
      case 'ArrowUp':
        event.preventDefault();
        this.societeSelectedIndex.update(i => i > 0 ? i - 1 : -1);
        break;
      case 'Enter': {
        event.preventDefault();
        const idx = this.societeSelectedIndex();
        if (idx >= 0 && idx < suggestions.length) {
          this.onSocieteSelected(suggestions[idx]);
        }
        break;
      }
      case 'Escape':
        this.closeSocieteResults();
        break;
    }
  }

  closeSocieteResults() {
    this.showSocieteResults.set(false);
    this.societeSelectedIndex.set(-1);
  }

  onSearchAdresse(query: string) {
    if (query.length < 3) {
      this.adresseOptions.set([]);
      return;
    }

    const codePostal = this.compteForm.get('codePostal')?.value ?? '';
    const ville = this.compteForm.get('ville')?.value ?? '';
    if (codePostal || ville) {
      this.skipCpVilleReset = true;
      this.compteForm.patchValue({ codePostal: '', ville: '' }, { emitEvent: false });
      this.villesDisponibles.set([]);
      this.villeOptions.set([]);
      this.stateService.updateCompte(this.compteForm.value);
      this.skipCpVilleReset = false;
    }

    this.isLoadingAdresse.set(true);
    this.geoApiService.getAddressSuggestions(query, { limit: 8 }).subscribe({
      next: (suggestions: AddressSuggestion[]) => {
        this.currentAddressSuggestions.set(suggestions);
        this.adresseOptions.set(
          suggestions.map(s => ({
            value: s.label,
            label: s.name,
            subtitle: s.postcode && s.city ? `${s.postcode} ${s.city}` : s.context || ''
          }))
        );
        this.isLoadingAdresse.set(false);
      },
      error: () => {
        this.adresseOptions.set([]);
        this.isLoadingAdresse.set(false);
      }
    });
  }

  onAdresseSelected(option: AutocompleteOption) {
    const suggestion = this.currentAddressSuggestions()
      .find(s => s.label === option.value);

    if (suggestion) {
      this.skipCpVilleReset = true;
      this.patchCompteFields({
        adresse: suggestion.name,
        codePostal: suggestion.postcode || '',
        ville: suggestion.city || ''
      });

      if (suggestion.postcode && /^\d{5}$/.test(suggestion.postcode)) {
        this.fetchVillesByCodePostal(suggestion.postcode, suggestion.city || undefined);
      }
      this.skipCpVilleReset = false;
    }
  }

  fetchVillesByCodePostal(codePostal: string, villePrefill?: string) {
    this.isLoadingVilles.set(true);
    this.geoApiService.getCommunesByCodePostal(codePostal).subscribe({
      next: (communes: Commune[]) => {
        this.villesDisponibles.set(communes);
        this.updateVilleOptions(communes);
        this.isLoadingVilles.set(false);

        if (villePrefill && communes.some(c => c.nom === villePrefill)) {
          this.skipEffectFetch = true;
          this.compteForm.patchValue({ ville: villePrefill }, { emitEvent: false });
          this.stateService.updateCompte(this.compteForm.value);
          this.skipEffectFetch = false;
        } else if (communes.length === 1) {
          this.skipCpVilleReset = true;
          this.skipEffectFetch = true;
          this.compteForm.patchValue({ ville: communes[0].nom }, { emitEvent: false });
          this.stateService.updateCompte(this.compteForm.value);
          this.skipCpVilleReset = false;
          this.skipEffectFetch = false;
        } else if (communes.length === 0) {
          this.skipEffectFetch = true;
          this.compteForm.patchValue({ ville: '' }, { emitEvent: false });
          this.stateService.updateCompte(this.compteForm.value);
          this.skipEffectFetch = false;
        }
      },
      error: () => {
        this.villesDisponibles.set([]);
        this.villeOptions.set([]);
        this.isLoadingVilles.set(false);
      }
    });
  }

  onSearchVille(query: string) {
    const communes = this.villesDisponibles();
    const q = query.toLowerCase().trim();
    const filtered = q
      ? communes.filter(c => c.nom.toLowerCase().includes(q))
      : communes;
    this.updateVilleOptions(filtered);
  }

  private updateVilleOptions(communes: Commune[]) {
    this.villeOptions.set(
      communes.map(c => ({ value: c.nom, label: c.nom }))
    );
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
      if (this.isEditMode()) {
        const id = this.stateService.currentId();
        if (id) {
          const updateData = {
            fiches: [{
              ID: id,
              siret: this.compteForm.value.siret,
              tva: this.compteForm.value.tvaIntra,
              entite: this.compteForm.value.nomSociete,
              adresse: this.compteForm.value.adresse,
              code_postal: this.compteForm.value.codePostal,
              ville: this.compteForm.value.ville,
              activite_principale: this.compteForm.value.codeNaf,
              libelle_activite: this.compteForm.value.activitePrincipale,
              rayon_action: this.compteForm.value.rayonAction,
              filiales: Number(this.compteForm.value.filiales) || 0
            }]
          };

          this.apiService.updateConvention(id, updateData).subscribe({
            next: () => {
              this.isLoading.set(false);
              this.stateService.updateCompte(this.compteForm.value);
              this.next.emit();
            },
            error: (err) => {
              this.isLoading.set(false);
              this.errorMessage.set("Une erreur est survenue lors de la mise à jour.");
              console.error(err);
            }
          });
        }
      } else {
        this.stateService.updateCompte(this.compteForm.value);
        this.next.emit();
      }
    } else {
      this.compteForm.markAllAsTouched();
    }
  }

  onClear() {
    this.stateService.clearData();
    this.compteForm.reset();
    this.closeSocieteResults();
    this.societeSuggestions.set([]);
    this.societeSearchError.set(null);
    this.villesDisponibles.set([]);
    this.villeOptions.set([]);
    this.adresseOptions.set([]);
    this.currentAddressSuggestions.set([]);
  }
}
