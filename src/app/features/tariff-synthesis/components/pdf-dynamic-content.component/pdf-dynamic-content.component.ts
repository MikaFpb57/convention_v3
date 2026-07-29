import { Component, Input } from '@angular/core';
import { PageVM } from '../../models/view-model.model';


@Component({
    selector: 'app-pdf-dynamic-content',
    templateUrl: './pdf-dynamic-content.component.html'
})
export class PdfDynamicContentComponent {
    @Input() page!: PageVM;
}