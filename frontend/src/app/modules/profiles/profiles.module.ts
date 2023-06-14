import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';

import { ProfilesRoutingModule } from './profiles-routing.module';
import { ProfileBodyComponent } from './components/profile-body/profile-body.component';
import { ProfileHeaderComponent } from './components/profile-header/profile-header.component';
import { SharedModule } from './../../shared/shared.module';
import { SkillsComponent } from './components/skills/skills.component';
import { CertificatesComponent } from './components/certificates/certificates.component';
import { ProjectsComponent } from './components/projects/projects.component';
import { ReactiveFormsModule } from '@angular/forms';

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
    ProfilesRoutingModule,
    SharedModule,
    ReactiveFormsModule,
  ],
})
export class ProfilesModule {}
