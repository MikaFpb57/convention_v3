import { Component, Input, Output, EventEmitter } from '@angular/core';
import { FileItem } from '../../models/file-item.model';
import { CommonModule } from '@angular/common';
import { FilePreviewService } from '../../services/file-preview.service';
import { DomSanitizer, SafeResourceUrl } from '@angular/platform-browser';

@Component({
  selector: 'comp-file-thumbnail',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './comp-file-thumbnail.component.html',
  styleUrls: ['./comp-file-thumbnail.component.css']
})
export class CompFileThumbnailComponent {
  @Input() item!: FileItem;
  @Input() showActions = true;

  @Output() open = new EventEmitter<void>();
  @Output() download = new EventEmitter<void>();
  @Output() delete = new EventEmitter<void>();

  safeUrl!: SafeResourceUrl;
  officeUrl!: SafeResourceUrl;

  constructor(
    public preview: FilePreviewService,
    private sanitizer: DomSanitizer
  ) {}

  ngOnChanges() {
    if (!this.item) return;

    this.safeUrl = this.sanitizer.bypassSecurityTrustResourceUrl(this.item.url);

    if (this.isOffice) {
      const full = `https://view.officeapps.live.com/op/embed.aspx?src=${encodeURIComponent(this.item.url)}`;
      this.officeUrl = this.sanitizer.bypassSecurityTrustResourceUrl(full);
    }
  }

  get isImage() { return this.item.type?.startsWith('image/'); }
  get isPdf() { return this.item.type === 'application/pdf'; }
  get isOffice() {
    return [
      'application/msword',
      'application/vnd.openxmlformats-officedocument.wordprocessingml.document',
      'application/vnd.ms-excel',
      'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet'
    ].includes(this.item.type);
  }
}
