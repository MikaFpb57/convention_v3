import { Routes } from '@angular/router';
import { Stepper } from './pages/convention/stepper/stepper';
import { Compte } from './pages/convention/steps/compte/compte';
import { GestionComponent } from './gestion/gestion.component';

export const routes: Routes = [
    { path: '', component: GestionComponent },
    {
        path: 'convention',
        component: Stepper,
        children: [
            { path: '', redirectTo: 'compte', pathMatch: 'full' },
            { path: 'compte', component: Compte }
        ]
    }
];
