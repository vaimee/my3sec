import { NgModule } from '@angular/core';
import { RouterModule, Routes } from '@angular/router';

import { CreateOrganizationComponent } from './components/create/create-organization.component';
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
        path: ':id',
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
  OrganizationsComponent,
  OrganizationListComponent,
  OrganizationComponent,
  CreateOrganizationComponent,
];
