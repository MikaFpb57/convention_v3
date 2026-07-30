import { Component, ElementRef, QueryList, ViewChildren, signal, inject, AfterViewInit, OnInit, ChangeDetectionStrategy, effect } from '@angular/core';
import { CommonModule, ViewportScroller } from '@angular/common';
import { initTooltips } from 'flowbite';
import { Compte } from '../steps/compte/compte';
import { Contacts } from '../steps/contacts/contacts';
import { Facturation } from '../steps/facturation/facturation';
import { Infos } from '../steps/infos/infos';
import { Procedures } from '../steps/procedures/procedures';
import { Fichiers } from '../steps/fichiers/fichiers';
import { SignatureStep } from '../steps/signature/signature';
import { initFlowbite } from 'flowbite';
import { CompLoaderComponent } from '../../../components/comp-loader/comp-loader.component';
import { CompAlertErrorComponent } from '../../../components/comp-alert-error/comp-alert-error.component';
import { CompButtonComponent } from '../../../components/comp-button/comp-button.component';
import { CompH1GdComponent } from '../../../components/comp-h1-gd/comp-h1-gd.component';
import { CompPdfResultComponent } from '../../../components/comp-pdf-result/comp-pdf-result.component';
import { CompPdfModalComponent } from '../../../components/comp-pdf-modal/comp-pdf-modal.component';
import { ActivatedRoute, Router } from '@angular/router';
import { ConventionService as ConventionApiService } from '../../../services/convention';
import { ConventionService as ConventionStateService } from '../../../services/convention.service';
import { Fiche, ConventionInfo } from '../../../models/convention.model';
import { mapFicheToConventionData, mapConventionInfoToConventionData } from '../../../utils/fiche-mapper';

@Component({
  selector: 'app-stepper',
  standalone: true,
  imports: [CommonModule, Compte, Contacts, Facturation, Infos, Procedures, Fichiers, SignatureStep, CompLoaderComponent, CompAlertErrorComponent, CompButtonComponent, CompH1GdComponent, CompPdfResultComponent, CompPdfModalComponent],
  templateUrl: './stepper.html',
  styleUrl: './stepper.css',
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class Stepper implements OnInit, AfterViewInit {
  private viewportScroller = inject(ViewportScroller);
  private route = inject(ActivatedRoute);
  private router = inject(Router);
  private apiService = inject(ConventionApiService);
  private stateService = inject(ConventionStateService);

  activeStep = signal<string>('compte');
  isLoading = signal(false);
  loadError = signal<string | null>(null);
  isPdfModalOpen = signal(false);

  isReadOnly = this.stateService.isReadOnly;
  etape = this.stateService.etape;
  conventionData = signal(this.stateService.convention());

  steps = [
    { id: 'compte', label: 'Compte', icon: 'fa-solid fa-building' },
    { id: 'infos', label: 'Infos', icon: 'fa-solid fa-info-circle' },
    { id: 'facturation', label: 'Facturation', icon: 'fa-solid fa-file-invoice' },
    { id: 'procedures', label: 'Procédures', icon: 'fa-solid fa-cogs' },
    { id: 'contacts', label: 'Contacts', icon: 'fa-solid fa-users' },
    { id: 'fichiers', label: 'Documents', icon: 'fa-solid fa-folder-open' },
    { id: 'signature', label: 'Signature', icon: 'fa-solid fa-signature' }
  ];

  @ViewChildren('stepSection') stepSections!: QueryList<ElementRef>;

  constructor() {
    effect(() => {
      this.conventionData.set(this.stateService.convention());
    });
  }

  ngOnInit() {
    this.route.params.subscribe(params => {
      const id = params['id'];
      if (id) {
        this.loadConvention(id);
      } else {
        this.stateService.resetNewMode();
      }
    });
  }

  private loadConvention(id: string) {
    const navState = this.router.getCurrentNavigation()?.extras?.state ?? history.state;
    const stateFiche = navState?.['fiche'] as Fiche | undefined;
    const previewFiche = stateFiche?.ID === id ? stateFiche : undefined;

    if (previewFiche) {
      const previewData = mapFicheToConventionData(previewFiche);
      this.stateService.startEditMode(id, previewData, previewFiche.etape);
    } else {
      this.stateService.startEditMode(id);
    }

    this.isLoading.set(true);
    this.loadError.set(null);

    this.apiService.getConventionById(id).subscribe({
      next: (response) => {
        if (response.Informations?.length > 0) {
          const info = response.Informations[0];
          // Utiliser libelle_etape directement depuis le backend
          const etapeTexte = info.libelle_etape || info.etape;
          this.stateService.setEditMode(id, mapConventionInfoToConventionData(info), etapeTexte);
        } else if (!previewFiche) {
          this.loadError.set('Convention introuvable.');
        }
        this.isLoading.set(false);
      },
      error: () => {
        if (!previewFiche) {
          this.loadError.set('Impossible de charger la convention. Veuillez réessayer.');
        }
        this.isLoading.set(false);
      }
    });
  }

  ngAfterViewInit() {
    setTimeout(() => initFlowbite(), 100);
    setTimeout(() => initTooltips(), 200);
    this.observeSections();
  }

  scrollTo(id: string) {
    this.viewportScroller.scrollToAnchor(id);
    this.activeStep.set(id);
  }

  openPdfModal() {
    this.isPdfModalOpen.set(true);
  }

  closePdfModal() {
    this.isPdfModalOpen.set(false);
  }

  private observeSections() {
    const options = {
      root: null,
      rootMargin: '-50% 0px -50% 0px',
      threshold: 0
    };

    const observer = new IntersectionObserver((entries) => {
      entries.forEach(entry => {
        if (entry.isIntersecting) {
          this.activeStep.set(entry.target.id);
        }
      });
    }, options);

    this.stepSections.forEach(section => {
      observer.observe(section.nativeElement);
    });
  }
}
