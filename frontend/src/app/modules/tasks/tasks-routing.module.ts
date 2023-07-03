import { NgModule } from '@angular/core';
import { RouterModule, Routes } from '@angular/router';

import { managerGuard } from '@auth/guards/manager.guard';

import { CreateTaskComponent } from './components/create/create-task.component';
import { LogHoursComponent } from './components/log-hours/log-hours.component';
import { TaskComponent } from './components/task/task.component';
import { TasksComponent } from './tasks.component';

const routes: Routes = [
  {
    path: '',
    component: TasksComponent,
    children: [
      { path: 'log-hours', component: LogHoursComponent },
      { path: 'new', component: CreateTaskComponent, canActivate: [managerGuard] },
      {
        path: ':taskId',
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

export const routedComponents = [TasksComponent, LogHoursComponent, TaskComponent, CreateTaskComponent];
