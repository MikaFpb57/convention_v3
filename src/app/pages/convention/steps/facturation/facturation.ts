import { Component, inject, OnInit, signal, Output, EventEmitter } from '@angular/core';
import { FormBuilder, FormGroup, Validators, ReactiveFormsModule, FormControl } from '@angular/forms';
import { debounceTime } from 'rxjs/operators';
import { ConventionService } from '../../../../services/convention.service';
import { CommonModule } from '@angular/common';
import { UIComponents } from '../../../../components/ui-components';

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

  isLoading = signal(false);
  errorMessage = signal<string | null>(null);

  gestionOptions = [
    { value: 'majmail', label: '0% centralisé - Envoi par mail par le centre', demat: 0 },
    { value: 'majpapier', label: '0% centralisé - Envoi papier par le centre', demat: 0 },
    { value: 'maj50', label: '50% centralisé - EDI pour la partie assurancielle (HT) + centre', demat:1 },
    { value: 'maj5050', label: '100% centralisé - EDI pour la partie assurancielle (HT) + MAJNET', demat:1 },
    { value: 'maj100', label: '100% centralisé - Un seul régleur pour la totalité de la facture', demat:1 }
  ];

  facturationForm: FormGroup = this.fb.group({
    demat: [0],
    mode_gest: ['', Validators.required],
    adresseFacturation: [''],
    codePostalFacturation: [''],
    villeFacturation: [''],
    emailFacturation: ['', Validators.email],
    delaiPaiement: [''],
    modePaiement: ['']
  });

  @Output() next = new EventEmitter<void>();

  ngOnInit() {
    const data = this.conventionService.getFacturation();
    if (data) {
      this.facturationForm.patchValue(data);
    }

    // Save changes to service (and thus localStorage) automatically
    this.facturationForm.valueChanges.pipe(
      debounceTime(300)
    ).subscribe(value => {
      this.conventionService.updateFacturation(value);
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
  }
}
