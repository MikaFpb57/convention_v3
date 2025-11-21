import { Component, Input } from '@angular/core';

@Component({
  selector: 'comp-badge',
  standalone: true,
  templateUrl: './comp-badge.component.html',
  styleUrls: ['./comp-badge.component.css']
})
export class CompBadgeComponent {

  @Input() value!: string; // "Compte", "Processus", etc.

  // Styles automatiques selon l'étape
  private readonly etapeClasses: { [key: string]: string } = {
    'Compte': 'bg-purple-100 text-purple-800',
    'Facturation': 'bg-yellow-100 text-yellow-800',
    'Processus': 'bg-green-100 text-green-800',
    'Contacts': 'bg-indigo-100 text-indigo-800',
    'Signé': 'bg-emerald-100 text-emerald-800',
    'En Attente': 'bg-red-100 text-red-800',
  };

  get classes(): string {
    return this.etapeClasses[this.value] ?? 'bg-gray-100 text-gray-800';
  }
}
