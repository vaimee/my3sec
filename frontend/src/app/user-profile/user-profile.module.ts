import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';

import { UserProfileRoutingModule } from './user-profile-routing.module';
import { ProfileHeaderComponent } from './components/profile-header/profile-header.component';
import { ProfileBodyComponent } from './components/profile-body/profile-body.component';


@NgModule({
  declarations: [
    ProfileHeaderComponent,
    ProfileBodyComponent
  ],
  imports: [
    CommonModule,
    UserProfileRoutingModule
  ]
})
export class UserProfileModule { }
