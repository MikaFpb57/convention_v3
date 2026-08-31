import { Component, inject, OnInit, signal, AfterViewInit, effect } from '@angular/core';
import { FormBuilder, FormGroup, Validators, ReactiveFormsModule, FormControl } from '@angular/forms';
import { debounceTime } from 'rxjs/operators';
import { ConventionService } from '../../../../services/convention.service';
import { CommonModule } from '@angular/common';
import { UIComponents } from '../../../../components/ui-components';
import { ContactsData } from '../../../../models/convention.interface';
import { initFlowbite } from 'flowbite';
import { bindReadOnlyForm } from '../../../../utils/form-readonly';

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

  isLoading = signal(false);
  errorMessage = signal<string | null>(null);
  isReadOnly = this.conventionService.isReadOnly;

  contactsForm: FormGroup = this.fb.group({
    commercial: this.createContactPair(),
    relance: this.createContactPair(),
    priseEnCharge: this.createContactPair(),
    comptabilite: this.createContactPair()
  });

  constructor() {
    bindReadOnlyForm(this.contactsForm, () => this.conventionService.isReadOnly());
    effect(() => {
      const data = this.conventionService.getContacts();
      if (data) {
        this.contactsForm.patchValue(data, { emitEvent: false });
      }
    });
  }

  ngOnInit() {
    // Save changes to service (and thus localStorage) automatically
    this.contactsForm.valueChanges.pipe(
      debounceTime(300)
    ).subscribe(value => {
      this.conventionService.updateContacts(value as ContactsData);
    });
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
