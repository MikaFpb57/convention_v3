import { Component, inject, OnInit, signal, AfterViewInit, OnDestroy } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ConventionService as ConventionStateService } from '../../../../services/convention.service';
import { ConventionService as ConventionApiService } from '../../../../services/convention';
import { FileUploadService } from '../../../../services/file-upload.service';
import { UIComponents } from '../../../../components/ui-components';
import { CompFileUploadComponent } from '../../../../components/comp-file-upload/comp-file-upload.component';
import { FileItem } from '../../../../models/file-item.model';
import { initFlowbite } from 'flowbite';
import { FilePreviewService } from '../../../../services/file-preview.service';

@Component({
  selector: 'app-fichiers',
  standalone: true,
  imports: [CommonModule, UIComponents, CompFileUploadComponent],
  templateUrl: './fichiers.html',
  styleUrl: './fichiers.css',
})
export class Fichiers implements OnInit, AfterViewInit, OnDestroy {
  conventionService = inject(ConventionStateService);
  private apiService = inject(ConventionApiService);
  private fileUploadService = inject(FileUploadService);
  private previewService = inject(FilePreviewService);

  isLoading = signal(false);
  errorMessage = signal<string | null>(null);
  isReadOnly = this.conventionService.isReadOnly;

  files: FileItem[] = [];

  constructor() {
    // Disabled effect to prevent reloading
  }

  ngOnInit() {
    // Load initial files from service
    const savedFiles = this.conventionService.getFiles();
    if (savedFiles) {
      this.files = savedFiles;
    }

    // Load files from server if in edit mode
    if (this.conventionService.isEditMode()) {
      const id = this.conventionService.currentId();
      if (id) {
        this.loadFilesFromServer(id);
      }
    }
  }

  loadFilesFromServer(id: string) {
    this.isLoading.set(true);
    this.apiService.getConventionFiles(id).subscribe({
      next: (response: any) => {
        if (response.files && response.files.length > 0) {
          // Load each file via HTTP to create blob URLs with authentication
          this.loadFileBlobs(id, response.files);
        } else {
          this.isLoading.set(false);
        }
      },
      error: (err) => {
        console.error('Error loading files from server:', err);
        this.errorMessage.set('Erreur lors du chargement des fichiers');
        this.isLoading.set(false);
      }
    });
  }

  loadFileBlobs(id: string, serverFiles: any[]) {
    let loadedCount = 0;
    const totalFiles = serverFiles.length;
    const fileItems: FileItem[] = [];

    serverFiles.forEach((file: any) => {
      this.apiService.downloadFile(id, file.name).subscribe({
        next: (blob: Blob) => {
          const blobUrl = URL.createObjectURL(blob);
          fileItems.push({
            id: file.id,
            name: file.name,
            size: file.size,
            type: file.type,
            url: blobUrl
          });

          loadedCount++;
          if (loadedCount === totalFiles) {
            this.files = fileItems;
            this.isLoading.set(false);
          }
        },
        error: (err) => {
          console.error(`Error loading file ${file.name}:`, err);
          loadedCount++;
          if (loadedCount === totalFiles) {
            this.files = fileItems;
            this.isLoading.set(false);
          }
        }
      });
    });
  }

  ngAfterViewInit() {
    initFlowbite();
  }

  onFilesAdded(addedFiles: FileItem[]) {
    const conventionId = this.conventionService.currentId();
    if (!conventionId) {
      this.errorMessage.set('Convention non créée: enregistre d\'abord la convention avant d\'ajouter des documents.');
      return;
    }

    this.isLoading.set(true);
    this.errorMessage.set(null);

    // Upload chaque fichier directement dans le dossier final de la convention
    addedFiles.forEach(fileItem => {
      const file = fileItem.file;
      if (file) {
        this.fileUploadService.uploadConventionFile(conventionId, file).subscribe({
          next: (response) => {
            const newFile: FileItem = {
              id: response.id,
              name: response.name,
              size: response.size,
              type: response.type,
              url: URL.createObjectURL(file),
              file,
              isTemp: false
            };

            this.files = [...this.files, newFile];
            this.isLoading.set(false);
          },
          error: (err) => {
            console.error('Erreur lors de l\'upload du fichier:', err);
            this.errorMessage.set('Erreur lors de l\'upload du fichier');
            this.isLoading.set(false);
          }
        });
      }
    });
  }

  onFileRemoved(removedFile: FileItem) {
    this.files = this.files.filter(f => f.id !== removedFile.id);

    // Revoke blob URL if it's a blob
    if (removedFile.url.startsWith('blob:')) {
      URL.revokeObjectURL(removedFile.url);
    } else {
      this.previewService.revokeUrl(removedFile);
    }
  }

  ngOnDestroy() {
    // Revoke all blob URLs when component is destroyed
    this.files.forEach(file => {
      if (file.url.startsWith('blob:')) {
        URL.revokeObjectURL(file.url);
      }
    });
  }
}
