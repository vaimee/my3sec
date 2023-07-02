import { CommonModule } from '@angular/common';
import { NgModule } from '@angular/core';
import { FormsModule, ReactiveFormsModule } from '@angular/forms';

import { SharedModule } from '@shared/shared.module';

import { TaskListComponent } from './task-list/task-list.component';
import { TasksRoutingModule, routedComponents } from './tasks-routing.module';

@NgModule({
  declarations: [routedComponents, TaskListComponent],
  exports: [TaskListComponent],
  imports: [CommonModule, SharedModule, TasksRoutingModule, FormsModule, ReactiveFormsModule],
})
export class TasksModule {}
