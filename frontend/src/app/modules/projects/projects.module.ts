import { CommonModule } from '@angular/common';
import { NgModule } from '@angular/core';
import { FormsModule, ReactiveFormsModule } from '@angular/forms';

import { SharedModule } from '@shared/shared.module';

import { TasksModule } from '../tasks/tasks.module';
import { ProjectListComponent } from './components/project-list/project-list.component';
import { ShowMembersComponent } from './components/show-members/show-members.component';
import { ProjectsRoutingModule, routedComponents } from './projects-routing.module';

@NgModule({
  declarations: [routedComponents, ShowMembersComponent],
  imports: [CommonModule, SharedModule, ProjectsRoutingModule, TasksModule, FormsModule, ReactiveFormsModule],
  exports: [ProjectListComponent],
})
export class ProjectsModule {}
