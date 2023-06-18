import { CommonModule } from '@angular/common';
import { NgModule } from '@angular/core';
import { FormsModule, ReactiveFormsModule } from '@angular/forms';

import { SharedModule } from '@shared/shared.module';

import { CreateTaskComponent } from './create/create-task.component';
import { LogHoursComponent } from './log-hours/log-hours.component';
import { TaskListComponent } from './task-list/task-list.component';
import { TaskComponent } from './task/task.component';
import { TasksRoutingModule } from './tasks-routing.module';
import { TasksComponent } from './tasks.component';

@NgModule({
  declarations: [TasksComponent, TaskComponent, TaskListComponent, CreateTaskComponent, LogHoursComponent],
  imports: [CommonModule, SharedModule, TasksRoutingModule, FormsModule, ReactiveFormsModule],
})
export class TasksModule {}
