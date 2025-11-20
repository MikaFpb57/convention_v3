import { Component } from '@angular/core';
import { RouterOutlet, RouterLink, RouterLinkActive } from '@angular/router';
import { CommonModule } from '@angular/common';

@Component({
  selector: 'app-stepper',
  standalone: true,
  imports: [RouterOutlet, RouterLink, RouterLinkActive, CommonModule],
  templateUrl: './stepper.html',
  styleUrl: './stepper.css',
})
export class Stepper {
  steps = [
    { path: 'compte', label: 'Compte', icon: 'fa-solid fa-building' },
    { path: 'contacts', label: 'Contacts', icon: 'fa-solid fa-users' },
    { path: 'facturation', label: 'Facturation', icon: 'fa-solid fa-file-invoice' },
    { path: 'infos', label: 'Infos', icon: 'fa-solid fa-info-circle' },
    { path: 'procedures', label: 'Procédures', icon: 'fa-solid fa-cogs' },
    { path: 'signature', label: 'Signature', icon: 'fa-solid fa-file-signature' }
  ];
}
