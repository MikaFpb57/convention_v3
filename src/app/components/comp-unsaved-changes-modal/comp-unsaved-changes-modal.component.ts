import { Component, Input, Output, EventEmitter } from '@angular/core';
import { CommonModule } from '@angular/common';

@Component({
  selector: 'comp-unsaved-changes-modal',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './comp-unsaved-changes-modal.component.html',
  styleUrls: ['./comp-unsaved-changes-modal.component.css']
})
export class CompUnsavedChangesModalComponent {
  @Input() isOpen = false;
  @Input() hasUnsavedChanges = false;
  @Input() isSaving = false;
  @Output() save = new EventEmitter<void>();
  @Output() discard = new EventEmitter<void>();
  @Output() stay = new EventEmitter<void>();
}
