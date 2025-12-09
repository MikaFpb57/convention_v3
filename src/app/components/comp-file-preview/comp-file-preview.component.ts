import { Component, Input, Output, EventEmitter } from '@angular/core';
import { FileItem } from '../../models/file-item.model';
import { CommonModule } from '@angular/common';
import { DomSanitizer, SafeResourceUrl } from '@angular/platform-browser';
import { FilePreviewService } from '../../services/file-preview.service';

@Component({
  selector: 'comp-file-preview',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './comp-file-preview.component.html',
  styleUrls: ['./comp-file-preview.component.css']
})
export class CompFilePreviewComponent {
  @Input() file!: FileItem;
  @Output() close = new EventEmitter<void>();

  safeUrl!: SafeResourceUrl;
  officeUrl!: SafeResourceUrl;

  constructor(
    public preview: FilePreviewService,
    private sanitizer: DomSanitizer
  ) {}

  ngOnChanges() {
    if (!this.file) return;

    this.safeUrl = this.sanitizer.bypassSecurityTrustResourceUrl(this.file.url);

    if (this.isOffice) {
      const full = `https://view.officeapps.live.com/op/embed.aspx?src=${encodeURIComponent(this.file.url)}`;
      this.officeUrl = this.sanitizer.bypassSecurityTrustResourceUrl(full);
    }
  }

  get isImage() { return this.file.type?.startsWith('image/'); }
  get isPdf() { return this.file.type === 'application/pdf'; }
  get isOffice() {
    return [
      'application/msword',
      'application/vnd.openxmlformats-officedocument.wordprocessingml.document',
      'application/vnd.ms-excel',
      'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet'
    ].includes(this.file.type);
  }
}
