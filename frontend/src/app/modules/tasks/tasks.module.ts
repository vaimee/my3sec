import { CommonModule } from '@angular/common';
import { NgModule } from '@angular/core';
import { FormsModule, ReactiveFormsModule } from '@angular/forms';

import { SharedModule } from '@shared/shared.module';

import { KpiEvaluationComponent } from './components/kpi-evaluation/kpi-evaluation.component';
import { LogHoursDialogComponent } from './components/log-hours-dialog/log-hours-dialog.component';
import { ShowMembersComponent } from './components/show-members/show-members.component';
import { TaskListComponent } from './components/task-list/task-list.component';
import { TasksRoutingModule, routedComponents } from './tasks-routing.module';

@NgModule({
  declarations: [
    routedComponents,
    TaskListComponent,
    LogHoursDialogComponent,
    ShowMembersComponent,
    KpiEvaluationComponent,
  ],
  exports: [TaskListComponent],
  imports: [CommonModule, SharedModule, TasksRoutingModule, FormsModule, ReactiveFormsModule],
})
export class TasksModule {}
