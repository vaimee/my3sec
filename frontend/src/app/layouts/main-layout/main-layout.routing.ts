import { Routes } from "@angular/router";

export const MainLayoutRoutes: Routes = [
    { path: '', redirectTo: '/profile', pathMatch: 'full' },
    { path: 'profile', loadChildren: () => import('../../modules/profile/profile.module').then(m => m.ProfileModule) },
    { path: '**', redirectTo: '/profile', pathMatch: 'full' },
];
