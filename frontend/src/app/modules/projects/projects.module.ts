import { CommonModule } from '@angular/common';
import { NgModule } from '@angular/core';
import { FormsModule, ReactiveFormsModule } from '@angular/forms';

import { SharedModule } from '@shared/shared.module';

import { TasksModule } from '../tasks/tasks.module';
import { CreateProjectComponent } from './components/create/create-project.component';
import { ProjectListComponent } from './components/project-list/project-list.component';
import { ProjectsRoutingModule, routedComponents } from './projects-routing.module';

@NgModule({
  declarations: [routedComponents],
  imports: [CommonModule, SharedModule, ProjectsRoutingModule, TasksModule, FormsModule, ReactiveFormsModule],
  exports: [ProjectListComponent],
})
export class ProjectsModule {}
