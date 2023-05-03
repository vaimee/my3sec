import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';

import { UserProfileRoutingModule } from './user-profile-routing.module';
import { ProfileBodyComponent } from './components/profile-body/profile-body.component';
import { ProfileHeaderComponent } from './components/profile-header/profile-header.component';
import { MaterialModule } from 'app/material/material.module';
import { SharedModule } from 'app/shared/shared.module';
import { SkillsComponent } from './components/skills/skills.component';
import { CertificatesComponent } from './components/certificates/certificates.component';
import { ProjectsComponent } from './components/projects/projects.component';

@NgModule({
  declarations: [
    ProfileBodyComponent,
    ProfileHeaderComponent,
    SkillsComponent,
    CertificatesComponent,
    ProjectsComponent,
  ],
  imports: [
    CommonModule,
    UserProfileRoutingModule,
    MaterialModule,
    SharedModule,
  ],
})
export class UserProfileModule {}
