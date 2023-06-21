import { MarkdownModule } from 'ngx-markdown';

import { CommonModule } from '@angular/common';
import { NgModule } from '@angular/core';
import { FormsModule, ReactiveFormsModule } from '@angular/forms';

import { SharedModule } from '@shared/shared.module';

import { ShowStatusComponent } from './show-status/show-status.component';
import { TaskListComponent } from './task-list/task-list.component';
import { TasksRoutingModule, routedComponents } from './tasks-routing.module';

@NgModule({
  declarations: [routedComponents, TaskListComponent, ShowStatusComponent],
  exports: [TaskListComponent],
  imports: [MarkdownModule.forRoot(), CommonModule, SharedModule, TasksRoutingModule, FormsModule, ReactiveFormsModule],
})
export class TasksModule {}
