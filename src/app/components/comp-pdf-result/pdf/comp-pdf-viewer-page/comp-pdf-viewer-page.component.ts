import { CommonModule } from '@angular/common';
import { Component, Input } from '@angular/core';

@Component({
  selector: 'comp-pdf-viewer-page',
  standalone: true,
  templateUrl: './comp-pdf-viewer-page.component.html',
  imports: [CommonModule]
})
export class CompPdfViewerPageComponent {
  @Input() pageNumber!: number;
  @Input() title: string = "";
  @Input() data!: {};
  @Input() zoom = 1;
  @Input() type: 'image' | 'text' = 'text';


  @Input() backgroundColor?: string;
  @Input() backgroundImage?: string

  get isImagePage() {
    // console.warn(this.pageNumber,this.type, this.data, this.title)
    return this.type === 'image';
  }

  get hasBackground(): boolean {
    return !!this.backgroundColor || !!this.backgroundImage;
  }

  getFullStyle(): string {
    let style = `
    width:${this.pageWidth * this.zoom}px;
    height:${this.pageHeight * this.zoom}px;
  `;

    if (this.backgroundColor) {
      style += `background-color:${this.backgroundColor};`;
    }

    if (this.backgroundImage) {
      style += `
      background-image:url(${this.backgroundImage});
      background-size:cover;
      background-repeat:no-repeat;
      background-position:center;
    `;
    } 
    if (!this.backgroundImage && !this.backgroundColor){
      style += `background-color:white;`;
    }

    return style;
  }

  baseFontSize = 12;
  padding = 48;
  pageWidth = 794;
  pageHeight = 1123;

}
