import { Component, inject, OnInit, signal, Output, EventEmitter, effect } from '@angular/core';
import { FormBuilder, FormGroup, Validators, ReactiveFormsModule, FormControl } from '@angular/forms';
import { debounceTime } from 'rxjs/operators';
import { ConventionService as ConventionApiService, EntitesResponse, Entite } from '../../../../services/convention';
import { ConventionService } from '../../../../services/convention.service';
import { CommonModule } from '@angular/common';
import { UIComponents } from '../../../../components/ui-components';
import { AutocompleteOption } from '../../../../components/comp-autocomplete/comp-autocomplete.component';
import { bindReadOnlyForm } from '../../../../utils/form-readonly';

@Component({
  selector: 'app-infos',
  standalone: true,
  imports: [ReactiveFormsModule, CommonModule, UIComponents],
  templateUrl: './infos.html',
  styleUrl: './infos.css',
})
export class Infos implements OnInit {
  private fb = inject(FormBuilder);
  private conventionService = inject(ConventionService);
  private conventionApiService = inject(ConventionApiService);

  isLoading = signal(false);
  errorMessage = signal<string | null>(null);
  isReadOnly = this.conventionService.isReadOnly;

  // Options pour les autocompletes
  assuranceOptions = signal<AutocompleteOption[]>([]);
  courtierOptions = signal<AutocompleteOption[]>([]);
  loueurOptions = signal<AutocompleteOption[]>([]);

  tarifsOptions = [
    { value: 'L', label: 'Liberté' },
    { value: 'SC', label: 'Sérénité C' },
    { value: 'SD', label: 'Sérénité D' },
    { value: 'AS', label: 'Base assurance' }
  ];

  infosForm: FormGroup = this.fb.group({
    assurance: [''],
    courtier: [''],
    loueur: [''],
    tarif: ['', Validators.required],
    capital: [''],
    rcs: [''],
    assureBdg: [0],
    recuperationTva: [0],
    nb_vu_vl: [0],
    nb_pl: [0],
    nb_bus: [0],
    nb_tp: [0],
    nb_agri: [0],
    nb_ca: [0],
    nb_total: [{ value: 0, disabled: true }]
  });

  @Output() next = new EventEmitter<void>();

  private isSameState(formValue: any, serviceValue: any): boolean {
    return JSON.stringify(formValue ?? {}) === JSON.stringify(serviceValue ?? {});
  }

  constructor() {
    bindReadOnlyForm(this.infosForm, () => this.conventionService.isReadOnly());
    effect(() => {
      const data = this.conventionService.getInfos();
      if (data) {
        const current = this.infosForm.getRawValue();
        if (this.isSameState(current, data)) {
          return;
        }
        this.infosForm.patchValue(data, { emitEvent: false });
      }
    });
  }

  ngOnInit() {
    this.infosForm.get('nb_total')?.disable({ emitEvent: false });

    // Sauvegarde automatique des changements avec un délai de 300ms
    this.infosForm.valueChanges.pipe(
      debounceTime(300)
    ).subscribe(value => {
      this.conventionService.updateInfos(value);
    });

    // Calcul automatique du total du parc
    this.infosForm.valueChanges
      .pipe(debounceTime(150))
      .subscribe(values => {
        const a = Number(values.nb_vu_vl) || 0;
        const b = Number(values.nb_pl) || 0;
        const c = Number(values.nb_tp) || 0;
        const d = Number(values.nb_bus) || 0;
        const e = Number(values.nb_agri) || 0;
        const f = Number(values.nb_ca) || 0;
        const total = a + b + c + d + e + f;
        this.infosForm.get('nb_total')?.setValue(total, { emitEvent: false });
      });
  }

  getControl(fieldName: string): FormControl {
    const control = this.infosForm.get(fieldName);
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
    this.infosForm.get(fieldName)?.setValue(value);
  }

  /**
   * Recherche des assurances
   */
  onSearchAssurance(searchTerm: string) {
    this.conventionApiService.getListeByType('Assurance').subscribe({
      next: (response: EntitesResponse) => {
        this.assuranceOptions.set(
          response.entites.map((entite: Entite) => ({
            value: entite.as_num,
            label: entite.as_nom,
            subtitle: entite.groupe
          }))
        );
      },
      error: (err: any) => {
        console.error('Erreur lors de la recherche des assurances:', err);
        this.assuranceOptions.set([]);
      }
    });
  }

  /**
   * Recherche des courtiers
   */
  onSearchCourtier(searchTerm: string) {
    this.conventionApiService.getListeByType('Courtier').subscribe({
      next: (response: EntitesResponse) => {
        this.courtierOptions.set(
          response.entites.map((entite: Entite) => ({
            value: entite.as_num,
            label: entite.as_nom,
            subtitle: entite.groupe
          }))
        );
      },
      error: (err: any) => {
        console.error('Erreur lors de la recherche des courtiers:', err);
        this.courtierOptions.set([]);
      }
    });
  }

  /**
   * Recherche des loueurs
   */
  onSearchLoueur(searchTerm: string) {
    this.conventionApiService.getListeByType('Loueur').subscribe({
      next: (response: EntitesResponse) => {
        this.loueurOptions.set(
          response.entites.map((entite: Entite) => ({
            value: entite.as_num,
            label: entite.as_nom,
            subtitle: entite.groupe
          }))
        );
      },
      error: (err: any) => {
        console.error('Erreur lors de la recherche des loueurs:', err);
        this.loueurOptions.set([]);
      }
    });
  }

  onSubmit() {
    if (this.infosForm.valid) {
      this.conventionService.updateInfos(this.infosForm.value);
      this.next.emit();
    } else {
      this.infosForm.markAllAsTouched();
    }
  }

  onClear() {
    this.infosForm.reset();
  }
}
