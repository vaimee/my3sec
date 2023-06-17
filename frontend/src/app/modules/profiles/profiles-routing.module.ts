import { NgModule } from '@angular/core';
import { RouterModule, Routes } from '@angular/router';

import { ProfileBodyComponent } from './components/profile-body/profile-body.component';

const routes: Routes = [
  {
    path: '',
    redirectTo: 'me',
    pathMatch: 'full',
  },
  { path: 'me', component: ProfileBodyComponent, data: { useDefaultProfile: true } },
  { path: ':userId', component: ProfileBodyComponent, data: { useDefaultProfile: false } },
];

@NgModule({
  imports: [RouterModule.forChild(routes)],
  exports: [RouterModule],
})
export class ProfilesRoutingModule {}
