import { Component, Input, signal } from '@angular/core';

@Component({
  selector: 'comp-alert-error',
  standalone: true,
  templateUrl: './comp-alert-error.component.html',
})
export class CompAlertErrorComponent {
  /** Message dynamique */
  @Input() message: string | null = null;

  /** Signal pour la visibilité */
  visible = signal(true);

  /** Ferme l’alerte */
  close() {
    this.visible.set(false);
  }
}
