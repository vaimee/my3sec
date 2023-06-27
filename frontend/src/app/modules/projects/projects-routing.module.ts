import { NgModule } from '@angular/core';
import { RouterModule, Routes } from '@angular/router';

import { CreateProjectComponent } from './components/create/create-project.component';
import { ProjectListComponent } from './components/project-list/project-list.component';
import { ProjectComponent } from './components/project/project.component';
import { ProjectsComponent } from './projects.component';

const routes: Routes = [
  {
    path: '',
    component: ProjectsComponent,
    children: [
      { path: '', component: ProjectListComponent },
      { path: 'new', component: CreateProjectComponent },
      {
        path: ':id/tasks',
        loadChildren: () => import('../tasks/tasks.module').then(m => m.TasksModule),
      },
      {
        path: ':id',
        component: ProjectComponent,
      },
    ],
  },
];

@NgModule({
  imports: [RouterModule.forChild(routes)],
  exports: [RouterModule],
})
export class ProjectsRoutingModule {}

export const routedComponents = [ProjectsComponent, ProjectListComponent, ProjectComponent, CreateProjectComponent];
