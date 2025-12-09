import { Component, Input, Output, EventEmitter } from '@angular/core';
import { FileItem } from '../../models/file-item.model';
import { CommonModule } from '@angular/common';
import { CompFileThumbnailComponent } from '../comp-file-thumbnail/comp-file-thumbnail.component';
import { CompFilePreviewComponent } from '../comp-file-preview/comp-file-preview.component';
import { DragDropModule, CdkDragDrop, moveItemInArray } from '@angular/cdk/drag-drop';

@Component({
  selector: 'comp-file-gallery',
  standalone: true,
  imports: [CommonModule, CompFileThumbnailComponent, CompFilePreviewComponent, DragDropModule],
  templateUrl: './comp-file-gallery.component.html',
  styleUrls: ['./comp-file-gallery.component.css']
})
export class CompFileGalleryComponent {
  @Input() files: FileItem[] = [];
  @Output() removed = new EventEmitter<FileItem>();
  @Output() download = new EventEmitter<FileItem>();
  @Output() orderChanged = new EventEmitter<FileItem[]>();

  preview: FileItem | null = null;

  openPreview(item: FileItem) { this.preview = item; }
  closePreview() { this.preview = null; }

  onDelete(item: FileItem) { this.removed.emit(item); }

  onDownload(item: FileItem) { this.download.emit(item); }

  drop(event: CdkDragDrop<FileItem[]>) {
    if (event.previousIndex === event.currentIndex) return;
    moveItemInArray(this.files, event.previousIndex, event.currentIndex);
    this.orderChanged.emit(this.files);
  }
}
