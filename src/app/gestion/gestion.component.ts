import { Component, OnInit } from '@angular/core';
import { ConventionService } from '../services/convention';
import { CommonModule, DatePipe } from '@angular/common';
import { Fiche } from '../models/convention.model';
import { FormsModule } from '@angular/forms';

@Component({
  selector: 'app-gestion',
  templateUrl: './gestion.component.html',
  styleUrls: ['./gestion.component.css'],
  standalone: true,
  imports: [CommonModule, DatePipe, FormsModule]
})
export class GestionComponent implements OnInit {
  // Make Math available in the template
  Math = Math;

  utilisateur: string = '';
  fiches: Fiche[] = [];
  total: number = 0;
  isLoading: boolean = true;
  error: string | null = null;

  // Pagination
  currentPage: number = 1;
  itemsPerPage: number = 10;

  // Etapes
  etapeFilter: string = '';
  etapeClasses: {[key: string]: string} = {
    'Compte': 'bg-purple-100 text-purple-800',
    'Facturation': 'bg-yellow-100 text-yellow-800',
    'Processus': 'bg-green-100 text-green-800',
    'Contacts': 'bg-indigo-100 text-indigo-800',
    'Signé': 'bg-emerald-100 text-emerald-800',
    'En Attente': 'bg-red-100 text-red-800'
  };

  constructor(private conventionService: ConventionService) {}

  ngOnInit() {
    this.loadConventions();
  }

  private loadConventions() {
    this.isLoading = true;
    this.error = null;

    this.conventionService.getAllConventions().subscribe({
      next: (data) => {
        this.utilisateur = data.utilisateur;
        this.fiches = data.fiches || [];
        this.total = data.total || 0;
        this.isLoading = false;
      },
      error: (err) => {
        console.error('Erreur lors du chargement des conventions:', err);
        this.error = 'Impossible de charger les données. Veuillez réessayer plus tard.';
        this.isLoading = false;
      }
    });
  }

  // Méthode pour obtenir les fiches à afficher sur la page courante
  get paginatedFiches(): Fiche[] {
    const startIndex = (this.currentPage - 1) * this.itemsPerPage;
    return this.fiches.slice(startIndex, startIndex + this.itemsPerPage);
  }

  // Méthode pour changer de page
  changePage(page: number): void {
    if (page > 0 && page <= this.totalPages) {
      this.currentPage = page;
    }
  }

  // Calcul du nombre total de pages
  get totalPages(): number {
    return Math.ceil(this.fiches.length / this.itemsPerPage);
  }

  // Génération de la liste des pages pour la pagination
  get pages(): number[] {
    const pages: number[] = [];
    const totalPages = this.totalPages;
    const maxVisiblePages = 5;

    if (totalPages <= maxVisiblePages) {
      // Si moins de pages que le maximum visible, toutes les afficher
      for (let i = 1; i <= totalPages; i++) {
        pages.push(i);
      }
    } else {
      // Afficher des points de suspension au début si nécessaire
      if (this.currentPage > 3) {
        pages.push(1);
        if (this.currentPage > 4) {
          pages.push(-1); // -1 représente les points de suspension
        }
      }

      // Afficher les pages autour de la page courante
      const startPage = Math.max(1, this.currentPage - 1);
      const endPage = Math.min(totalPages, this.currentPage + 1);

      for (let i = startPage; i <= endPage; i++) {
        if (i > 0) {
          pages.push(i);
        }
      }

      // Afficher des points de suspension à la fin si nécessaire
      if (this.currentPage < totalPages - 2) {
        if (this.currentPage < totalPages - 3) {
          pages.push(-1); // -1 représente les points de suspension
        }
        pages.push(totalPages);
      }
    }

    return pages;
  }

  // Gestion de la sélection
  selectedIds: Set<string> = new Set();

  get allSelected(): boolean {
    return this.fiches.length > 0 && this.selectedIds.size === this.fiches.length;
  }

  isSelected(id: string): boolean {
    return this.selectedIds.has(id);
  }

  toggleSelect(id: string, event: Event): void {
    const target = event.target as HTMLInputElement;
    if (target.checked) {
      this.selectedIds.add(id);
    } else {
      this.selectedIds.delete(id);
    }
  }

  // Update traite status
  updateTraite(fiche: Fiche, isChecked: boolean): void {
    fiche.traite = isChecked ? 1 : 0;
    // Here you would typically call your service to update the backend
    // this.conventionService.updateFiche(fiche).subscribe(...);
  }

  // Gestion du tri
  sortField: string = 'date_update';
  sortDirection: 'asc' | 'desc' = 'desc';

  changeSort(field: string): void {
    if (this.sortField === field) {
      // Inverser le sens de tri si on clique sur la même colonne
      this.sortDirection = this.sortDirection === 'asc' ? 'desc' : 'asc';
    } else {
      // Trier par ordre croissant par défaut pour une nouvelle colonne
      this.sortField = field;
      this.sortDirection = 'asc';
    }

    // Trier les fiches
    this.fiches.sort((a, b) => {
      let valueA = (a as any)[field];
      let valueB = (b as any)[field];

      // Gestion des valeurs nulles ou non définies
      if (valueA == null) valueA = '';
      if (valueB == null) valueB = '';

      // Conversion des dates pour le tri
      if (field === 'date_update' || field === 'date_creation') {
        valueA = new Date(valueA).getTime();
        valueB = new Date(valueB).getTime();
      }

      // Comparaison en fonction du type
      if (typeof valueA === 'string' && typeof valueB === 'string') {
        return this.sortDirection === 'asc'
          ? valueA.localeCompare(valueB)
          : valueB.localeCompare(valueA);
      } else {
        return this.sortDirection === 'asc'
          ? (valueA > valueB ? 1 : -1)
          : (valueA < valueB ? 1 : -1);
      }
    });

    // Revenir à la première page après le tri
    this.currentPage = 1;
  }

  // Filtres et recherche
  searchTerm: string = '';
  dateFilter: string = 'all';
  dateFilters = [
    { id: 'today', label: 'Aujourd\'hui' },
    { id: 'week', label: 'Cette semaine' },
    { id: 'month', label: 'Ce mois-ci' },
    { id: 'all', label: 'Tous' }
  ];

  // Filtrage des fiches
  get filteredFiches(): Fiche[] {
    let filtered = [...this.fiches];

    // Filtre par recherche
    if (this.searchTerm) {
      const term = this.searchTerm.toLowerCase();
      filtered = filtered.filter(fiche =>
        fiche.entite?.toLowerCase().includes(term) ||
        fiche.siret?.toLowerCase().includes(term) ||
        fiche.ville?.toLowerCase().includes(term) ||
        fiche.createur?.toLowerCase().includes(term)
      );
    }

    // Filtre par étape
    if (this.etapeFilter) {
      filtered = filtered.filter(fiche => fiche.etape === this.etapeFilter);
    }

    // Filtre par date
    if (this.dateFilter !== 'all') {
      const now = new Date();
      let startDate = new Date();

      switch (this.dateFilter) {
        case 'today':
          startDate.setHours(0, 0, 0, 0);
          break;
        case 'week':
          startDate.setDate(now.getDate() - now.getDay());
          startDate.setHours(0, 0, 0, 0);
          break;
        case 'month':
          startDate = new Date(now.getFullYear(), now.getMonth(), 1);
          break;
      }

      filtered = filtered.filter(fiche => {
        const updateDate = new Date(fiche.date_update);
        return updateDate >= startDate;
      });
    }

    return filtered;
  }

  // Mise à jour du filtre de date
  applyDateFilter(filter: string): void {
    this.dateFilter = filter;
    this.currentPage = 1;
  }

  // Gestion des étapes
  getEtapeBadgeClass(etape: string): string {
    return this.etapeClasses[etape] || 'bg-gray-100 text-gray-800';
  }

  //Etapes disponibles
  get etapesDisponibles(): string[] {
    return Object.keys(this.etapeClasses);
  }

  // Édition d'une fiche
  editFiche(fiche: Fiche): void {
    // Implémentez la logique d'édition ici
    console.log('Édition de la fiche:', fiche);
    // Par exemple : this.router.navigate(['/edition', fiche.ID]);
  }
}
