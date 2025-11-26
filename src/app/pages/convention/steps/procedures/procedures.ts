import { Component, inject, OnInit, signal, Output, EventEmitter } from '@angular/core';
import { FormBuilder, FormGroup, Validators, ReactiveFormsModule, FormControl } from '@angular/forms';
import { debounceTime } from 'rxjs/operators';
import { ConventionService } from '../../../../services/convention.service';
import { CommonModule } from '@angular/common';
import { UIComponents } from '../../../../components/ui-components';

@Component({
  selector: 'app-procedures',
  standalone: true,
  imports: [ReactiveFormsModule, CommonModule, UIComponents],
  templateUrl: './procedures.html',
  styleUrl: './procedures.css',
})
export class Procedures implements OnInit {
  private fb = inject(FormBuilder);
  private conventionService = inject(ConventionService);

  isLoading = signal(false);
  errorMessage = signal<string | null>(null);

  proceduresForm: FormGroup = this.fb.group({
    procedureQualite: [false],
    certifications: [''],
    assurances: [''],
    documentUnique: [false]
  });

  @Output() next = new EventEmitter<void>();

  ngOnInit() {
    const data = this.conventionService.getProcedures();
    if (data) {
      this.proceduresForm.patchValue(data);
    }

    // Save changes to service (and thus localStorage) automatically
    this.proceduresForm.valueChanges.pipe(
      debounceTime(300)
    ).subscribe(value => {
      this.conventionService.updateProcedures(value);
    });
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
      // Last step - could navigate to signature or show completion message
      this.next.emit();
    } else {
      this.proceduresForm.markAllAsTouched();
    }
  }

  onClear() {
    this.proceduresForm.reset();
  }
}
