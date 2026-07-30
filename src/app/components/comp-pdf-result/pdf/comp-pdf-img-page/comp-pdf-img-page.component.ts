import { Component, Input } from '@angular/core';

@Component({
  selector: 'comp-pdf-img-page',
  templateUrl: './comp-pdf-img-page.component.html',
  styleUrls: ['./comp-pdf-img-page.component.css']
})
export class CompPdfImgPageComponent {
  @Input() src!: string;
  imageLoadError = false;

  onImageError() {
    this.imageLoadError = true;
  }
}
