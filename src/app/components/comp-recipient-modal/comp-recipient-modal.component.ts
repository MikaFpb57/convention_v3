import { Component, Input, Output, EventEmitter, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormBuilder, FormGroup, ReactiveFormsModule, Validators } from '@angular/forms';
import { CompButtonComponent } from '../comp-button/comp-button.component';
import { CompInputComponent } from '../comp-input/comp-input.component';

export interface RecipientData {
  nom: string;
  prenom: string;
  fonction: string;
  email: string;
}

@Component({
  selector: 'comp-recipient-modal',
  standalone: true,
  imports: [CommonModule, ReactiveFormsModule, CompButtonComponent, CompInputComponent],
  templateUrl: './comp-recipient-modal.component.html',
  styleUrls: ['./comp-recipient-modal.component.css']
})
export class CompRecipientModalComponent {
  @Input() isOpen = false;
  @Output() submit = new EventEmitter<RecipientData>();
  @Output() close = new EventEmitter<void>();

  private fb = inject(FormBuilder);

  recipientForm: FormGroup = this.fb.group({
    nom: ['', [Validators.required]],
    prenom: ['', [Validators.required]],
    fonction: ['', [Validators.required]],
    email: ['', [Validators.required, Validators.email]]
  });

  onSubmit() {
    if (this.recipientForm.valid) {
      this.submit.emit(this.recipientForm.value as RecipientData);
    } else {
      this.recipientForm.markAllAsTouched();
    }
  }

  onClose() {
    this.close.emit();
  }
}
