import { Component, ElementRef, QueryList, ViewChildren, signal, inject, AfterViewInit, OnInit, ChangeDetectionStrategy, effect, HostListener } from '@angular/core';

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

import { CompPdfModalComponent } from '../../../components/comp-pdf-modal/comp-pdf-modal.component';

import { CompUnsavedChangesModalComponent } from '../../../components/comp-unsaved-changes-modal/comp-unsaved-changes-modal.component';

import { ActivatedRoute, Router } from '@angular/router';

import { ConventionService as ConventionApiService } from '../../../services/convention';

import { ConventionService as ConventionStateService } from '../../../services/convention.service';

import { Fiche, ConventionInfo } from '../../../models/convention.model';

import { mapFicheToConventionData, mapConventionInfoToConventionData } from '../../../utils/fiche-mapper';

import { CanComponentDeactivate } from '../../../guards/unsaved-changes.guard';



@Component({

  selector: 'app-stepper',

  standalone: true,

  imports: [CommonModule, Compte, Contacts, Facturation, Infos, Procedures, Fichiers, SignatureStep, CompLoaderComponent, CompAlertErrorComponent, CompButtonComponent, CompPdfModalComponent, CompUnsavedChangesModalComponent],

  templateUrl: './stepper.html',

  styleUrl: './stepper.css',

  changeDetection: ChangeDetectionStrategy.OnPush

})

export class Stepper implements OnInit, AfterViewInit, CanComponentDeactivate {

  private viewportScroller = inject(ViewportScroller);

  private route = inject(ActivatedRoute);

  private router = inject(Router);

  private apiService = inject(ConventionApiService);

  private stateService = inject(ConventionStateService);



  activeStep = signal<string>('compte');

  isLoading = signal(false);

  loadError = signal<string | null>(null);

  isPdfModalOpen = signal(false);

  isUnsavedModalOpen = signal(false);

  isSavingBeforeLeave = signal(false);



  private pendingLeaveResolver: ((allowNavigation: boolean) => void) | null = null;



  isReadOnly = this.stateService.isReadOnly;

  etape = this.stateService.etape;

  hasUnsavedChanges = this.stateService.hasUnsavedChanges;

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



  canDeactivate(): Promise<boolean> | boolean {

    if (!this.hasUnsavedChanges()) {

      return true;

    }



    this.isUnsavedModalOpen.set(true);

    return new Promise<boolean>((resolve) => {

      this.pendingLeaveResolver = resolve;

    });

  }



  onUnsavedStay(): void {

    this.isUnsavedModalOpen.set(false);

    this.resolvePendingLeave(false);

  }



  onUnsavedDiscard(): void {

    this.stateService.discardPendingChanges();

    this.isUnsavedModalOpen.set(false);

    this.resolvePendingLeave(false);

    void this.router.navigate(['/gestion']);

  }



  async onUnsavedSave(): Promise<void> {

    const id = this.stateService.currentId();

    if (!id) {

      this.isUnsavedModalOpen.set(false);

      this.resolvePendingLeave(false);

      void this.router.navigate(['/gestion']);

      return;

    }



    this.isSavingBeforeLeave.set(true);

    this.loadError.set(null);



    console.log('[Stepper] Starting save to database for ID:', id);



    try {

      await this.stateService.saveToDatabase(id);

      console.log('[Stepper] Save successful, closing modal and allowing navigation');

      this.isUnsavedModalOpen.set(false);

      this.resolvePendingLeave(false);

      void this.router.navigate(['/gestion']);

    } catch (err) {

      console.error('[Stepper] Save failed:', err);

      this.loadError.set('Sauvegarde impossible pour le moment. Réessaie ou annule les modifications.');

    } finally {

      this.isSavingBeforeLeave.set(false);

    }

  }



  private resolvePendingLeave(allowNavigation: boolean): void {

    const resolver = this.pendingLeaveResolver;

    this.pendingLeaveResolver = null;

    if (resolver) {

      resolver(allowNavigation);

    }

  }



  @HostListener('window:beforeunload', ['$event'])

  handleBeforeUnload(event: BeforeUnloadEvent): void {

    if (!this.hasUnsavedChanges()) {

      return;

    }



    event.preventDefault();

    event.returnValue = '';

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

