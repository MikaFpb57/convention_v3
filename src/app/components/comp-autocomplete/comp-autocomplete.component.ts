import { Component, Input, Output, EventEmitter, forwardRef, signal, effect, computed } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule, ReactiveFormsModule, NG_VALUE_ACCESSOR, ControlValueAccessor } from '@angular/forms';

export interface AutocompleteOption {
    value: string;
    label: string;
    subtitle?: string;
}

@Component({
    selector: 'comp-autocomplete',
    standalone: true,
    imports: [CommonModule, FormsModule, ReactiveFormsModule],
    templateUrl: './comp-autocomplete.component.html',
    styleUrl: './comp-autocomplete.component.css',
    providers: [
        {
            provide: NG_VALUE_ACCESSOR,
            useExisting: forwardRef(() => CompAutocompleteComponent),
            multi: true
        }
    ]
})
export class CompAutocompleteComponent implements ControlValueAccessor {
    @Input() label = '';
    @Input() placeholder = '';
    @Input() required = false;
    @Input() disabled = false;
    @Input() extraClass = '';
    @Input() errorMessage: string | null = null;
    @Input() minChars = 3; // Nombre minimum de caractères avant de déclencher la recherche
    @Input() options = signal<AutocompleteOption[]>([]); // Options disponibles

    @Output() search = new EventEmitter<string>(); // Émis quand l'utilisateur tape (après minChars)
    @Output() blur = new EventEmitter<FocusEvent>();
    @Output() optionSelected = new EventEmitter<AutocompleteOption>();

    inputValue = signal<string>('');
    isOpen = signal(false);
    selectedIndex = signal(-1);
    isLoading = signal(false);
    errorVisible = signal(false);

    // Filtrer les options en fonction de la valeur saisie
    filteredOptions = computed(() => {
        const search = this.inputValue().toLowerCase();
        if (search.length < this.minChars) {
            return [];
        }
        return this.options().filter(opt =>
            opt.label.toLowerCase().includes(search) ||
            opt.value.toLowerCase().includes(search)
        );
    });

    /** ControlValueAccessor */
    onChange = (_: any) => { };
    onTouched = () => { };

    writeValue(obj: any): void {
        this.inputValue.set(obj ?? '');
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
        const value = target.value;
        this.inputValue.set(value);
        this.onChange(value);

        // Déclencher la recherche si le nombre minimum de caractères est atteint
        if (value.length >= this.minChars) {
            this.search.emit(value);
            this.isOpen.set(true);
        } else {
            this.isOpen.set(false);
        }
        this.selectedIndex.set(-1);
    }

    handleBlur(event: FocusEvent) {
        // Délai pour permettre le clic sur une option
        setTimeout(() => {
            this.isOpen.set(false);
            this.onTouched();
            this.blur.emit(event);
            this.errorVisible.set(!!this.errorMessage);
        }, 200);
    }

    handleFocus() {
        if (this.inputValue().length >= this.minChars) {
            this.isOpen.set(true);
        }
    }

    selectOption(option: AutocompleteOption) {
        this.inputValue.set(option.label);
        this.onChange(option.label);
        this.isOpen.set(false);
        this.optionSelected.emit(option);
    }

    handleKeyDown(event: KeyboardEvent) {
        const options = this.filteredOptions();

        if (!this.isOpen() || options.length === 0) {
            return;
        }

        switch (event.key) {
            case 'ArrowDown':
                event.preventDefault();
                this.selectedIndex.update(i =>
                    i < options.length - 1 ? i + 1 : i
                );
                break;
            case 'ArrowUp':
                event.preventDefault();
                this.selectedIndex.update(i => i > 0 ? i - 1 : -1);
                break;
            case 'Enter':
                event.preventDefault();
                const idx = this.selectedIndex();
                if (idx >= 0 && idx < options.length) {
                    this.selectOption(options[idx]);
                }
                break;
            case 'Escape':
                this.isOpen.set(false);
                this.selectedIndex.set(-1);
                break;
        }
    }

    setLoading(loading: boolean) {
        this.isLoading.set(loading);
    }
}
