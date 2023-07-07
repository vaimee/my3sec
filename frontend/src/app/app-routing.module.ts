import { NgModule } from '@angular/core';
import { ExtraOptions, RouterModule, Routes } from '@angular/router';

import { metamaskCheck, my3secLoginGuard } from '@auth/guards';

import { LayoutComponent } from '@shared/components/layout/layout.component';
import { PageNotFoundComponent } from '@shared/components/page-not-found/page-not-found.component';

const routes: Routes = [
  {
    path: '',
    component: LayoutComponent,
    children: [
      {
        path: '',
        redirectTo: '/profiles/me',
        pathMatch: 'full',
      },
      {
        path: 'profiles',
        loadChildren: () => import('./modules/profiles/profiles.module').then(m => m.ProfilesModule),
      },
      {
        path: 'organizations',
        loadChildren: () => import('./modules/organizations/organizations.module').then(m => m.OrganizationsModule),
      },
    ],
    canActivate: [metamaskCheck, my3secLoginGuard],
  },
  {
    path: 'auth',
    loadChildren: () => import('./auth/auth.module').then(m => m.AuthModule),
  },
  {
    path: 'page-not-found',
    component: PageNotFoundComponent,
  },
  {
    path: '**',
    redirectTo: '/page-not-found',
  },
];

const routingConfiguration: ExtraOptions = {
  paramsInheritanceStrategy: 'always',
};

@NgModule({
  imports: [RouterModule.forRoot(routes, routingConfiguration)],
  exports: [RouterModule],
})
export class AppRoutingModule {}
