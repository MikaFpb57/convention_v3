import { Component, OnInit, inject, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormBuilder, FormControl, FormGroup, ReactiveFormsModule, Validators } from '@angular/forms';
import { debounceTime } from 'rxjs/operators';
import { ConventionService } from '../../../../services/convention.service';
import { ConventionService as ConventionApiService } from '../../../../services/convention';
import { UIComponents } from '../../../../components/ui-components';
import { SignatureData } from '../../../../models/convention.interface';
import { bindReadOnlyForm } from '../../../../utils/form-readonly';

@Component({
  selector: 'app-signature-step',
  standalone: true,
  imports: [CommonModule, ReactiveFormsModule, UIComponents],
  templateUrl: './signature.html',
  styleUrl: './signature.css',
})
export class SignatureStep implements OnInit {
  private fb = inject(FormBuilder);
  private conventionService = inject(ConventionService);
  private apiService = inject(ConventionApiService);
  private readonly SIGNATURE_VALIDITY_DAYS = 60;

  isLoading = signal(false);
  errorMessage = signal<string | null>(null);
  successMessage = signal<string | null>(null);
  isReadOnly = this.conventionService.isReadOnly;

  signatureForm: FormGroup = this.fb.group({
    nom: ['', [Validators.required]],
    prenom: ['', [Validators.required]],
    fonction: ['', [Validators.required]],
    emailSignataire: ['', [Validators.required, Validators.email]],
    certifie: [false],
    signatureImage: [''],
    mode: ['remote-email-otp'],
    statut: ['draft'],
    signatureRequestId: [''],
    requestSentAt: [''],
    expiresAt: [''],
    otpCode: [''],
    otpVerifiedAt: [''],
    signedAt: ['']
  });

  private toComparable(value: any): any {
    const src = value ?? {};
    const { otpCode, ...rest } = src;
    return rest;
  }

  private isSameSignatureState(formValue: any, serviceValue: any): boolean {
    return JSON.stringify(this.toComparable(formValue)) === JSON.stringify(this.toComparable(serviceValue));
  }

  constructor() {
    bindReadOnlyForm(this.signatureForm, () => this.conventionService.isReadOnly());
    this.signatureForm.valueChanges.pipe(
      debounceTime(200)
    ).subscribe(value => {
      const { otpCode, ...signatureState } = value;
      this.conventionService.updateSignature(signatureState as SignatureData);
    });
  }

  ngOnInit(): void {
    const data = this.conventionService.getSignature();
    if (!data) return;
    const current = this.signatureForm.getRawValue();
    if (this.isSameSignatureState(current, data)) return;
    this.signatureForm.patchValue(data, { emitEvent: false });
  }

  get validityDays(): number {
    return this.SIGNATURE_VALIDITY_DAYS;
  }

  get statusText(): string {
    const status = this.signatureForm.get('statut')?.value;
    if (status === 'verified') return 'Signé';
    if (status === 'pending_email') return 'En attente';
    return 'Brouillon';
  }

  formatFrDate(value: string | null | undefined): string {
    if (!value) return '';
    const date = new Date(value);
    if (isNaN(date.getTime())) return value;
    return new Intl.DateTimeFormat('fr-FR', {
      day: '2-digit',
      month: '2-digit',
      year: 'numeric',
      hour: '2-digit',
      minute: '2-digit',
      second: '2-digit'
    }).format(date);
  }

  getControl(fieldName: string): FormControl {
    const control = this.signatureForm.get(fieldName);
    if (!control) {
      throw new Error(`Le champ ${fieldName} n'existe pas dans le FormGroup.`);
    }
    if (!(control instanceof FormControl)) {
      throw new Error(`Le champ ${fieldName} n'est pas un FormControl.`);
    }
    return control;
  }

  async requestSignatureByEmail() {
    if (this.isReadOnly()) return;

    this.errorMessage.set(null);
    this.successMessage.set(null);

    const currentId = this.conventionService.currentId();
    if (!currentId) {
      this.errorMessage.set('Aucune convention active. Créez ou chargez une convention d\'abord.');
      return;
    }

    if (this.getControl('nom').invalid || this.getControl('prenom').invalid || this.getControl('fonction').invalid || this.getControl('emailSignataire').invalid) {
      this.signatureForm.markAllAsTouched();
      this.errorMessage.set('Renseigne les informations du signataire et son email avant l\'envoi.');
      return;
    }

    const isResend = !!this.getControl('signatureRequestId').value;

    this.isLoading.set(true);

    this.apiService.requestEmailSignature({
      conventionId: currentId,
      nom: this.getControl('nom').value,
      prenom: this.getControl('prenom').value,
      fonction: this.getControl('fonction').value,
      email: this.getControl('emailSignataire').value,
      validityDays: this.SIGNATURE_VALIDITY_DAYS
    }).subscribe({
      next: (response) => {
        this.signatureForm.patchValue({
          statut: response.status,
          signatureRequestId: response.requestId,
          requestSentAt: response.sentAt,
          expiresAt: response.expiresAt,
          otpCode: '',
          otpVerifiedAt: '',
          signedAt: ''
        });
        const message = isResend
          ? 'Nouveau code envoyé par email au partenaire.'
          : (response.message ?? 'Email de signature envoyé au partenaire.');
        this.successMessage.set(message);
        this.isLoading.set(false);
      },
      error: () => {
        this.errorMessage.set('Impossible d\'envoyer la demande de signature pour le moment.');
        this.isLoading.set(false);
      }
    });
  }

  verifyOtpCode() {
    if (this.isReadOnly()) return;

    this.errorMessage.set(null);
    this.successMessage.set(null);

    const currentId = this.conventionService.currentId();
    const requestId = this.getControl('signatureRequestId').value;
    const otpCode = this.getControl('otpCode').value;

    if (!currentId || !requestId) {
      this.errorMessage.set('Aucune demande active à vérifier. Lance d\'abord l\'envoi par email.');
      return;
    }

    if (!otpCode || otpCode.trim().length < 4) {
      this.errorMessage.set('Saisis le code de vérification reçu par email.');
      return;
    }

    this.isLoading.set(true);
    this.apiService.verifyEmailSignatureOtp({
      conventionId: currentId,
      requestId,
      otpCode: otpCode.trim()
    }).subscribe({
      next: (response) => {
        const signedAt = response.verifiedAt;
        this.signatureForm.patchValue({
          statut: response.status,
          otpVerifiedAt: response.verifiedAt,
          signedAt,
          certifie: true
        });
        this.conventionService.markAsSigned();
        this.successMessage.set(response.message ?? 'Code validé. Signature partenaire vérifiée. Actualisation de la page...');
        this.isLoading.set(false);
        // Recharge la page pour afficher le PDF définitif (onglet Documents) et la piste d'audit à jour
        setTimeout(() => window.location.reload(), 1500);
      },
      error: () => {
        this.errorMessage.set('Code invalide ou expiré. Demande un nouveau code si nécessaire.');
        this.isLoading.set(false);
      }
    });
  }

  onSubmit() {
    if (this.signatureForm.get('statut')?.value !== 'verified') {
      this.errorMessage.set('La signature n\'est pas finalisée: vérifie d\'abord le code email du partenaire.');
      return;
    }

    const { otpCode, ...signatureState } = this.signatureForm.value;
    this.conventionService.updateSignature(signatureState as SignatureData);
    this.errorMessage.set(null);
    this.successMessage.set('Parcours de signature finalisé et prêt à être persisté.');
    if (!this.signatureForm.valid) {
      this.signatureForm.markAllAsTouched();
    }
  }

}
