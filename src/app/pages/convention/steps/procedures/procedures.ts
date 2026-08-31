import { Component, inject, OnInit, signal, Output, EventEmitter, effect } from '@angular/core';
import { FormBuilder, FormGroup, Validators, ReactiveFormsModule, FormControl } from '@angular/forms';
import { debounceTime } from 'rxjs/operators';
import { ConventionService } from '../../../../services/convention.service';
import { CommonModule } from '@angular/common';
import { UIComponents } from '../../../../components/ui-components';
import { QuillModule } from 'ngx-quill';
import { bindReadOnlyForm } from '../../../../utils/form-readonly';

@Component({
  selector: 'app-procedures',
  standalone: true,
  imports: [ReactiveFormsModule, CommonModule, UIComponents, QuillModule],
  templateUrl: './procedures.html',
  styleUrl: './procedures.css',
})
export class Procedures implements OnInit {
  private fb = inject(FormBuilder);
  private conventionService = inject(ConventionService);

  isLoading = signal(false);
  errorMessage = signal<string | null>(null);
  isReadOnly = this.conventionService.isReadOnly;

  // Configuration Quill pour HTML propre
  quillModules = {
    toolbar: [
      ['bold', 'italic', 'underline'],        // Formatage de texte
      [{ 'color': [] }],                      // Couleur du texte
      [{ 'list': 'ordered' }, { 'list': 'bullet' }],  // Listes
      [{ 'header': [1, 2, 3, false] }]        // Titres
    ]
  };

  // Options pour les selects multiples
  typePriseEnChargeOptions = [
    { id: 1, label: 'Acceptation tacite' },
    { id: 2, label: 'Accord téléphonique' },
    { id: 3, label: 'Accord Mail' },
    { id: 4, label: 'Validation devis (Contact PEC obligatoire)' },
    { id: 5, label: 'Bon de commande (Contact PEC non obligatoire)' },
    { id: 6, label: 'Procédure assurancielle' },
    { id: 7, label: 'Procédure loueur' }
  ];

  auDepartConducteurOptions = [
    { id: 1, label: 'Conducteur : Copie de la DSPC' },
    { id: 2, label: 'Conducteur : Copie de la facture' },
    { id: 3, label: 'Facture avec DSPC' },
    { id: 4, label: 'Accompagnée du bon de commande' },
    { id: 5, label: 'Accompagnée de la carte grise' },
    { id: 6, label: 'Accompagnée du mémo' }
  ];

  surFactureOptions = [
    { id: 1, label: 'Nom de la personne ayant donné l\'accord' },
    { id: 2, label: 'Numéro du bon de commande' },
    { id: 3, label: 'Nom du conducteur' }
  ];

  proceduresForm: FormGroup = this.fb.group({
    typePriseEnCharge: [[]],
    auDepartConducteur: [[]],
    surFacture: [[]],
    proceduresParticulieres: [''],
    visiblePartenaire: [false]
  });

  // Signals pour le récapitulatif (mis à jour manuellement)
  selectedTypePriseEnCharge = signal<{ id: number; label: string }[]>([]);
  selectedAuDepartConducteur = signal<{ id: number; label: string }[]>([]);
  selectedSurFacture = signal<{ id: number; label: string }[]>([]);

  @Output() next = new EventEmitter<void>();

  constructor() {
    bindReadOnlyForm(this.proceduresForm, () => this.conventionService.isReadOnly());
    effect(() => {
      const data = this.conventionService.getProcedures();
      if (data) {
        this.proceduresForm.patchValue(data, { emitEvent: false });
        this.updateRecapSignals();
      }
    });
  }

  ngOnInit() {
    // Save changes to service (and thus localStorage) automatically
    this.proceduresForm.valueChanges.pipe(
      debounceTime(300)
    ).subscribe(value => {
      this.conventionService.updateProcedures(value);
    });
  }

  // Méthode pour mettre à jour tous les signals de récapitulatif
  private updateRecapSignals() {
    const typePriseEnCharge = this.proceduresForm.get('typePriseEnCharge')?.value || [];
    this.selectedTypePriseEnCharge.set(
      this.typePriseEnChargeOptions.filter(opt => typePriseEnCharge.includes(opt.id))
    );

    const auDepartConducteur = this.proceduresForm.get('auDepartConducteur')?.value || [];
    this.selectedAuDepartConducteur.set(
      this.auDepartConducteurOptions.filter(opt => auDepartConducteur.includes(opt.id))
    );

    const surFacture = this.proceduresForm.get('surFacture')?.value || [];
    this.selectedSurFacture.set(
      this.surFactureOptions.filter(opt => surFacture.includes(opt.id))
    );
  }

  // Gestion des selects multiples
  toggleSelection(controlName: string, optionId: number) {
    if (this.isReadOnly()) return;
    const control = this.proceduresForm.get(controlName);
    if (!control) return;

    // Logique spéciale pour typePriseEnCharge : si Acceptation tacite (id=1) est coché, désélectionner les autres
    if (controlName === 'typePriseEnCharge' && optionId === 1) {
      const currentValue: number[] = control.value || [];
      const index = currentValue.indexOf(optionId);

      if (index > -1) {
        // Déjà sélectionné, on le retire
        control.setValue(currentValue.filter(id => id !== optionId));
      } else {
        // Pas sélectionné, on l'ajoute et on retire tous les autres
        control.setValue([optionId]);
      }
    } else if (controlName === 'typePriseEnCharge' && optionId !== 1) {
      // Si on coche un autre option et que Acceptation tacite est déjà coché, on le retire
      const currentValue: number[] = control.value || [];
      const taciteIndex = currentValue.indexOf(1);

      if (taciteIndex > -1) {
        // Acceptation tacite est coché, on le retire
        control.setValue(currentValue.filter(id => id !== 1));
      }

      // Ensuite on ajoute l'option
      const index = currentValue.indexOf(optionId);
      if (index === -1) {
        control.setValue([...currentValue, optionId]);
      }
    } else {
      // Comportement normal pour les autres contrôles
      const currentValue: number[] = control.value || [];
      const index = currentValue.indexOf(optionId);

      if (index > -1) {
        // Déjà sélectionné, on le retire
        control.setValue(currentValue.filter(id => id !== optionId));
      } else {
        // Pas sélectionné, on l'ajoute
        control.setValue([...currentValue, optionId]);
      }
    }

    // Mettre à jour le récapitulatif immédiatement
    this.updateRecapSignals();
  }

  isSelected(controlName: string, optionId: number): boolean {
    const value = this.proceduresForm.get(controlName)?.value || [];
    return value.includes(optionId);
  }

  getControl(fieldName: string): FormControl {
    const control = this.proceduresForm.get(fieldName);
    if (!control) {
      throw new Error(`Le champ ${fieldName} n'existe pas dans le FormGroup.`);
    }
    if (!(control instanceof FormControl)) {
      throw new Error(`Le champ ${fieldName} n'est pas un FormControl.`);
    }
    return control;
  }

  onSubmit() {
    if (this.proceduresForm.valid) {
      this.conventionService.updateProcedures(this.proceduresForm.value);
      this.next.emit();
    } else {
      this.proceduresForm.markAllAsTouched();
    }
  }

  onClear() {
    this.proceduresForm.reset({
      typePriseEnCharge: [],
      auDepartConducteur: [],
      surFacture: [],
      proceduresParticulieres: '',
      visiblePartenaire: false
    });
  }
}
