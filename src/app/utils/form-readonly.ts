import { effect, EffectRef } from '@angular/core';
import { FormGroup } from '@angular/forms';

/**
 * Désactive le formulaire quand le mode consultation seule est actif.
 */
export function bindReadOnlyForm(
    form: FormGroup,
    isReadOnly: () => boolean,
    options?: { keepDisabledWhen?: () => boolean }
): EffectRef {
    return effect(() => {
        const readOnly = isReadOnly();
        const keepDisabled = options?.keepDisabledWhen?.() ?? false;

        if (readOnly || keepDisabled) {
            form.disable({ emitEvent: false });
        } else if (form.disabled) {
            form.enable({ emitEvent: false });
        }
    });
}
