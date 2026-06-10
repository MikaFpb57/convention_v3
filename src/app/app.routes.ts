import { Routes } from '@angular/router';
import { Stepper } from './pages/convention/stepper/stepper';

import { GestionComponent } from './gestion/gestion.component';

export const routes: Routes = [
    { path: '', component: GestionComponent },
    {
        path: 'convention',
        component: Stepper
    },
    {
        path: 'convention/:id',
        component: Stepper
    }
];
