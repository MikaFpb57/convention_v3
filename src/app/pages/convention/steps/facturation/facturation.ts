import { Component, inject, OnInit, signal, Output, EventEmitter, effect } from '@angular/core';
import { FormBuilder, FormGroup, Validators, ReactiveFormsModule, FormControl } from '@angular/forms';
import { debounceTime, distinctUntilChanged, filter } from 'rxjs/operators';
import { ConventionService } from '../../../../services/convention.service';
import { ConventionService as ConventionApiService, MatrixValue } from '../../../../services/convention';
import { GeoApiService, Commune, AddressSuggestion } from '../../../../services/geo-api.service';
import { CommonModule } from '@angular/common';
import { UIComponents } from '../../../../components/ui-components';
import { AutocompleteOption } from '../../../../components/comp-autocomplete/comp-autocomplete.component';
import { bindReadOnlyForm } from '../../../../utils/form-readonly';

@Component({
  selector: 'app-facturation',
  standalone: true,
  imports: [ReactiveFormsModule, CommonModule, UIComponents],
  templateUrl: './facturation.html',
  styleUrl: './facturation.css',
})
export class Facturation implements OnInit {
  private fb = inject(FormBuilder);
  private conventionService = inject(ConventionService);
  private conventionApiService = inject(ConventionApiService);
  private geoApiService = inject(GeoApiService);

  isLoading = signal(false);
  errorMessage = signal<string | null>(null);
  isReadOnly = this.conventionService.isReadOnly;

  // Signals pour l'autocomplétion d'adresse
  adresseOptions = signal<AutocompleteOption[]>([]);
  currentAddressSuggestions = signal<AddressSuggestion[]>([]);
  isLoadingAdresse = signal(false);

  // Signal pour les villes disponibles
  villesDisponibles = signal<Commune[]>([]);
  isLoadingVilles = signal(false);

  // Signals pour les listes Matrix
  delaiPaiementOptions = signal<MatrixValue[]>([]);
  modePaiementOptions = signal<MatrixValue[]>([]);
  delaiReglementOptions = signal<MatrixValue[]>([]);
  freqTransmissionOptions = signal<MatrixValue[]>([]);

  gestionOptions = [
    { value: 'majmail', label: '0% centralisé - Envoi par mail par le centre', demat: 0 },
    { value: 'majpapier', label: '0% centralisé - Envoi papier par le centre', demat: 0 },
    { value: 'maj50', label: '50% centralisé - EDI pour la partie assurancielle (HT) + centre', demat: 1 },
    { value: 'maj5050', label: '100% centralisé - EDI pour la partie assurancielle (HT) + MAJNET', demat: 1 },
    { value: 'maj100', label: '100% centralisé - Un seul régleur pour la totalité de la facture', demat: 1 }
  ];

  facturationForm: FormGroup = this.fb.group({
    demat: [0],
    mode_gest: ['', Validators.required],
    email_demat: ['', Validators.email],
    email_demat_2: ['', Validators.email],
    adresseFacturation: [''],
    codePostalFacturation: [''],
    villeFacturation: [''],
    emailFacturation: ['', Validators.email],
    delaiPaiement: [''],
    modePaiement: [''],
    delaiReglement: [''],
    freqTransmission: ['']
  });

  @Output() next = new EventEmitter<void>();

  constructor() {
    bindReadOnlyForm(this.facturationForm, () => this.conventionService.isReadOnly());
    effect(() => {
      const data = this.conventionService.getFacturation();
      if (data) {
        this.facturationForm.patchValue(data, { emitEvent: false });
      }
    });
  }

  ngOnInit() {
    // Charger les listes Matrix
    this.loadDelaiPaiementOptions();
    this.loadModePaiementOptions();
    this.loadDelaiReglementOptions();
    this.loadFreqTransmissionOptions();

    // Save changes to service (and thus localStorage) automatically
    this.facturationForm.valueChanges.pipe(
      debounceTime(300)
    ).subscribe(value => {
      this.conventionService.updateFacturation(value);
    });

    // Écouter les changements du code postal pour récupérer les villes
    this.facturationForm.get('codePostalFacturation')?.valueChanges.pipe(
      debounceTime(300),
      distinctUntilChanged(),
      filter(value => value && value.length === 5 && /^\d{5}$/.test(value))
    ).subscribe(codePostal => {
      this.fetchVillesByCodePostal(codePostal);
    });

    // Validation dynamique : email_demat obligatoire si demat coché
    this.facturationForm.get('demat')?.valueChanges.subscribe(dematValue => {
      const emailDematControl = this.facturationForm.get('email_demat');
      if (dematValue === 1) {
        emailDematControl?.setValidators([Validators.required, Validators.email]);
      } else {
        emailDematControl?.setValidators([Validators.email]);
      }
      emailDematControl?.updateValueAndValidity();
    });
  }

  /**
   * Recherche d'adresses en temps réel via l'API Adresse
   */
  onSearchAdresse(query: string) {
    if (query.length < 3) {
      this.adresseOptions.set([]);
      return;
    }

    this.isLoadingAdresse.set(true);
    this.geoApiService.getAddressSuggestions(query, { limit: 5 }).subscribe({
      next: (suggestions: AddressSuggestion[]) => {
        // Stocker les suggestions complètes pour usage ultérieur
        this.currentAddressSuggestions.set(suggestions);

        // Transformer pour l'autocomplete
        this.adresseOptions.set(
          suggestions.map(s => ({
            value: s.label,
            label: s.name,
            subtitle: s.postcode && s.city ? `${s.postcode} ${s.city}` : s.context || ''
          }))
        );
        this.isLoadingAdresse.set(false);
      },
      error: (err: any) => {
        console.error('Erreur lors de la recherche d\'adresses:', err);
        this.adresseOptions.set([]);
        this.isLoadingAdresse.set(false);
      }
    });
  }

  /**
   * Quand l'utilisateur sélectionne une adresse
   * → Remplir automatiquement l'adresse, le CP et la Ville !
   */
  onAdresseSelected(option: AutocompleteOption) {
    const suggestion = this.currentAddressSuggestions()
      .find(s => s.label === option.value);

    if (suggestion) {
      // Remplir les 3 champs automatiquement
      this.facturationForm.patchValue({
        adresseFacturation: suggestion.name,
        codePostalFacturation: suggestion.postcode || '',
        villeFacturation: suggestion.city || ''
      }, { emitEvent: false }); // emitEvent: false pour éviter de déclencher l'autocomplete ville

      // Mettre à jour manuellement le service car emitEvent: false
      this.conventionService.updateFacturation(this.facturationForm.value);
    }
  }

  /**
   * Charge les options de délai de paiement depuis l'API
   */
  loadDelaiPaiementOptions() {
    this.conventionApiService.getListeMatrix('delaipaie').subscribe({
      next: (response) => {
        this.delaiPaiementOptions.set(response.values);
      },
      error: (err: any) => {
        console.error('Erreur lors du chargement des délais de paiement:', err);
        this.delaiPaiementOptions.set([]);
      }
    });
  }

  /**
   * Charge les options de mode de paiement depuis l'API
   */
  loadModePaiementOptions() {
    this.conventionApiService.getListeMatrix('mode_paie').subscribe({
      next: (response) => {
        this.modePaiementOptions.set(response.values);
      },
      error: (err: any) => {
        console.error('Erreur lors du chargement des modes de paiement:', err);
        this.modePaiementOptions.set([]);
      }
    });
  }

  /**
   * Charge les options de délai de règlement depuis l'API
   */
  loadDelaiReglementOptions() {
    this.conventionApiService.getListeMatrix('mode_paie').subscribe({
      next: (response) => {
        this.delaiReglementOptions.set(response.values);
      },
      error: (err: any) => {
        console.error('Erreur lors du chargement des délais de règlement:', err);
        this.delaiReglementOptions.set([]);
      }
    });
  }

  /**
   * Charge les options de fréquence de transmission depuis l'API
   */
  loadFreqTransmissionOptions() {
    this.conventionApiService.getListeMatrix('freq_envoi').subscribe({
      next: (response) => {
        this.freqTransmissionOptions.set(response.values);
      },
      error: (err: any) => {
        console.error('Erreur lors du chargement des fréquences de transmission:', err);
        this.freqTransmissionOptions.set([]);
      }
    });
  }

  /**
   * Récupère les villes correspondant au code postal saisi
   */
  fetchVillesByCodePostal(codePostal: string) {
    this.isLoadingVilles.set(true);
    this.geoApiService.getCommunesByCodePostal(codePostal).subscribe({
      next: (communes: Commune[]) => {
        this.villesDisponibles.set(communes);
        this.isLoadingVilles.set(false);

        // Si une seule ville, la sélectionner automatiquement
        if (communes.length === 1) {
          this.facturationForm.get('villeFacturation')?.setValue(communes[0].nom);
        } else if (communes.length === 0) {
          // Aucune ville trouvée, réinitialiser
          this.facturationForm.get('villeFacturation')?.setValue('');
        }
      },
      error: (err: any) => {
        console.error('Erreur lors de la récupération des villes:', err);
        this.villesDisponibles.set([]);
        this.isLoadingVilles.set(false);
      }
    });
  }

  getControl(fieldName: string): FormControl {
    const control = this.facturationForm.get(fieldName);
    if (!control) {
      throw new Error(`Le champ ${fieldName} n'existe pas dans le FormGroup.`);
    }
    if (!(control instanceof FormControl)) {
      throw new Error(`Le champ ${fieldName} n'est pas un FormControl.`);
    }
    return control;
  }

  onToggleChange(fieldName: string, event: any) {
    const value = event.target.checked ? 1 : 0;
    this.facturationForm.get(fieldName)?.setValue(value);
  }

  getFilteredGestionOptions() {
    const dematValue = this.facturationForm.get('demat')?.value || 0;
    return this.gestionOptions.filter(option => option.demat === Number(dematValue));
  }

  onSubmit() {
    if (this.facturationForm.valid) {
      this.conventionService.updateFacturation(this.facturationForm.value);
      this.next.emit();
    } else {
      this.facturationForm.markAllAsTouched();
    }
  }

  onClear() {
    this.facturationForm.reset();
    this.villesDisponibles.set([]);
    this.adresseOptions.set([]);
    this.currentAddressSuggestions.set([]);
  }
}
