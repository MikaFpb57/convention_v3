import { Type } from '@angular/core';

export interface PdfPage {
  component: Type<unknown>;
  inputs?: Record<string, unknown>;
  type: 'image' | 'text';
  title:string,
  backgroundColor?:string,
  backgroundImage?:string
}