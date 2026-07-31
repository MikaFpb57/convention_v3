import { Routes } from '@angular/router';
import { Stepper } from './pages/convention/stepper/stepper';
import { LoginComponent } from './pages/login/login.component';
import { authGuard } from './guards/auth.guard';
import { UnsavedChangesGuard } from './guards/unsaved-changes.guard';

import { GestionComponent } from './gestion/gestion.component';

export const routes: Routes = [
    { path: 'login', component: LoginComponent },
    { path: '', redirectTo: '/login', pathMatch: 'full' },
    {
        path: 'gestion',
        component: GestionComponent,
        canActivate: [authGuard]
    },
    {
        path: 'convention',
        component: Stepper,
        canActivate: [authGuard],
        canDeactivate: [UnsavedChangesGuard]
    },
    {
        path: 'convention/:id',
        component: Stepper,
        canActivate: [authGuard],
        canDeactivate: [UnsavedChangesGuard]
    }
];
