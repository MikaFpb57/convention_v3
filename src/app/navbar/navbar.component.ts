import { Component, OnInit, inject, ElementRef, ViewChild, HostListener } from '@angular/core';
import { RouterLink } from '@angular/router';
import { AuthService } from '../services/auth.service';
import { Router } from '@angular/router';
import { ReactiveFormsModule, FormsModule, FormBuilder, Validators } from '@angular/forms';
import { ConventionService } from '../services/convention';
import { SireneService } from '../services/sirene.service';
import { CommonModule } from '@angular/common';

@Component({
  selector: 'app-navbar',
  standalone: true,
  imports: [RouterLink, ReactiveFormsModule, FormsModule, CommonModule],
  templateUrl: './navbar.component.html',
  styleUrls: ['./navbar.component.css']
})
export class NavbarComponent implements OnInit {
  private authService = inject(AuthService);
  private router = inject(Router);
  private fb = inject(FormBuilder);
  private conventionApi = inject(ConventionService);
  private sireneService = inject(SireneService);
  private elementRef = inject(ElementRef);

  username: string | null = null;
  isUserMenuOpen = false;
  isNewModalOpen = false;
  isLoadingSiret = false;
  isCreating = false;
  newModalError: string | null = null;

  // Paramètres / signature
  @ViewChild('signatureCanvas') signatureCanvasRef?: ElementRef<HTMLCanvasElement>;
  isSettingsModalOpen = false;
  isLoadingProfile = false;
  isSavingSignature = false;
  isSavingProfile = false;
  settingsError: string | null = null;
  settingsSuccess: string | null = null;
  profile: { nom: string; prenom: string; email: string; fonction: string } = { nom: '', prenom: '', email: '', fonction: '' };
  private isDrawing = false;
  private canvasCtx: CanvasRenderingContext2D | null = null;
  private hasSignatureDrawing = false;

  newConventionForm = this.fb.group({
    siret: ['', [Validators.required, Validators.pattern(/^\d{14}$/)]],
    tva: ['', Validators.required],
    entite: ['', Validators.required],
    adresse: ['', Validators.required],
    code_postal: ['', [Validators.required, Validators.pattern(/^\d{5}$/)]],
    ville: ['', Validators.required],
    activite_principale: [''],
    libelle_activite: [''],
    rayon_action: ['france', Validators.required],
    filiales: [0]
  });

  ngOnInit() {
    this.username = this.authService.getUsername();
  }

  @HostListener('document:click', ['$event'])
  onDocumentClick(event: MouseEvent) {
    if (this.isUserMenuOpen && !this.elementRef.nativeElement.contains(event.target)) {
      this.isUserMenuOpen = false;
    }
  }

  toggleUserMenu(event?: Event) {
    event?.preventDefault();
    event?.stopPropagation();
    this.isUserMenuOpen = !this.isUserMenuOpen;
  }

  logout() {
    this.authService.logout();
  }

  openNewConventionModal(event?: Event) {
    event?.preventDefault();
    event?.stopPropagation();
    this.newModalError = null;
    this.newConventionForm.reset({
      siret: '',
      tva: '',
      entite: '',
      adresse: '',
      code_postal: '',
      ville: '',
      activite_principale: '',
      libelle_activite: '',
      rayon_action: 'france',
      filiales: 0
    });
    this.isNewModalOpen = true;
  }

  closeNewConventionModal() {
    if (this.isCreating) return;
    this.isNewModalOpen = false;
  }

  lookupSiret() {
    this.newModalError = null;
    const siretRaw = this.newConventionForm.get('siret')?.value ?? '';
    const siret = String(siretRaw).replace(/\D/g, '');
    this.newConventionForm.patchValue({ siret });

    if (!/^\d{14}$/.test(siret)) {
      this.newModalError = 'Le SIRET doit contenir 14 chiffres.';
      return;
    }

    this.isLoadingSiret = true;
    this.sireneService.getEtablissement(siret).subscribe({
      next: (data) => {
        if (data?.error) {
          this.newModalError = data.error;
        } else {
          this.newConventionForm.patchValue({
            tva: data.tvaIntra || '',
            entite: data.nomSociete || '',
            adresse: data.adresse || '',
            code_postal: data.codePostal || '',
            ville: data.ville || '',
            activite_principale: data.codeNaf || '',
            libelle_activite: data.activitePrincipale || ''
          });
        }
        this.isLoadingSiret = false;
      },
      error: () => {
        this.newModalError = 'Erreur technique lors de la recherche SIRET.';
        this.isLoadingSiret = false;
      }
    });
  }

  submitNewConvention() {
    if (this.newConventionForm.invalid) {
      this.newConventionForm.markAllAsTouched();
      return;
    }

    this.newModalError = null;
    this.isCreating = true;

    const value = this.newConventionForm.getRawValue();
    this.conventionApi.createConvention({
      siret: String(value.siret || '').replace(/\D/g, ''),
      tva: value.tva || '',
      entite: value.entite || '',
      adresse: value.adresse || '',
      code_postal: value.code_postal || '',
      ville: value.ville || '',
      activite_principale: value.activite_principale || '',
      libelle_activite: value.libelle_activite || '',
      rayon_action: value.rayon_action || 'france',
      filiales: Number(value.filiales || 0)
    }).subscribe({
      next: (res) => {
        this.isCreating = false;
        this.isNewModalOpen = false;
        void this.router.navigate(['/convention', res.id]);
      },
      error: (err) => {
        this.isCreating = false;
        this.newModalError = err?.error?.error || 'Creation impossible pour le moment.';
      }
    });
  }

  openSettingsModal(event?: Event) {
    event?.preventDefault();
    event?.stopPropagation();
    this.isUserMenuOpen = false;
    this.settingsError = null;
    this.settingsSuccess = null;
    this.isSettingsModalOpen = true;
    this.isLoadingProfile = true;

    this.authService.getMe().subscribe({
      next: (data) => {
        this.profile = {
          nom: data.nom || '',
          prenom: data.prenom || '',
          email: data.email || data.login || '',
          fonction: data.fonction || ''
        };
        this.isLoadingProfile = false;
        setTimeout(() => this.initSignatureCanvas(data.sign || null), 0);
      },
      error: () => {
        this.isLoadingProfile = false;
        this.settingsError = 'Impossible de charger le profil.';
        setTimeout(() => this.initSignatureCanvas(null), 0);
      }
    });
  }

  closeSettingsModal() {
    this.isSettingsModalOpen = false;
  }

  private initSignatureCanvas(existingSignature: string | null) {
    const canvas = this.signatureCanvasRef?.nativeElement;
    if (!canvas) return;

    this.canvasCtx = canvas.getContext('2d');
    this.hasSignatureDrawing = false;
    if (this.canvasCtx) {
      this.canvasCtx.fillStyle = '#ffffff';
      this.canvasCtx.fillRect(0, 0, canvas.width, canvas.height);
      this.canvasCtx.strokeStyle = '#111827';
      this.canvasCtx.lineWidth = 2;
      this.canvasCtx.lineCap = 'round';
    }

    if (existingSignature && this.canvasCtx) {
      const img = new Image();
      img.onload = () => {
        this.canvasCtx?.drawImage(img, 0, 0, canvas.width, canvas.height);
        this.hasSignatureDrawing = true;
      };
      img.src = existingSignature;
    }
  }

  private getCanvasPoint(event: MouseEvent | TouchEvent): { x: number; y: number } | null {
    const canvas = this.signatureCanvasRef?.nativeElement;
    if (!canvas) return null;
    const rect = canvas.getBoundingClientRect();
    const clientX = event instanceof MouseEvent ? event.clientX : event.touches[0]?.clientX;
    const clientY = event instanceof MouseEvent ? event.clientY : event.touches[0]?.clientY;
    if (clientX === undefined || clientY === undefined) return null;
    return { x: clientX - rect.left, y: clientY - rect.top };
  }

  onSignatureStart(event: MouseEvent | TouchEvent) {
    event.preventDefault();
    const point = this.getCanvasPoint(event);
    if (!point || !this.canvasCtx) return;
    this.isDrawing = true;
    this.canvasCtx.beginPath();
    this.canvasCtx.moveTo(point.x, point.y);
  }

  onSignatureMove(event: MouseEvent | TouchEvent) {
    if (!this.isDrawing) return;
    event.preventDefault();
    const point = this.getCanvasPoint(event);
    if (!point || !this.canvasCtx) return;
    this.canvasCtx.lineTo(point.x, point.y);
    this.canvasCtx.stroke();
    this.hasSignatureDrawing = true;
  }

  onSignatureEnd() {
    this.isDrawing = false;
  }

  clearSignature() {
    const canvas = this.signatureCanvasRef?.nativeElement;
    if (!canvas || !this.canvasCtx) return;
    this.canvasCtx.fillStyle = '#ffffff';
    this.canvasCtx.fillRect(0, 0, canvas.width, canvas.height);
    this.hasSignatureDrawing = false;
  }

  saveSignature() {
    const canvas = this.signatureCanvasRef?.nativeElement;
    if (!canvas) return;

    if (!this.hasSignatureDrawing) {
      this.settingsError = 'Dessine ta signature avant d\'enregistrer.';
      return;
    }

    this.settingsError = null;
    this.settingsSuccess = null;
    this.isSavingSignature = true;

    const dataUrl = canvas.toDataURL('image/png');
    this.authService.saveSignature(dataUrl).subscribe({
      next: () => {
        this.isSavingSignature = false;
        this.settingsSuccess = 'Signature enregistrée avec succès.';
      },
      error: () => {
        this.isSavingSignature = false;
        this.settingsError = 'Erreur lors de l\'enregistrement de la signature.';
      }
    });
  }

  saveProfile() {
    if (!this.profile.nom || !this.profile.prenom || !this.profile.email) {
      this.settingsError = 'Nom, prénom et email sont requis.';
      return;
    }

    this.settingsError = null;
    this.settingsSuccess = null;
    this.isSavingProfile = true;

    this.authService.updateProfile(this.profile).subscribe({
      next: () => {
        this.isSavingProfile = false;
        this.settingsSuccess = 'Profil mis à jour avec succès.';
      },
      error: (err) => {
        this.isSavingProfile = false;
        this.settingsError = err?.error?.message || 'Erreur lors de la mise à jour du profil.';
      }
    });
  }

}
