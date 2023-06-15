import { CommonModule } from '@angular/common';
import { NgModule } from '@angular/core';

import { SharedModule } from '@shared/shared.module';

import { ProjectsRoutingModule, routedComponents } from './projects-routing.module';

@NgModule({
  declarations: [routedComponents],
  imports: [CommonModule, SharedModule, ProjectsRoutingModule],
})
export class ProjectsModule {}
