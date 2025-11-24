import { Component, Input } from '@angular/core';

@Component({
  selector: 'comp-button',
  standalone: true,
  templateUrl: './comp-button.component.html',
})
export class CompButtonComponent {
  @Input() label: string | number = '';
  @Input() type: 'button' | 'submit' = 'button';

  @Input() variant: 'primary' | 'danger' | 'neutral' | 'link' | 'custom' = 'primary';
  @Input() size: 'xs' | 'sm' | 'md' | 'lg' = 'md';

  @Input() active = false;
  @Input() disabled = false;
  @Input() rounded: 'none' | 's' | 'e' | 'base' | 'full' = 'base';

  @Input() extraClass = '';

  // ——————————————
  // Tailwind class builder
  // ——————————————
  get classes() {
    return [
      this.baseClasses(),
      this.variantClasses(),
      this.sizeClasses(),
      this.roundedClasses(),
      this.extraClass
    ].join(' ');
  }

  private baseClasses() {
    return `
      focus:outline-none
      transition-colors
      font-medium
      disabled:opacity-50
      disabled:cursor-not-allowed
      cursor-pointer
    `;
  }

  private sizeClasses() {
    switch (this.size) {
      case 'xs': return 'text-xs px-2 py-1';
      case 'sm': return 'text-sm px-3 py-1.5';
      case 'lg': return 'text-lg px-5 py-3';
      default: return 'text-sm px-4 py-2.5';
    }
  }

  private roundedClasses() {
    return {
      none: 'rounded-none',
      s: 'rounded-s-base',
      e: 'rounded-e-base',
      full: 'rounded-full',
      base: 'rounded-base'
    }[this.rounded];
  }

  private variantClasses() {
    switch (this.variant) {

      case 'primary':
        return `
          text-white
          bg-gradient-to-r from-blue-500 via-blue-600 to-blue-700
          hover:bg-gradient-to-br
          shadow-lg shadow-blue-500/50
          focus:ring-4 focus:ring-blue-300
        `;

      case 'danger':
        return `
          text-white
          bg-gradient-to-r from-red-400 via-red-500 to-red-600
          hover:bg-gradient-to-br
          shadow-lg shadow-red-500/50
          focus:ring-4 focus:ring-red-300
        `;

      case 'neutral':
        return `
          text-body bg-neutral-secondary-medium border border-default-medium
          hover:bg-neutral-tertiary-medium hover:text-heading
        `;

      case 'link':
        return `
          text-fg-brand hover:underline bg-transparent shadow-none p-0
        `;

      case 'custom':
        return ''; // tu mets ce que tu veux via extraClass
    }
  }
}
