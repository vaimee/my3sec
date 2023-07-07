import { NgModule } from '@angular/core';
import { RouterModule, Routes } from '@angular/router';

import { LogHoursComponent } from './components/log-hours/log-hours.component';
import { ProfileBodyComponent } from './components/profile-body/profile-body.component';

const routes: Routes = [
  {
    path: '',
    redirectTo: 'me',
    pathMatch: 'full',
  },
  { path: 'me', component: ProfileBodyComponent, data: { useDefaultProfile: true } },
  { path: 'log-hours', component: LogHoursComponent },
  { path: ':userId', component: ProfileBodyComponent, data: { useDefaultProfile: false } },
];

@NgModule({
  imports: [RouterModule.forChild(routes)],
  exports: [RouterModule],
})
export class ProfilesRoutingModule {}

export const routedComponents = [ProfileBodyComponent, LogHoursComponent];
