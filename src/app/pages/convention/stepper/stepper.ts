import { Component, ElementRef, QueryList, ViewChildren, signal, inject, AfterViewInit } from '@angular/core';
import { CommonModule, ViewportScroller } from '@angular/common';
import { Compte } from '../steps/compte/compte';
import { Contacts } from '../steps/contacts/contacts';
import { Facturation } from '../steps/facturation/facturation';
import { Infos } from '../steps/infos/infos';
import { Procedures } from '../steps/procedures/procedures';
import { initFlowbite } from 'flowbite';
import { UIComponents } from '../../../components/ui-components';

@Component({
  selector: 'app-stepper',
  standalone: true,
  imports: [CommonModule, Compte, Contacts, Facturation, Infos, Procedures, UIComponents],
  templateUrl: './stepper.html',
  styleUrl: './stepper.css',
})
export class Stepper implements AfterViewInit {
  private viewportScroller = inject(ViewportScroller);

  activeStep = signal<string>('compte');

  steps = [
    { id: 'compte', label: 'Compte', icon: 'fa-solid fa-building' },
    { id: 'contacts', label: 'Contacts', icon: 'fa-solid fa-users' },
    { id: 'facturation', label: 'Facturation', icon: 'fa-solid fa-file-invoice' },
    { id: 'infos', label: 'Infos', icon: 'fa-solid fa-info-circle' },
    { id: 'procedures', label: 'Procédures', icon: 'fa-solid fa-cogs' }
  ];

  @ViewChildren('stepSection') stepSections!: QueryList<ElementRef>;

  ngAfterViewInit() {
    // Initialize Flowbite components (Speed Dial)
    setTimeout(() => {
      initFlowbite();
    }, 100);

    this.observeSections();
  }

  scrollTo(id: string) {
    this.viewportScroller.scrollToAnchor(id);
    this.activeStep.set(id);
  }

  private observeSections() {
    const options = {
      root: null,
      rootMargin: '-50% 0px -50% 0px', // Trigger when section is in the middle of viewport
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
