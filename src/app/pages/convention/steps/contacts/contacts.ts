import { Component, inject, OnInit, signal, AfterViewInit } from '@angular/core';
import { FormBuilder, FormGroup, Validators, ReactiveFormsModule, FormControl } from '@angular/forms';
import { debounceTime, distinctUntilChanged } from 'rxjs/operators';
import { ConventionService } from '../../../../services/convention.service';
import { CommonModule } from '@angular/common';
import { UIComponents } from '../../../../components/ui-components';
import { ContactsData } from '../../../../models/convention.interface';
import { GeoApiService, Commune } from '../../../../services/geo-api.service';
import { initFlowbite } from 'flowbite';
import { bindReadOnlyForm } from '../../../../utils/form-readonly';

const CONTACT_TYPES = ['commercial', 'relance', 'priseEnCharge', 'comptabilite'] as const;
const CONTACT_TARGETS = ['primary', 'backup'] as const;

@Component({
  selector: 'app-contacts',
  standalone: true,
  imports: [ReactiveFormsModule, CommonModule, UIComponents],
  templateUrl: './contacts.html',
  styleUrl: './contacts.css',
})
export class Contacts implements OnInit, AfterViewInit {
  private fb = inject(FormBuilder);
  private conventionService = inject(ConventionService);
  private geoApiService = inject(GeoApiService);

  isLoading = signal(false);
  errorMessage = signal<string | null>(null);
  isReadOnly = this.conventionService.isReadOnly;

  // Villes trouvées par code postal, par contact (clé: "type.target")
  private villesDisponibles = signal<Record<string, Commune[]>>({});
  private isLoadingVilles = signal<Record<string, boolean>>({});

  contactsForm: FormGroup = this.fb.group({
    commercial: this.createContactPair(),
    relance: this.createContactPair(),
    priseEnCharge: this.createContactPair(),
    comptabilite: this.createContactPair()
  });

  constructor() {
    bindReadOnlyForm(this.contactsForm, () => this.conventionService.isReadOnly());
  }

  ngOnInit() {
    const data = this.conventionService.getContacts();
    if (data) {
      this.contactsForm.patchValue(data, { emitEvent: false });
    }

    // Save changes to service (and thus localStorage) automatically
    this.contactsForm.valueChanges.pipe(
      debounceTime(300)
    ).subscribe(value => {
      this.conventionService.updateContacts(value as ContactsData);
    });

    this.watchCodePostalChanges();
  }

  private watchCodePostalChanges() {
    for (const type of CONTACT_TYPES) {
      for (const target of CONTACT_TARGETS) {
        const key = `${type}.${target}`;
        this.contactsForm.get(`${key}.codePostal`)?.valueChanges.pipe(
          debounceTime(300),
          distinctUntilChanged()
        ).subscribe((codePostal: string) => {
          if (codePostal && /^\d{5}$/.test(codePostal)) {
            this.fetchVillesForContact(key, codePostal);
          } else {
            this.villesDisponibles.update(m => ({ ...m, [key]: [] }));
          }
        });
      }
    }
  }

  private fetchVillesForContact(key: string, codePostal: string) {
    this.isLoadingVilles.update(m => ({ ...m, [key]: true }));
    this.geoApiService.getCommunesByCodePostal(codePostal).subscribe({
      next: (communes: Commune[]) => {
        this.villesDisponibles.update(m => ({ ...m, [key]: communes }));
        this.isLoadingVilles.update(m => ({ ...m, [key]: false }));

        // Ne pré-remplit la ville que si elle n'est pas déjà renseignée
        const villeControl = this.contactsForm.get(`${key}.ville`);
        if (communes.length === 1 && !villeControl?.value) {
          villeControl?.setValue(communes[0].nom);
        }
      },
      error: () => {
        this.villesDisponibles.update(m => ({ ...m, [key]: [] }));
        this.isLoadingVilles.update(m => ({ ...m, [key]: false }));
      }
    });
  }

  villesDisponiblesFor(type: string, target: 'primary' | 'backup'): Commune[] {
    return this.villesDisponibles()[`${type}.${target}`] ?? [];
  }

  isLoadingVillesFor(type: string, target: 'primary' | 'backup'): boolean {
    return this.isLoadingVilles()[`${type}.${target}`] ?? false;
  }

  ngAfterViewInit() {
    initFlowbite();
  }

  createContactPair(): FormGroup {
    return this.fb.group({
      primary: this.createContactGroup(),
      backup: this.createContactGroup()
    });
  }

  createContactGroup(contact?: any): FormGroup {
    return this.fb.group({
      nom: [contact?.nom || ''],
      prenom: [contact?.prenom || ''],
      fonction: [contact?.fonction || ''],
      email: [contact?.email || '', [Validators.email]],
      telephone: [contact?.telephone || ''],
      adresse: [contact?.adresse || ''],
      codePostal: [contact?.codePostal || ''],
      ville: [contact?.ville || '']
    });
  }

  getControl(type: string, target: 'primary' | 'backup', fieldName: string): FormControl {
    const control = this.contactsForm.get(`${type}.${target}.${fieldName}`);
    if (!control) {
      throw new Error(`Le champ ${type}.${target}.${fieldName} n'existe pas.`);
    }
    return control as FormControl;
  }

  duplicateToBackup(type: string) {
    const primaryValue = this.contactsForm.get(`${type}.primary`)?.value;
    if (primaryValue) {
      this.contactsForm.get(`${type}.backup`)?.patchValue(primaryValue);
    }
  }

  duplicateCommercialTo(type: string) {
    const commercialPrimary = this.contactsForm.get('commercial.primary')?.value;
    if (commercialPrimary) {
      this.contactsForm.get(`${type}.primary`)?.patchValue(commercialPrimary);
    }
  }

}
