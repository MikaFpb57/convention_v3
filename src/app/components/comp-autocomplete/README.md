# Composant Autocomplete

## Description
Le composant `comp-autocomplete` est un champ de saisie avec autocomplétion qui affiche une liste déroulante de suggestions après la saisie d'un nombre minimum de caractères.

## Caractéristiques
- ✅ Compatible Angular 20 + Signals
- ✅ Intégration avec FormControl (ControlValueAccessor)
- ✅ Recherche déclenchée après un nombre minimum de caractères (par défaut: 3)
- ✅ Navigation au clavier (flèches haut/bas, Enter, Escape)
- ✅ Style Flowbite
- ✅ Indicateur de chargement
- ✅ Messages d'état (aucun résultat, minimum de caractères)

## Utilisation

### Dans le template HTML

```html
<comp-autocomplete 
    formControlName="assurance" 
    label="Assurance" 
    placeholder="Nom de l'Assurance" 
    extraClass="w-full"
    [minChars]="3"
    [options]="assuranceOptions"
    (search)="onSearchAssurance($event)">
</comp-autocomplete>
```

### Dans le composant TypeScript

```typescript
import { signal } from '@angular/core';
import { AutocompleteOption } from '../../../../components/comp-autocomplete/comp-autocomplete.component';

export class MyComponent {
  // Signal contenant les options d'autocomplétion
  assuranceOptions = signal<AutocompleteOption[]>([]);

  // Méthode appelée lors de la recherche
  onSearchAssurance(searchTerm: string) {
    this.myService.search(searchTerm).subscribe({
      next: (response) => {
        this.assuranceOptions.set(
          response.items.map(item => ({
            value: item.id,
            label: item.name,
            subtitle: item.category // optionnel
          }))
        );
      },
      error: (err) => {
        console.error('Erreur:', err);
        this.assuranceOptions.set([]);
      }
    });
  }
}
```

## Propriétés (Inputs)

| Propriété | Type | Défaut | Description |
|-----------|------|--------|-------------|
| `label` | `string` | `''` | Label du champ |
| `placeholder` | `string` | `''` | Texte placeholder |
| `required` | `boolean` | `false` | Champ requis |
| `disabled` | `boolean` | `false` | Champ désactivé |
| `extraClass` | `string` | `''` | Classes CSS additionnelles |
| `errorMessage` | `string \| null` | `null` | Message d'erreur à afficher |
| `minChars` | `number` | `3` | Nombre minimum de caractères avant recherche |
| `options` | `Signal<AutocompleteOption[]>` | `signal([])` | Options disponibles |

## Événements (Outputs)

| Événement | Type | Description |
|-----------|------|-------------|
| `search` | `EventEmitter<string>` | Émis quand l'utilisateur tape (après minChars) |
| `blur` | `EventEmitter<FocusEvent>` | Émis quand le champ perd le focus |
| `optionSelected` | `EventEmitter<AutocompleteOption>` | Émis quand une option est sélectionnée |

## Interface AutocompleteOption

```typescript
export interface AutocompleteOption {
  value: string;      // Valeur unique de l'option
  label: string;      // Texte principal affiché
  subtitle?: string;  // Texte secondaire optionnel (affiché en petit)
}
```

## Navigation au clavier

- **Flèche bas** : Sélectionner l'option suivante
- **Flèche haut** : Sélectionner l'option précédente
- **Enter** : Valider la sélection
- **Escape** : Fermer la liste

## Exemple complet

Voir l'implémentation dans `src/app/pages/convention/steps/infos/` pour un exemple complet avec appel API.
