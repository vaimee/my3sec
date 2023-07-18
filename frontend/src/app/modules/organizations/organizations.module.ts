import { CommonModule } from '@angular/common';
import { NgModule } from '@angular/core';
import { FormsModule, ReactiveFormsModule } from '@angular/forms';

import { SharedModule } from '@shared/shared.module';

import { ProjectsModule } from '@projects/projects.module';

import { OrganizationListSummaryComponent } from './components/organization-list-summary/organization-list-summary.component';
import { OrganizationListComponent } from './components/organization-list/organization-list.component';
import { ShowMembersComponent } from './components/show-members/show-members.component';
import { OrganizationsRoutingModule, routedComponents } from './organizations-routing.module';

@NgModule({
  declarations: [routedComponents, ShowMembersComponent, OrganizationListSummaryComponent],
  exports: [OrganizationListComponent, OrganizationListSummaryComponent],
  imports: [CommonModule, SharedModule, OrganizationsRoutingModule, ProjectsModule, FormsModule, ReactiveFormsModule],
})
export class OrganizationsModule {}
