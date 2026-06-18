import { Component, Output, EventEmitter, Input, OnChanges, SimpleChanges } from '@angular/core';
import { FilePreviewService } from '../../services/file-preview.service';
import { FileItem } from '../../models/file-item.model';
import { CommonModule } from '@angular/common';
import { UIComponents } from '../ui-components';

@Component({
  selector: 'comp-file-upload',
  standalone: true,
  imports: [CommonModule, UIComponents],
  templateUrl: './comp-file-upload.component.html',
  styleUrls: ['./comp-file-upload.component.css']
})
export class CompFileUploadComponent implements OnChanges {
  @Input() accept = '.jpg,.jpeg,.png,.pdf,.doc,.docx,.xls,.xlsx';
  @Input() maxFiles = 25;
  @Input() initialFiles: FileItem[] = [];
  @Input() readonly = false;

  @Output() filesAdded = new EventEmitter<FileItem[]>();
  @Output() fileRemoved = new EventEmitter<FileItem>();

  uploading: boolean = false;
  files: FileItem[] = [];

  constructor(private preview: FilePreviewService) {}

  ngOnInit() {
    this.files = [...this.initialFiles];
  }

  ngOnChanges(changes: SimpleChanges) {
    if (changes['initialFiles'] && changes['initialFiles'].currentValue) {
      this.files = [...changes['initialFiles'].currentValue];
    }
  }

  onFileInput(e: Event) {
    const input = e.target as HTMLInputElement;
    if (!input.files) return;
    this.addFiles(Array.from(input.files));
    input.value = '';
  }

  onDrop(e: DragEvent) {
    e.preventDefault();
    if (!e.dataTransfer) return;
    this.addFiles(Array.from(e.dataTransfer.files));
  }

  onDragOver(e: DragEvent) { e.preventDefault(); }

  addFiles(list: File[]) {
    const created: FileItem[] = [];
    for (const f of list) {
      if (this.files.length + created.length >= this.maxFiles) break;
      // filter accepted extensions
      if (this.accept && !this.isAccepted(f)) continue;
      const it = this.preview.createFileItem(f);
      this.files.push(it);
      created.push(it);
    }
    if (created.length) this.filesAdded.emit(created);
  }

  isAccepted(f: File) {
    const acceptLower = this.accept.toLowerCase();
    const ext = f.name.split('.').pop()?.toLowerCase() || '';
    return acceptLower.includes(ext) || acceptLower.includes(f.type);
  }

  removeFile(item: FileItem) {
    this.files = this.files.filter(f => f.id !== item.id);
    this.preview.revokeUrl(item);
    this.fileRemoved.emit(item);
  }
  onDownload(item: FileItem) {
    console.log('Download requested:', item);
  }
}
