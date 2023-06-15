import { CommonModule } from '@angular/common';
import { NgModule } from '@angular/core';

import { SharedModule } from '@shared/shared.module';

import { ProjectsModule } from '@projects/projects.module';

import { OrganizationsRoutingModule, routedComponents } from './organizations-routing.module';

@NgModule({
  declarations: [routedComponents],
  imports: [CommonModule, SharedModule, OrganizationsRoutingModule, ProjectsModule],
})
export class OrganizationsModule {}
