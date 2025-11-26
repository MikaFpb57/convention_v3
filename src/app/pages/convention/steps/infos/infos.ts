import { Component, inject, OnInit, signal, Output, EventEmitter } from '@angular/core';
import { FormBuilder, FormGroup, Validators, ReactiveFormsModule, FormControl } from '@angular/forms';
import { debounceTime } from 'rxjs/operators';
import { ConventionService } from '../../../../services/convention.service';
import { CommonModule } from '@angular/common';
import { UIComponents } from '../../../../components/ui-components';

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

  isLoading = signal(false);
  errorMessage = signal<string | null>(null);

  infosForm: FormGroup = this.fb.group({
    effectif: [''],
    chiffreAffaires: [''],
    dateCreation: [''],
    formeJuridique: [''],
    capital: [''],
    rcs: ['']
  });

  @Output() next = new EventEmitter<void>();

  ngOnInit() {
    const data = this.conventionService.getInfos();
    if (data) {
      this.infosForm.patchValue(data);
    }

    // Save changes to service (and thus localStorage) automatically
    this.infosForm.valueChanges.pipe(
      debounceTime(300)
    ).subscribe(value => {
      this.conventionService.updateInfos(value);
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
