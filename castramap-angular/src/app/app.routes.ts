import { Routes } from '@angular/router';
import { DashboardOverviewComponent } from './pages/dashboard-overview/dashboard-overview.component';
import { CatProfileDetailsComponent } from './pages/cat-profile-details/cat-profile-details.component';
import { CatRegistryListComponent } from './pages/cat-registry-list/cat-registry-list.component';
import { InteractiveCatMapComponent } from './pages/interactive-cat-map/interactive-cat-map.component';
import { CatRegistrationFormComponent } from './pages/cat-registration-form/cat-registration-form.component';
import { NotFoundComponent } from './pages/not-found/not-found.component';

export const routes: Routes = [
    { path: '', component: DashboardOverviewComponent },
    { path: 'dashboard-overview', component: DashboardOverviewComponent },
    { path: 'cat-profile-details/:id', component: CatProfileDetailsComponent },
    { path: 'cat-registry-list', component: CatRegistryListComponent },
    { path: 'interactive-cat-map', component: InteractiveCatMapComponent },
    { path: 'cat-registration-form', component: CatRegistrationFormComponent },
    { path: '**', component: NotFoundComponent }
];
