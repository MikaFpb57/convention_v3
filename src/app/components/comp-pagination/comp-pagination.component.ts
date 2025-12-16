import { Component, Input, Output, EventEmitter } from '@angular/core';
import { CommonModule } from '@angular/common';
import { CompButtonComponent } from '../comp-button/comp-button.component';

@Component({
  selector: 'comp-pagination',
  standalone: true,
  templateUrl: './comp-pagination.component.html',
  imports: [CommonModule, CompButtonComponent]
})
export class CompPaginationComponent {

  @Input() currentPage = 1;
  @Input() totalPages = 1;
  @Input() itemsPerPage = 10;
  @Input() totalItems = 0;

  @Output() pageChange = new EventEmitter<number>();

  get pages(): (number | -1)[] {
    // Génère un tableau de pages avec des "..." si nécessaire
    const delta = 2; // nombre de pages autour de la page courante
    const range: (number | -1)[] = [];
    const left = Math.max(2, this.currentPage - delta);
    const right = Math.min(this.totalPages - 1, this.currentPage + delta);

    range.push(1); // première page

    if (left > 2) {
      range.push(-1); // ...
    }

    for (let i = left; i <= right; i++) {
      range.push(i);
    }

    if (right < this.totalPages - 1) {
      range.push(-1); // ...
    }

    if (this.totalPages > 1) {
      range.push(this.totalPages); // dernière page
    }

    return range;
  }

  changePage(page: number) {
    if (page < 1 || page > this.totalPages || page === this.currentPage) return;
    this.pageChange.emit(page);
  }

  get startItem(): number {
    return Math.min((this.currentPage - 1) * this.itemsPerPage + 1, this.totalItems);
  }

  get endItem(): number {
    return Math.min(this.currentPage * this.itemsPerPage, this.totalItems);
  }
}
