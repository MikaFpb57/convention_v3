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

  facturationForm: FormGroup = this.fb.group({
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
