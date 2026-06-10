import { Component, Input, Output, EventEmitter, forwardRef, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule, ReactiveFormsModule, NG_VALUE_ACCESSOR, ControlValueAccessor } from '@angular/forms';

@Component({
  selector: 'comp-input',
  standalone: true,
  imports: [CommonModule, FormsModule, ReactiveFormsModule],
  templateUrl: './comp-input.component.html',
  providers: [
    {
      provide: NG_VALUE_ACCESSOR,
      useExisting: forwardRef(() => CompInputComponent),
      multi: true
    }
  ]
})
export class CompInputComponent implements ControlValueAccessor {
  @Input() label = '';
  @Input() groupClass = '';
  @Input() placeholder = '';
  @Input() type = 'text';
  @Input() required = false;
  @Input() disabled = false;
  @Input() readonly = false;
  @Input() extraClass = '';
  @Input() hasSuffix = false;
  @Input() errorMessage: string | null = null;

  @Output() blur = new EventEmitter<FocusEvent>();

  value = signal<string>('');

  errorVisible = signal(false);

  /** ControlValueAccessor */
  onChange = (_: any) => {};
  onTouched = () => {};

  writeValue(obj: any): void {
    this.value.set(obj ?? '');
  }

  registerOnChange(fn: any): void {
    this.onChange = fn;
  }

  registerOnTouched(fn: any): void {
    this.onTouched = fn;
  }

  setDisabledState?(isDisabled: boolean): void {
    this.disabled = isDisabled;
  }

  handleInput(event: Event) {
    const target = event.target as HTMLInputElement;
    this.value.set(target.value);
    this.onChange(target.value);
  }

  handleBlur(event: FocusEvent) {
    this.onTouched();
    this.blur.emit(event);
    this.errorVisible.set(!!this.errorMessage);
  }
}
