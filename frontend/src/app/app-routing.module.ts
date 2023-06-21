import { NgModule } from '@angular/core';
import { RouterModule, Routes } from '@angular/router';

import { metamaskLoginGuard } from '@auth/guards/metamask-login.guard';
import { metamaskNotInstalledGuard } from '@auth/guards/metamask-not-installed.guard';
import { my3secLoginGuard } from '@auth/guards/my3sec-login.guard';
import { rightChainGuard } from '@auth/guards/right-chain.guard';

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
      {
        path: 'tasks',
        loadChildren: () => import('./modules/tasks/tasks.module').then(m => m.TasksModule),
      },
      {
        path: 'projects',
        loadChildren: () => import('./modules/projects/projects.module').then(m => m.ProjectsModule),
      },
    ],
    canActivate: [metamaskNotInstalledGuard, metamaskLoginGuard, rightChainGuard, my3secLoginGuard],
  },
  {
    path: 'auth',
    loadChildren: () => import('./auth/auth.module').then(m => m.AuthModule),
  },
  {
    path: '**',
    component: PageNotFoundComponent,
  },
];

@NgModule({
  imports: [RouterModule.forRoot(routes)],
  exports: [RouterModule],
})
export class AppRoutingModule {}
