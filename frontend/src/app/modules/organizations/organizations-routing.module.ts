import { NgModule } from '@angular/core';
import { RouterModule, Routes } from '@angular/router';

import { managerGuard } from '@auth/guards';

import { CreateOrganizationComponent } from './components/create/create-organization.component';
import { IssueCertificateComponent } from './components/issue-certificate/issue-certificate.component';
import { OrganizationListComponent } from './components/organization-list/organization-list.component';
import { OrganizationComponent } from './components/organization/organization.component';
import { OrganizationsComponent } from './organizations.component';

const routes: Routes = [
  {
    path: '',
    component: OrganizationsComponent,
    children: [
      { path: '', component: OrganizationListComponent },
      { path: 'new', component: CreateOrganizationComponent },
      {
        path: ':address/projects',
        loadChildren: () => import('../projects/projects.module').then(m => m.ProjectsModule),
      },
      {
        path: ':address/issue-certificate',
        component: IssueCertificateComponent,
        canActivate: [managerGuard],
      },
      {
        path: ':address',
        component: OrganizationComponent,
      },
    ],
  },
];

@NgModule({
  imports: [RouterModule.forChild(routes)],
  exports: [RouterModule],
})
export class OrganizationsRoutingModule {}

export const routedComponents = [
  IssueCertificateComponent,
  OrganizationsComponent,
  OrganizationListComponent,
  OrganizationComponent,
  CreateOrganizationComponent,
];
