import { CommonModule } from '@angular/common';
import { NgModule } from '@angular/core';

import { SharedModule } from '@shared/shared.module';

import { TasksModule } from '../tasks/tasks.module';
import { ProjectListComponent } from './components/project-list/project-list.component';
import { ProjectsRoutingModule, routedComponents } from './projects-routing.module';

@NgModule({
  declarations: [routedComponents],
  imports: [CommonModule, SharedModule, ProjectsRoutingModule, TasksModule],
  exports: [ProjectListComponent],
})
export class ProjectsModule {}
