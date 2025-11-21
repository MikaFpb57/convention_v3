import { Component, Input, signal } from '@angular/core';

@Component({
  selector: 'comp-h1-gd',
  standalone: true,
  templateUrl: './comp-h1-gd.component.html',
})
export class CompH1GdComponent {
  /** Message dynamique */
  @Input() textNormal: string | null = null;
  @Input() textGradient: string | null = null;
  @Input() extraClass: string | null = null;
}
