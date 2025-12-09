import { Component, inject, OnInit, signal, Output, EventEmitter } from '@angular/core';
import { FormBuilder, FormGroup, FormArray, Validators, ReactiveFormsModule, FormControl } from '@angular/forms';
import { debounceTime } from 'rxjs/operators';
import { ConventionService } from '../../../../services/convention.service';
import { CommonModule } from '@angular/common';
import { UIComponents } from '../../../../components/ui-components';

@Component({
  selector: 'app-contacts',
  standalone: true,
  imports: [ReactiveFormsModule, CommonModule, UIComponents],
  templateUrl: './contacts.html',
  styleUrl: './contacts.css',
})
export class Contacts implements OnInit {
  private fb = inject(FormBuilder);
  private conventionService = inject(ConventionService);

  isLoading = signal(false);
  errorMessage = signal<string | null>(null);

  contactsForm: FormGroup = this.fb.group({
    contacts: this.fb.array([])
  });

  @Output() next = new EventEmitter<void>();

  ngOnInit() {
    const data = this.conventionService.getContacts();
    if (data && data.contacts && data.contacts.length > 0) {
      data.contacts.forEach(contact => {
        this.addContact(contact);
      });
    } else {
      // Add at least one contact by default
      this.addContact();
    }

    // Save changes to service (and thus localStorage) automatically
    this.contactsForm.valueChanges.pipe(
      debounceTime(300)
    ).subscribe(value => {
      this.conventionService.updateContacts(value);
    });
  }

  get contacts(): FormArray {
    return this.contactsForm.get('contacts') as FormArray;
  }

  addContact(contact?: any) {
    const contactGroup = this.fb.group({
      nom: [contact?.nom || '', Validators.required],
      prenom: [contact?.prenom || '', Validators.required],
      fonction: [contact?.fonction || '', Validators.required],
      email: [contact?.email || '', [Validators.required, Validators.email]],
      telephone: [contact?.telephone || '', Validators.required],
      adresse: [contact?.adresse || '', Validators.required],
      codePostal: [contact?.codePostal || '', Validators.required],
      ville: [contact?.ville || '', Validators.required]
    });

    this.contacts.push(contactGroup);
  }

  removeContact(index: number) {
    this.contacts.removeAt(index);
  }

  getControl(index: number, fieldName: string): FormControl {
    const control = this.contacts.at(index).get(fieldName);
    if (!control) {
      throw new Error(`Le champ ${fieldName} n'existe pas dans le FormGroup.`);
    }
    if (!(control instanceof FormControl)) {
      throw new Error(`Le champ ${fieldName} n'est pas un FormControl.`);
    }
    return control;
  }

  onSubmit() {
    if (this.contactsForm.valid) {
      this.conventionService.updateContacts(this.contactsForm.value);
      this.next.emit();
    } else {
      this.contactsForm.markAllAsTouched();
    }
  }

  onClear() {
    this.contacts.clear();
    this.addContact();
  }
}
