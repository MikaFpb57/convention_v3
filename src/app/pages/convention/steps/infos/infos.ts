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

  ngOnInit() {
    const data = this.conventionService.getInfos();
    if (data) {
      this.infosForm.patchValue(data);
    }

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
