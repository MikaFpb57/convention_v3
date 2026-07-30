import { Component, Input, Output, EventEmitter } from '@angular/core';
import { CommonModule } from '@angular/common';
import { CompPdfResultComponent } from '../comp-pdf-result/comp-pdf-result.component';
import { ConventionData } from '../../models/convention.interface';

@Component({
  selector: 'comp-pdf-modal',
  standalone: true,
  imports: [CommonModule, CompPdfResultComponent],
  templateUrl: './comp-pdf-modal.component.html',
  styleUrls: ['./comp-pdf-modal.component.css']
})
export class CompPdfModalComponent {
  @Input() isOpen = false;
  @Input() conventionData!: ConventionData;
  @Output() close = new EventEmitter<void>();
}
