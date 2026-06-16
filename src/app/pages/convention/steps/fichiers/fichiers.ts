import { Component, inject, OnInit, signal, Output, EventEmitter, AfterViewInit, effect } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ConventionService } from '../../../../services/convention.service';
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
export class Fichiers implements OnInit, AfterViewInit {
  private conventionService = inject(ConventionService);
  private previewService = inject(FilePreviewService);

  isLoading = signal(false);
  errorMessage = signal<string | null>(null);
  isReadOnly = this.conventionService.isReadOnly;

  files: FileItem[] = [];

  @Output() next = new EventEmitter<void>();

  constructor() {
    effect(() => {
      const data = this.conventionService.getFiles();
      if (data) {
        this.files = data;
      }
    });
  }

  ngOnInit() {
    // Load initial files from service
    const savedFiles = this.conventionService.getFiles();
    if (savedFiles) {
      this.files = savedFiles;
    }
  }

  ngAfterViewInit() {
    initFlowbite();
  }

  onFilesAdded(addedFiles: FileItem[]) {
    this.files = [...this.files, ...addedFiles];
    this.conventionService.updateFiles(this.files);
  }

  onFileRemoved(removedFile: FileItem) {
    this.files = this.files.filter(f => f.id !== removedFile.id);
    this.previewService.revokeUrl(removedFile);
    this.conventionService.updateFiles(this.files);
  }

  onSubmit() {
    this.conventionService.updateFiles(this.files);
    this.next.emit();
  }

  onClear() {
    // Revoke all blob URLs before clearing
    this.files.forEach(file => this.previewService.revokeUrl(file));
    this.files = [];
    this.conventionService.updateFiles(this.files);
  }
}
