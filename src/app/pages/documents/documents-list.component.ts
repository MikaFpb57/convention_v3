import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { ConventionService } from '../../services/convention';
import { FilePreviewService } from '../../services/file-preview.service';
import { ConventionDocumentsSummary, ConventionFile } from '../../models/convention.model';
import { FileItem } from '../../models/file-item.model';
import { UIComponents } from '../../components/ui-components';

@Component({
  selector: 'app-documents-list',
  standalone: true,
  imports: [CommonModule, FormsModule, UIComponents],
  templateUrl: './documents-list.component.html',
  styleUrl: './documents-list.component.css'
})
export class DocumentsListComponent implements OnInit {
  utilisateur = '';
  conventions: ConventionDocumentsSummary[] = [];
  isLoading = true;
  error: string | null = null;

  searchTerm = '';
  currentPage = 1;
  itemsPerPage = 10;

  expandedId: string | null = null;
  filesByConvention: Record<string, ConventionFile[]> = {};
  isLoadingFiles = false;

  previewItem: FileItem | null = null;
  isLoadingPreview = false;

  constructor(
    private conventionService: ConventionService,
    private filePreviewService: FilePreviewService
  ) { }

  ngOnInit(): void {
    this.loadDocuments();
  }

  private loadDocuments(): void {
    this.isLoading = true;
    this.error = null;

    this.conventionService.getAllDocuments().subscribe({
      next: (data) => {
        this.utilisateur = data.utilisateur;
        this.conventions = data.documents || [];
        this.isLoading = false;
      },
      error: (err) => {
        console.error('Erreur lors du chargement des documents:', err);
        this.error = 'Impossible de charger les documents. Veuillez réessayer plus tard.';
        this.isLoading = false;
      }
    });
  }

  get filteredConventions(): ConventionDocumentsSummary[] {
    if (!this.searchTerm) return this.conventions;
    const term = this.searchTerm.toLowerCase();
    return this.conventions.filter(c =>
      c.id?.toLowerCase().includes(term) || c.nom?.toLowerCase().includes(term)
    );
  }

  get totalPages(): number {
    return Math.ceil(this.filteredConventions.length / this.itemsPerPage) || 1;
  }

  changePage(page: number): void {
    if (page > 0 && page <= this.totalPages) {
      this.currentPage = page;
    }
  }

  toggleExpand(convention: ConventionDocumentsSummary): void {
    if (this.expandedId === convention.id) {
      this.expandedId = null;
      return;
    }

    this.expandedId = convention.id;

    if (!this.filesByConvention[convention.id]) {
      this.isLoadingFiles = true;
      this.conventionService.getConventionFiles(convention.id).subscribe({
        next: (data) => {
          this.filesByConvention[convention.id] = data.files || [];
          this.isLoadingFiles = false;
        },
        error: (err) => {
          console.error('Erreur lors du chargement des fichiers:', err);
          this.filesByConvention[convention.id] = [];
          this.isLoadingFiles = false;
        }
      });
    }
  }

  openPreview(conventionId: string, file: ConventionFile): void {
    this.isLoadingPreview = true;
    this.conventionService.downloadFile(conventionId, file.name).subscribe({
      next: (blob) => {
        const type = blob.type || this.filePreviewService.guessTypeFromName(file.name);
        this.previewItem = {
          id: `${conventionId}_${file.name}`,
          url: URL.createObjectURL(blob),
          type,
          size: file.size,
          name: file.name
        };
        this.isLoadingPreview = false;
      },
      error: (err) => {
        console.error('Erreur lors du chargement du document:', err);
        this.isLoadingPreview = false;
      }
    });
  }

  closePreview(): void {
    if (this.previewItem) {
      this.filePreviewService.revokeUrl(this.previewItem);
    }
    this.previewItem = null;
  }

  downloadDocument(conventionId: string, file: ConventionFile): void {
    this.conventionService.downloadFile(conventionId, file.name).subscribe({
      next: (blob) => {
        const url = URL.createObjectURL(blob);
        const a = document.createElement('a');
        a.href = url;
        a.download = file.name;
        a.click();
        URL.revokeObjectURL(url);
      },
      error: (err) => console.error('Erreur lors du téléchargement:', err)
    });
  }

  formatSize(bytes: number): string {
    if (!bytes) return '0 Ko';
    const ko = bytes / 1024;
    if (ko < 1024) return `${ko.toFixed(0)} Ko`;
    return `${(ko / 1024).toFixed(1)} Mo`;
  }
}
