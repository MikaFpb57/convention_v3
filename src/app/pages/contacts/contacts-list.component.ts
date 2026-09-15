import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { ConventionService } from '../../services/convention';
import { ContactRow } from '../../models/convention.model';
import { UIComponents } from '../../components/ui-components';

@Component({
  selector: 'app-contacts-list',
  standalone: true,
  imports: [CommonModule, FormsModule, UIComponents],
  templateUrl: './contacts-list.component.html',
  styleUrl: './contacts-list.component.css'
})
export class ContactsListComponent implements OnInit {
  utilisateur = '';
  contacts: ContactRow[] = [];
  isLoading = true;
  error: string | null = null;

  currentPage = 1;
  itemsPerPage = 10;

  searchTerm = '';
  typeFilter = '';

  sortField: keyof ContactRow = 'convention_id';
  sortDirection: 'asc' | 'desc' = 'asc';

  constructor(private conventionService: ConventionService) { }

  ngOnInit(): void {
    this.loadContacts();
  }

  private loadContacts(): void {
    this.isLoading = true;
    this.error = null;

    this.conventionService.getAllContacts().subscribe({
      next: (data) => {
        this.utilisateur = data.utilisateur;
        this.contacts = data.contacts || [];
        this.isLoading = false;
      },
      error: (err) => {
        console.error('Erreur lors du chargement des contacts:', err);
        this.error = 'Impossible de charger les contacts. Veuillez réessayer plus tard.';
        this.isLoading = false;
      }
    });
  }

  get typesDisponibles(): string[] {
    return Array.from(new Set(this.contacts.map(c => c.type)));
  }

  get filteredContacts(): ContactRow[] {
    let filtered = [...this.contacts];

    if (this.typeFilter) {
      filtered = filtered.filter(c => c.type === this.typeFilter);
    }

    if (this.searchTerm) {
      const term = this.searchTerm.toLowerCase();
      filtered = filtered.filter(c =>
        c.convention_id?.toLowerCase().includes(term) ||
        c.convention_nom?.toLowerCase().includes(term) ||
        c.nom?.toLowerCase().includes(term) ||
        c.prenom?.toLowerCase().includes(term) ||
        c.email?.toLowerCase().includes(term)
      );
    }

    filtered.sort((a, b) => {
      const valueA = (a[this.sortField] ?? '').toString();
      const valueB = (b[this.sortField] ?? '').toString();
      return this.sortDirection === 'asc'
        ? valueA.localeCompare(valueB)
        : valueB.localeCompare(valueA);
    });

    return filtered;
  }

  get totalPages(): number {
    return Math.ceil(this.filteredContacts.length / this.itemsPerPage) || 1;
  }

  changePage(page: number): void {
    if (page > 0 && page <= this.totalPages) {
      this.currentPage = page;
    }
  }

  changeSort(field: keyof ContactRow): void {
    if (this.sortField === field) {
      this.sortDirection = this.sortDirection === 'asc' ? 'desc' : 'asc';
    } else {
      this.sortField = field;
      this.sortDirection = 'asc';
    }
    this.currentPage = 1;
  }
}
