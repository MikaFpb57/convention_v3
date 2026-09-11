import { Component, OnInit, inject } from '@angular/core';
import { RouterLink } from '@angular/router';
import { AuthService } from '../services/auth.service';
import { Router } from '@angular/router';
import { ReactiveFormsModule, FormBuilder, Validators } from '@angular/forms';
import { ConventionService } from '../services/convention';
import { SireneService } from '../services/sirene.service';
import { CommonModule } from '@angular/common';

@Component({
  selector: 'app-navbar',
  standalone: true,
  imports: [RouterLink, ReactiveFormsModule, CommonModule],
  templateUrl: './navbar.component.html',
  styleUrls: ['./navbar.component.css']
})
export class NavbarComponent implements OnInit {
  private authService = inject(AuthService);
  private router = inject(Router);
  private fb = inject(FormBuilder);
  private conventionApi = inject(ConventionService);
  private sireneService = inject(SireneService);

  username: string | null = null;
  isNewModalOpen = false;
  isLoadingSiret = false;
  isCreating = false;
  newModalError: string | null = null;

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

}
