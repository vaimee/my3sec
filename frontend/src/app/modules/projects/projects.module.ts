import { CommonModule } from '@angular/common';
import { NgModule } from '@angular/core';

import { SharedModule } from '@shared/shared.module';

import { ProjectsRoutingModule, routedComponents } from './projects-routing.module';
import { ProjectListComponent } from './components/project-list/project-list.component';

@NgModule({
  declarations: [routedComponents],
  imports: [CommonModule, SharedModule, ProjectsRoutingModule],
  exports: [ProjectListComponent],
})
export class ProjectsModule {}
