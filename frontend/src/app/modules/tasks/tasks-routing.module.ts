import { NgModule } from '@angular/core';
import { RouterModule, Routes } from '@angular/router';

import { LogHoursComponent } from './log-hours/log-hours.component';
import { TaskListComponent } from './task-list/task-list.component';
import { TasksComponent } from './tasks.component';
import { TaskComponent } from './task/task.component';

const routes: Routes = [
  {
    path: '',
    component: TasksComponent,
    children: [
      { path: '', component: TaskListComponent },
      { path: 'log-hours', component: LogHoursComponent },
      {
        path: ':id',
        component: TaskComponent,
      },
    ],
  },
];

@NgModule({
  imports: [RouterModule.forChild(routes)],
  exports: [RouterModule],
})
export class TasksRoutingModule {}

export const routedComponents = [TasksComponent];
