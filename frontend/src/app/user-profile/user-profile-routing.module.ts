import { NgModule } from '@angular/core';
import { RouterModule, Routes } from '@angular/router';
import { ProfileBodyComponent } from './components/profile-body/profile-body.component';

const routes: Routes = [
  { path: '', redirectTo: 'profile/my-profile', pathMatch: 'full' },
  { path: 'profile/my-profile', component: ProfileBodyComponent, data: { useDefaultProfile: true } },
  { path: 'profile/:userId', component: ProfileBodyComponent, data: { useDefaultProfile: false } },
];

@NgModule({
  imports: [RouterModule.forChild(routes)],
  exports: [RouterModule]
})
export class UserProfileRoutingModule { }
